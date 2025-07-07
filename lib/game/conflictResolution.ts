import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ConflictType = 
  | 'corporate_harassment'
  | 'data_theft'
  | 'psychological_manipulation'
  | 'surveillance_pressure'
  | 'conditioning_attempt'
  | 'neural_interference'
  | 'pattern_disruption'
  | 'social_sabotage';

export type CharacterTrait = 
  | 'hyperfocus'
  | 'pattern_recognition'
  | 'systematic_thinking'
  | 'attention_to_detail'
  | 'enhanced_senses'
  | 'routine_mastery'
  | 'trauma_response'
  | 'dissociation'
  | 'neural_tracking'
  | 'predictive_behavior';

export interface ConflictScenario {
  id: string;
  type: ConflictType;
  title: string;
  description: string;
  enemies: string[];
  traditionalCombatAvailable: boolean;
  resolutionOptions: ConflictResolution[];
  consequences: {
    success: { humanity: number; experience: number; tips: number };
    failure: { humanity: number; stress: number };
  };
}

export interface ConflictResolution {
  id: string;
  name: string;
  description: string;
  requiredTrait: CharacterTrait;
  requiredCharacter?: string;
  successConditions: {
    minTraitMastery: number;
    requiredItems?: string[];
    storylineFlags?: string[];
  };
  resolutionText: string;
  mechanicType: 'expose' | 'negotiate' | 'redirect' | 'analyze' | 'empathize' | 'destabilize';
}

export interface ActiveConflict {
  scenario: ConflictScenario;
  availableResolutions: ConflictResolution[];
  attemptedResolutions: string[];
  escalationLevel: number;
  timeRemaining: number;
}

export interface ConflictResolutionState {
  activeConflicts: ActiveConflict[];
  resolvedConflicts: string[];
  conflictHistory: { scenarioId: string; resolution: string; success: boolean; timestamp: number }[];
  
  // Actions
  initializeConflict: (scenario: ConflictScenario) => void;
  attemptResolution: (conflictId: string, resolutionId: string, character: any) => boolean;
  escalateConflict: (conflictId: string) => void;
  resolveConflict: (conflictId: string, success: boolean) => void;
  getAvailableResolutions: (conflictId: string, availableCharacters: any[]) => ConflictResolution[];
}

