import { z } from 'zod';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useStoryStore } from '@/lib/stores/storyStore';
import { Encounter, EncounterState, HumanityIndex } from './encounters';
import { Item } from './items';
import { ExtendedDialogueNode } from './extendedDialogue';

// Narrative Manager - Central system for story progression
export class NarrativeManager {
  private encounterState: EncounterState;
  private humanityIndex: HumanityIndex;
  private temporalFragments: Set<string>;
  private hiddenKnowledge: Set<string>;
  
  constructor() {
    this.encounterState = {
      activeEncounters: [],
      completedEncounters: [],
      encounterProgress: {},
      temporalFragments: [],
      hiddenKnowledge: [],
      mapSymbols: [],
    };
    
    this.humanityIndex = {
      current: 50,
      history: [],
      thresholds: {
        soulless: -50,
        struggling: 0,
        human: 50,
        saint: 80,
      },
    };
    
    this.temporalFragments = new Set();
    this.hiddenKnowledge = new Set();
  }
  
  // Check if an encounter should trigger
  checkEncounterTriggers(
    playerState: any,
    location: { x: number; y: number },
    timeElapsed: number
  ): Encounter | null {
    // Check Old Timer's 13-minute rule
    if (timeElapsed % (13 * 60) < 60) { // Within a minute of 13-minute mark
      if (!this.hasCompletedEncounter('old_timer_4')) {
        return this.getOldTimerEncounter();
      }
    }
    
    // Check location-based encounters
    if (location.x === 7 && location.y === 13) { // Cage house coordinates
      if (!this.hasCompletedEncounter('birthday_cake_quest')) {
        return this.getBirthdayEncounter();
      }
    }
    
    // Check random encounters based on humanity index
    if (Math.random() < this.getRandomEncounterChance()) {
      return this.getRandomEncounter();
    }
    
    return null;
  }
  
  // Process player choice in encounter
  processEncounterChoice(
    encounter: Encounter,
    choice: any,
    playerTraits: string[]
  ): {
    success: boolean;
    consequences: string[];
    rewards: any;
    nextEncounter?: string;
  } {
    // Check requirements
    if (choice.requirement) {
      if (choice.requirement.trait && !playerTraits.includes(choice.requirement.trait)) {
        return { success: false, consequences: ['requirement_not_met'], rewards: {} };
      }
      
      if (choice.requirement.humanityIndex && this.humanityIndex.current < choice.requirement.humanityIndex) {
        return { success: false, consequences: ['humanity_too_low'], rewards: {} };
      }
    }
    
    // Apply outcomes
    const result = {
      success: true,
      consequences: choice.outcome.consequences || [],
      rewards: choice.outcome.rewards || {},
      nextEncounter: choice.outcome.nextEncounter,
    };
    
    // Update humanity index
    if (choice.outcome.rewards?.humanityIndex) {
      this.adjustHumanityIndex(
        choice.outcome.rewards.humanityIndex,
        `Choice: ${choice.text}`
      );
    }
    
    // Add knowledge
    if (choice.outcome.rewards?.knowledge) {
      choice.outcome.rewards.knowledge.forEach((k: string) => {
        this.hiddenKnowledge.add(k);
      });
    }
    
    // Handle special consequences
    this.processSpecialConsequences(choice.outcome.consequences || []);
    
    return result;
  }
  
  // Humanity Index Management
  adjustHumanityIndex(amount: number, reason: string) {
    const newValue = Math.max(-100, Math.min(100, this.humanityIndex.current + amount));
    
    this.humanityIndex.history.push({
      change: amount,
      reason,
      timestamp: Date.now(),
    });
    
    this.humanityIndex.current = newValue;
    
    // Check threshold transitions
    this.checkHumanityThresholds(newValue);
  }
  
  private checkHumanityThresholds(value: number) {
    const { thresholds } = this.humanityIndex;
    
    if (value <= thresholds.soulless) {
      this.triggerSoullessPath();
    } else if (value >= thresholds.saint) {
      this.triggerSaintPath();
    }
  }
  
