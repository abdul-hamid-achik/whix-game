import { z } from 'zod';
import { NeurodivergentTraitSchema } from '../traits';

export const EncounterTypeSchema = z.enum([
  'old_timer',
  'birthday_wish',
  'confession_booth',
  'random_event',
  'boss_encounter',
  'hidden_scene'
]);

export type EncounterType = z.infer<typeof EncounterTypeSchema>;

export const EncounterTriggerSchema = z.object({
  type: z.enum(['time', 'location', 'item', 'story_progress', 'random']),
  condition: z.any(),
  probability: z.number().min(0).max(1).optional(),
});

export type EncounterTrigger = z.infer<typeof EncounterTriggerSchema>;

export const EncounterChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  requirement: z.object({
    trait: NeurodivergentTraitSchema.optional(),
    item: z.string().optional(),
    humanityIndex: z.number().optional(),
    previousChoice: z.string().optional(),
  }).optional(),
  outcome: z.object({
    nextEncounter: z.string().optional(),
    rewards: z.object({
      items: z.array(z.string()).optional(),
      humanityIndex: z.number().optional(),
      knowledge: z.array(z.string()).optional(),
      relationships: z.record(z.number()).optional(),
    }).optional(),
    consequences: z.array(z.string()).optional(),
  }),
});

export type EncounterChoice = z.infer<typeof EncounterChoiceSchema>;

export const EncounterSchema = z.object({
  id: z.string(),
  type: EncounterTypeSchema,
  title: z.string(),
  description: z.string(),
  triggers: z.array(EncounterTriggerSchema),
  stage: z.number().default(1),
  maxStage: z.number().default(1),
  choices: z.array(EncounterChoiceSchema),
  specialMechanics: z.array(z.string()).optional(),
  unlocks: z.array(z.string()).optional(),
});

export type Encounter = z.infer<typeof EncounterSchema>;

// The Old Timer Encounters
export const OLD_TIMER_ENCOUNTERS: Record<number, Encounter> = {
  1: {
    id: 'old_timer_1',
    type: 'old_timer',
    title: 'The Question of Time',
    description: 'An elderly man approaches, his movements stuttering like a glitched video.',
    triggers: [
      { type: 'time', condition: { minutesBefore: 13 } },
      { type: 'random', probability: 0.1 }
    ],
    stage: 1,
    maxStage: 4,
    choices: [
      {
        id: 'give_time',
        text: "It's 3:47 PM.",
        outcome: {
          rewards: {
            knowledge: ['temporal_sight_1'],
          },
          consequences: ['old_timer_confused'],
        }
      },
      {
        id: 'philosophical',
        text: "Time? Time is what Whix steals from us.",
        outcome: {
          rewards: {
            knowledge: ['temporal_sight_2'],
            humanityIndex: 5,
          },
          consequences: ['old_timer_interested'],
        }
      },
      {
        id: 'pattern_recognition',
        text: "[Pattern Recognition] You mean the time 13 minutes from now.",
        requirement: { trait: 'pattern_recognition' },
        outcome: {
          rewards: {
            knowledge: ['hidden_symbol', 'temporal_sight_2'],
            humanityIndex: 10,
          },
          consequences: ['old_timer_shocked', 'map_symbol_revealed'],
        }
      },
      {
        id: 'silence',
        text: "Say nothing",
        outcome: {
          nextEncounter: 'old_timer_3',
          consequences: ['encounter_skip'],
        }
      }
    ],
    specialMechanics: ['temporal_vision', 'encounter_tracking'],
  },
  
  4: {
    id: 'old_timer_revelation',
    type: 'old_timer',
    title: 'The Algorithm\'s Father',
    description: 'The Old Timer finally speaks clearly, his temporal fragments aligning.',
    triggers: [
      { type: 'story_progress', condition: { encounterCount: 3 } }
    ],
    stage: 4,
    maxStage: 4,
    choices: [
      {
        id: 'truth_exploitation',
        text: "It exploits workers.",
        outcome: {
          rewards: {
            knowledge: ['algorithm_time_trap'],
            humanityIndex: -5,
          }
        }
      },
      {
        id: 'truth_neighborhood',
        text: "It traps us in the neighborhood.",
        outcome: {
          rewards: {
            knowledge: ['neighborhood_is_algorithm'],
            humanityIndex: -10,
          }
        }
      },
      {
        id: 'truth_warning',
        text: "Why warn us?",
        outcome: {
          rewards: {
            knowledge: ['old_timer_identity', 'humanity_index_revealed'],
            items: ['temporal_fragment'],
          },
          consequences: ['sanity_decreased'],
        }
      }
    ],
    unlocks: ['algorithm_vision', 'tania_location_clue'],
    specialMechanics: ['reality_break', 'time_loop_awareness'],
  }
};