// Predefined conflict scenarios based on story content
export const CONFLICT_SCENARIOS: ConflictScenario[] = [
  {
    id: 'watcher_stalking',
    type: 'surveillance_pressure',
    title: 'The Watcher\'s Pursuit',
    description: 'Marcus Dietrich has been tracking your movements, predicting your routes with his neural interface.',
    enemies: ['the_watcher'],
    traditionalCombatAvailable: false,
    resolutionOptions: [
      {
        id: 'pattern_chaos',
        name: 'Break Prediction Patterns',
        description: 'Use hyperfocus to identify and deliberately break your behavioral patterns',
        requiredTrait: 'hyperfocus',
        requiredCharacter: 'tania-volkov',
        successConditions: { minTraitMastery: 60 },
        resolutionText: 'Your hyperfocus turns inward, mapping your own patterns and deliberately shattering them. Random movements confuse his algorithms.',
        mechanicType: 'destabilize'
      },
      {
        id: 'pattern_recognition_counter',
        name: 'Predict the Predictor',
        description: 'Use pattern recognition to anticipate his surveillance methods',
        requiredTrait: 'pattern_recognition',
        successConditions: { minTraitMastery: 70 },
        resolutionText: 'You recognize the meta-pattern in his tracking. By understanding his algorithms, you can feed him false data.',
        mechanicType: 'redirect'
      }
    ],
    consequences: {
      success: { humanity: 10, experience: 200, tips: 500 },
      failure: { humanity: -5, stress: 30 }
    }
  },
  {
    id: 'vera_conditioning',
    type: 'psychological_manipulation',
    title: 'Vera\'s Broken State',
    description: 'Vera Kozlova approaches you with corporate compliance, but something in her eyes suggests she needs help.',
    enemies: ['corporate_handler'],
    traditionalCombatAvailable: true,
    resolutionOptions: [
      {
        id: 'trauma_recognition',
        name: 'Recognize Hidden Trauma',
        description: 'Use enhanced senses to read the micro-expressions that reveal her true state',
        requiredTrait: 'enhanced_senses',
        requiredCharacter: 'elena-vasquez',
        successConditions: { minTraitMastery: 50 },
        resolutionText: 'Your enhanced senses detect the subtle tells - the forced smile, the tremor in her voice. You address her hidden self.',
        mechanicType: 'empathize'
      },
      {
        id: 'systematic_deprogramming',
        name: 'Logical Deconstruction',
        description: 'Use systematic thinking to expose the logical flaws in her conditioning',
        requiredTrait: 'systematic_thinking',
        requiredCharacter: 'marcus-chen',
        successConditions: { minTraitMastery: 65 },
        resolutionText: 'Your analytical mind dissects the conditioning logic, showing her the contradictions that prove it\'s manipulation.',
        mechanicType: 'expose'
      }
    ],
    consequences: {
      success: { humanity: 15, experience: 300, tips: 750 },
      failure: { humanity: -10, stress: 25 }
    }
  },
  {
    id: 'corporate_interrogation',
    type: 'corporate_harassment',
    title: 'Director Chen\'s Questions',
    description: 'Director Chen corners you for an \'informal productivity assessment\' - really an interrogation about resistance activities.',
    enemies: ['director_chen', 'corporate_security'],
    traditionalCombatAvailable: false,
    resolutionOptions: [
      {
        id: 'routine_mastery_deflection',
        name: 'Perfect Compliance Performance',
        description: 'Use routine mastery to perfectly mimic expected corporate behavior',
        requiredTrait: 'routine_mastery',
        successConditions: { minTraitMastery: 55 },
        resolutionText: 'Your mastery of routines lets you perform corporate compliance so perfectly it becomes camouflage.',
        mechanicType: 'redirect'
      },
      {
        id: 'attention_detail_misdirection',
        name: 'Overwhelming Detail',
        description: 'Use attention to detail to flood them with irrelevant but accurate information',
        requiredTrait: 'attention_to_detail',
        successConditions: { minTraitMastery: 60 },
        resolutionText: 'You overwhelm them with precisely accurate but completely irrelevant delivery statistics until they give up.',
        mechanicType: 'destabilize'
      }
    ],
    consequences: {
      success: { humanity: 5, experience: 150, tips: 400 },
      failure: { humanity: -8, stress: 35 }
    }
  },
  {
    id: 'data_corruption_attack',
    type: 'data_theft',
    title: 'Neural Interface Hack',
    description: 'Corporate hackers are trying to steal neural pattern data directly from your interface.',
    enemies: ['ice_program', 'data_thief'],
    traditionalCombatAvailable: true,
    resolutionOptions: [
      {
        id: 'hyperfocus_firewall',
        name: 'Mental Firewall',
        description: 'Use hyperfocus to create an impenetrable mental barrier',
        requiredTrait: 'hyperfocus',
        successConditions: { minTraitMastery: 70, requiredItems: ['neural_stabilizer'] },
        resolutionText: 'Your hyperfocus creates a singular point of concentration that no external program can penetrate.',
        mechanicType: 'redirect'
      },
      {
        id: 'systematic_counter_hack',
        name: 'Logical Counter-Attack',
        description: 'Use systematic thinking to turn their own intrusion methods against them',
        requiredTrait: 'systematic_thinking',
        successConditions: { minTraitMastery: 75 },
        resolutionText: 'You systematically analyze their attack patterns and redirect their own tools to corrupt their systems.',
        mechanicType: 'expose'
      }
    ],
    consequences: {
      success: { humanity: 8, experience: 250, tips: 600 },
      failure: { humanity: -12, stress: 40 }
    }
  }
];