  // Special path triggers
  private triggerSoullessPath() {
    // Player has lost humanity
    useGameStore.getState().addNotification({
      type: 'warning',
      message: 'You feel nothing. The numbers are all that matter now.',
    });
    
    // Unlock corporate sympathizer options
    this.hiddenKnowledge.add('corporate_mindset');
    
    // Change available encounters
    this.encounterState.activeEncounters.push('corporate_recruitment');
  }
  
  private triggerSaintPath() {
    // Player maintains high humanity
    useGameStore.getState().addNotification({
      type: 'success',
      message: 'Your kindness illuminates the darkness. Others begin to hope.',
    });
    
    // Unlock mutual aid network
    this.hiddenKnowledge.add('underground_network');
    
    // People seek you out
    this.encounterState.activeEncounters.push('community_organizer');
  }
  
  // Temporal mechanics
  collectTemporalFragment(fragmentId: string) {
    this.temporalFragments.add(fragmentId);
    
    if (this.temporalFragments.size === 4) {
      // All fragments collected - Old Timer becomes coherent
      this.unlockCoherentOldTimer();
    }
  }
  
  private unlockCoherentOldTimer() {
    this.hiddenKnowledge.add('old_timer_identity');
    this.hiddenKnowledge.add('algorithm_source_location');
    this.encounterState.activeEncounters.push('old_timer_coherent');
  }
  
  // Partnership stage tracking
  getPartnershipStage(): number {
    const { missionsCompleted, currentTips } = useGameStore.getState();
    const { partners } = usePartnerStore.getState();
    
    // Stage calculation based on multiple factors
    if (missionsCompleted < 10) return 1; // Hope
    if (currentTips < 500 && missionsCompleted > 30) return 3; // Desperation
    if (partners.some(p => p.rarity === 'legendary')) return 4; // Transformation risk
    
    return 2; // Realization (default)
  }
  
  // Story integration
  integrateWithStoryStore() {
    const storyStore = useStoryStore.getState();
    
    // Sync story flags with hidden knowledge
    storyStore.storyFlags.forEach(flag => {
      this.hiddenKnowledge.add(flag);
    });
    
    // Update relationships based on humanity
    if (this.humanityIndex.current > 75) {
      storyStore.updateRelationship('mateo', 20);
      storyStore.updateRelationship('kai', 15);
    } else if (this.humanityIndex.current < 25) {
      storyStore.updateRelationship('whix_manager', 10);
      storyStore.updateRelationship('tania', -20);
    }
  }
  
  // Helper methods
  private hasCompletedEncounter(encounterId: string): boolean {
    return this.encounterState.completedEncounters.includes(encounterId);
  }
  
  private getOldTimerEncounter(): Encounter {
    const stage = (this.encounterState.encounterProgress['old_timer'] || 0) + 1;
    // Return appropriate Old Timer encounter based on stage
    return {} as Encounter; // Placeholder
  }
  
  private getBirthdayEncounter(): Encounter {
    // Return Mateo's birthday encounter
    return {} as Encounter; // Placeholder
  }
  
  private getRandomEncounter(): Encounter {
    // Select random encounter based on current game state
    return {} as Encounter; // Placeholder
  }
  
  private getRandomEncounterChance(): number {
    // Higher humanity = more helpful encounters
    // Lower humanity = more hostile encounters
    return 0.1 + (Math.abs(50 - this.humanityIndex.current) / 500);
  }
  
  private processSpecialConsequences(consequences: string[]) {
    consequences.forEach(consequence => {
      switch (consequence) {
        case 'old_timer_confused':
          // Old Timer vanishes for 13 minutes
          break;
        case 'map_symbol_revealed':
          // Add symbol to map
          this.encounterState.mapSymbols.push({
            location: { x: 13, y: 13 },
            symbol: 'temporal_anchor',
            revealed: true,
          });
          break;
        case 'tania_breakdown_temporary':
          // Tania becomes briefly human
          useGameStore.getState().addNotification({
            type: 'info',
            message: 'For 13 seconds, you see the real Tania.',
          });
          break;
      }
    });
  }
}

// Export singleton instance
export const narrativeManager = new NarrativeManager();