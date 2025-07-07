import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NarrativeManager } from '@/lib/game/story/narrativeIntegration';
import { useGameStore } from '@/lib/stores/gameStore';

describe('Humanity Index System', () => {
  let narrativeManager: NarrativeManager;

  beforeEach(() => {
    narrativeManager = new NarrativeManager();
    vi.clearAllMocks();
    
    // Mock addNotification
    useGameStore.setState({
      addNotification: vi.fn(),
    });
  });

  describe('Humanity Index Adjustments', () => {
    it('starts at neutral value', () => {
      expect(narrativeManager.humanityIndex.current).toBe(50);
    });

    it('increases for acts of kindness', () => {
      narrativeManager.adjustHumanityIndex(10, 'Helped Mateo');
      expect(narrativeManager.humanityIndex.current).toBe(60);
    });

    it('decreases for exploitation', () => {
      narrativeManager.adjustHumanityIndex(-15, 'Betrayed partner trust');
      expect(narrativeManager.humanityIndex.current).toBe(35);
    });

    it('caps at maximum values', () => {
      narrativeManager.adjustHumanityIndex(200, 'Super kindness');
      expect(narrativeManager.humanityIndex.current).toBe(100);
      
      narrativeManager.adjustHumanityIndex(-300, 'Ultimate evil');
      expect(narrativeManager.humanityIndex.current).toBe(-100);
    });

    it('tracks history of changes', () => {
      narrativeManager.adjustHumanityIndex(5, 'Small kindness');
      narrativeManager.adjustHumanityIndex(-10, 'Optimization choice');
      
      expect(narrativeManager.humanityIndex.history).toHaveLength(2);
      expect(narrativeManager.humanityIndex.history[0].reason).toBe('Small kindness');
      expect(narrativeManager.humanityIndex.history[1].change).toBe(-10);
    });
  });

  describe('Threshold Effects', () => {
    it('triggers soulless path at -50', () => {
      const addNotificationMock = vi.fn();
      useGameStore.setState({ addNotification: addNotificationMock });
      
      narrativeManager.adjustHumanityIndex(-100, 'Complete corruption');
      
      expect(addNotificationMock).toHaveBeenCalledWith({
        type: 'warning',
        message: 'You feel nothing. The numbers are all that matter now.',
      });
      expect(narrativeManager.hiddenKnowledge.has('corporate_mindset')).toBe(true);
    });

    it('triggers saint path at 80+', () => {
      const addNotificationMock = vi.fn();
      useGameStore.setState({ addNotification: addNotificationMock });
      
      narrativeManager.adjustHumanityIndex(50, 'Pure altruism');
      
      expect(addNotificationMock).toHaveBeenCalledWith({
        type: 'success',
        message: 'Your kindness illuminates the darkness. Others begin to hope.',
      });
      expect(narrativeManager.hiddenKnowledge.has('underground_network')).toBe(true);
    });
  });

  describe('Choice Requirements', () => {
    it('blocks choices requiring higher humanity', () => {
      const choice = {
        id: 'kind_action',
        text: 'Help without reward',
        requirement: { humanityIndex: 75 },
        outcome: { rewards: {} },
      };
      
      // Current humanity is 50, requirement is 75
      const result = narrativeManager.processEncounterChoice(
        {} as any,
        choice,
        []
      );
      
      expect(result.success).toBe(false);
      expect(result.consequences).toContain('humanity_too_low');
    });

    it('allows choices when humanity meets requirement', () => {
      narrativeManager.adjustHumanityIndex(30, 'Good deeds');
      
      const choice = {
        id: 'kind_action',
        text: 'Help without reward',
        requirement: { humanityIndex: 75 },
        outcome: { rewards: {} },
      };
      
      const result = narrativeManager.processEncounterChoice(
        {} as any,
        choice,
        []
      );
      
      expect(result.success).toBe(true);
    });
  });

  describe('Partnership Stage Integration', () => {
    it('calculates stage based on game progress', () => {
      // Stage 1: Hope (early game)
      useGameStore.setState({ missionsCompleted: 5, currentTips: 1000 });
      expect(narrativeManager.getPartnershipStage()).toBe(1);
      
      // Stage 3: Desperation (many missions, low tips)
      useGameStore.setState({ missionsCompleted: 35, currentTips: 200 });
      expect(narrativeManager.getPartnershipStage()).toBe(3);
    });
  });

  describe('Encounter Choice Processing', () => {
    it('processes trait-based choices correctly', () => {
      const choice = {
        id: 'pattern_choice',
        text: 'Use pattern recognition',
        requirement: { trait: 'pattern_recognition' },
        outcome: {
          rewards: {
            knowledge: ['hidden_pattern'],
            humanityIndex: 5,
          },
        },
      };
      
      // Without trait
      let result = narrativeManager.processEncounterChoice(
        {} as any,
        choice,
        ['hyperfocus']
      );
      expect(result.success).toBe(false);
      
      // With trait
      result = narrativeManager.processEncounterChoice(
        {} as any,
        choice,
        ['pattern_recognition']
      );
      expect(result.success).toBe(true);
      expect(narrativeManager.hiddenKnowledge.has('hidden_pattern')).toBe(true);
    });

    it('applies multiple rewards from choices', () => {
      const choice = {
        id: 'complex_choice',
        text: 'Complex action',
        outcome: {
          rewards: {
            humanityIndex: 10,
            knowledge: ['secret1', 'secret2'],
            items: ['special_item'],
          },
          consequences: ['time_advanced'],
        },
      };
      
      const result = narrativeManager.processEncounterChoice(
        {} as any,
        choice,
        []
      );
      
      expect(narrativeManager.humanityIndex.current).toBe(60); // 50 + 10
      expect(narrativeManager.hiddenKnowledge.has('secret1')).toBe(true);
      expect(narrativeManager.hiddenKnowledge.has('secret2')).toBe(true);
      expect(result.rewards.items).toContain('special_item');
      expect(result.consequences).toContain('time_advanced');
    });
  });
});