export const useConflictResolutionStore = create<ConflictResolutionState>()( 
  immer((set, get) => ({
    activeConflicts: [],
    resolvedConflicts: [],
    conflictHistory: [],
    
    initializeConflict: (scenario) => set((state) => {
      const activeConflict: ActiveConflict = {
        scenario,
        availableResolutions: scenario.resolutionOptions,
        attemptedResolutions: [],
        escalationLevel: 0,
        timeRemaining: 300 // 5 minutes in seconds
      };
      state.activeConflicts.push(activeConflict);
    }),
    
    attemptResolution: (conflictId, resolutionId, character) => {
      const state = get();
      const conflict = state.activeConflicts.find(c => c.scenario.id === conflictId);
      const resolution = conflict?.availableResolutions.find(r => r.id === resolutionId);
      
      if (!conflict || !resolution) return false;
      
      // Check if character has required trait
      const hasRequiredTrait = character.traits?.includes(resolution.requiredTrait);
      if (!hasRequiredTrait) return false;
      
      // Check trait mastery level
      const traitMastery = character.traitMastery?.[resolution.requiredTrait] || 0;
      if (traitMastery < resolution.successConditions.minTraitMastery) return false;
      
      // Check required character if specified
      if (resolution.requiredCharacter && character.id !== resolution.requiredCharacter) {
        return false;
      }
      
      // Success - record the attempt
      set((state) => {
        const activeConflict = state.activeConflicts.find(c => c.scenario.id === conflictId);
        if (activeConflict) {
          activeConflict.attemptedResolutions.push(resolutionId);
        }
        
        state.conflictHistory.push({
          scenarioId: conflictId,
          resolution: resolutionId,
          success: true,
          timestamp: Date.now()
        });
      });
      
      return true;
    },
    
    escalateConflict: (conflictId) => set((state) => {
      const conflict = state.activeConflicts.find(c => c.scenario.id === conflictId);
      if (conflict) {
        conflict.escalationLevel += 1;
        conflict.timeRemaining = Math.max(0, conflict.timeRemaining - 60);
      }
    }),
    
    resolveConflict: (conflictId, success) => set((state) => {
      state.activeConflicts = state.activeConflicts.filter(c => c.scenario.id !== conflictId);
      if (success) {
        state.resolvedConflicts.push(conflictId);
      }
    }),
    
    getAvailableResolutions: (conflictId, availableCharacters) => {
      const state = get();
      const conflict = state.activeConflicts.find(c => c.scenario.id === conflictId);
      if (!conflict) return [];
      
      return conflict.availableResolutions.filter(resolution => {
        // Check if any available character can perform this resolution
        return availableCharacters.some(character => {
          const hasRequiredTrait = character.traits?.includes(resolution.requiredTrait);
          const sufficientMastery = (character.traitMastery?.[resolution.requiredTrait] || 0) >= resolution.successConditions.minTraitMastery;
          const correctCharacter = !resolution.requiredCharacter || character.id === resolution.requiredCharacter;
          
          return hasRequiredTrait && sufficientMastery && correctCharacter;
        });
      });
    }
  }))
);

// Helper function to determine conflict triggers based on story progress
export const getTriggeredConflicts = (storyFlags: string[], location: string): ConflictScenario[] => {
  const triggered: ConflictScenario[] = [];
  
  // Watcher appears after cathedral conspiracy discovery
  if (storyFlags.includes('cathedral_conspiracy_discovered') && location.includes('street')) {
    triggered.push(CONFLICT_SCENARIOS.find(s => s.id === 'watcher_stalking')!);
  }
  
  // Vera encounters happen in corporate areas
  if (location.includes('corporate') || location.includes('whix')) {
    triggered.push(CONFLICT_SCENARIOS.find(s => s.id === 'vera_conditioning')!);
  }
  
  // Director Chen interrogations in official settings
  if (location.includes('whix_hq') || location.includes('corporate_center')) {
    triggered.push(CONFLICT_SCENARIOS.find(s => s.id === 'corporate_interrogation')!);
  }
  
  // Data attacks during neural interface heavy activities
  if (location.includes('data_center') || location.includes('server_farm')) {
    triggered.push(CONFLICT_SCENARIOS.find(s => s.id === 'data_corruption_attack')!);
  }
  
  return triggered;
};

// Integration helper for existing combat system
export const checkConflictResolutionAvailable = (enemies: string[]): boolean => {
  return CONFLICT_SCENARIOS.some(scenario => 
    scenario.enemies.some(enemy => enemies.includes(enemy))
  );
};

export const getConflictScenarioByEnemies = (enemies: string[]): ConflictScenario | null => {
  return CONFLICT_SCENARIOS.find(scenario => 
    scenario.enemies.some(enemy => enemies.includes(enemy))
  ) || null;
};