// Mateo's Birthday Encounters
export const BIRTHDAY_ENCOUNTERS: Record<string, Encounter> = {
  discovery: {
    id: 'birthday_discovery',
    type: 'birthday_wish',
    title: 'The Cage House',
    description: 'Sounds of arguing pierce through metal bars. A small voice sings underneath.',
    triggers: [
      { type: 'location', condition: { area: 'residential_block_7' } }
    ],
    stage: 1,
    maxStage: 3,
    choices: [
      {
        id: 'knock',
        text: "Knock on the bars",
        outcome: {
          nextEncounter: 'birthday_negotiation',
          consequences: ['parents_hostile'],
        }
      },
      {
        id: 'call_child',
        text: "Call out to the child",
        outcome: {
          nextEncounter: 'birthday_trust',
          rewards: {
            relationships: { mateo: 10 },
          }
        }
      },
      {
        id: 'enhanced_listen',
        text: "[Enhanced Hearing] Listen before engaging",
        requirement: { trait: 'enhanced_senses' },
        outcome: {
          rewards: {
            knowledge: ['cake_quest_unlocked'],
          },
          nextEncounter: 'birthday_cake_quest',
        }
      }
    ],
  },
  
  cake_quest: {
    id: 'birthday_cake_quest',
    type: 'birthday_wish',
    title: 'The Perfect Cake',
    description: 'You know what Mateo wants. The question is whether kindness fits in your route.',
    triggers: [
      { type: 'story_progress', condition: { knowledge: 'cake_quest_unlocked' } }
    ],
    stage: 2,
    maxStage: 3,
    choices: [
      {
        id: 'buy_cake',
        text: "I'll get it. Consider it a birthday gift.",
        outcome: {
          rewards: {
            humanityIndex: 10,
            relationships: { mateo: 50, parents: 20 },
            items: ['mateos_drawing'],
          },
          consequences: ['tips_spent_47'],
        }
      },
      {
        id: 'transactional',
        text: "Maybe you'll remember this when I need help.",
        outcome: {
          rewards: {
            relationships: { mateo: 20, parents: 10 },
            knowledge: ['secret_passages'],
          },
          consequences: ['tips_spent_47', 'pragmatic_path'],
        }
      }
    ],
    unlocks: ['mateo_shortcuts', 'invisible_passages'],
  }
};

// Humanity Index Tracking
export const HumanityIndexSchema = z.object({
  current: z.number().min(-100).max(100),
  history: z.array(z.object({
    change: z.number(),
    reason: z.string(),
    timestamp: z.number(),
  })),
  thresholds: z.object({
    soulless: z.number().default(-50),
    struggling: z.number().default(0),
    human: z.number().default(50),
    saint: z.number().default(80),
  }),
});

export type HumanityIndex = z.infer<typeof HumanityIndexSchema>;

// Encounter State Management
export const EncounterStateSchema = z.object({
  activeEncounters: z.array(z.string()),
  completedEncounters: z.array(z.string()),
  encounterProgress: z.record(z.number()), // encounter_id -> stage
  temporalFragments: z.array(z.string()),
  hiddenKnowledge: z.array(z.string()),
  mapSymbols: z.array(z.object({
    location: z.object({ x: z.number(), y: z.number() }),
    symbol: z.string(),
    revealed: z.boolean(),
  })),
});

export type EncounterState = z.infer<typeof EncounterStateSchema>;