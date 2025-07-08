import { z } from 'zod';

// Player actions available in social encounters
export const SocialActionSchema = z.enum([
  'negotiate',      // Try to reason for better treatment/tips
  'argue',          // Stand up for yourself
  'show_proof',     // Present evidence (delivery confirmation, etc)
  'de_escalate',    // Calm the situation down
  'call_support',   // Contact WHIX support (usually unhelpful)
  'apologize',      // Swallow pride to keep the job
  'document',       // Record the interaction
  'empathize',      // Show understanding
  'firm_boundary',  // Set professional limits
  'humor',          // Use humor to defuse tension
  'wait',           // Let them vent
]);

export type SocialAction = z.infer<typeof SocialActionSchema>;

// Action metadata for UI display
export const ActionMetadataSchema = z.object({
  id: SocialActionSchema,
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  requirements: z.object({
    trait: z.string().optional(),
    minSocial: z.number().optional(),
    minLogic: z.number().optional(),
  }).optional(),
  effects: z.object({
    reputationChange: z.number().default(0),
    stressChange: z.number().default(0),
    tipsMultiplier: z.number().default(1),
  }).optional(),
});

// Opponent types from the existing system
export const OpponentTypeSchema = z.enum([
  'angry_customer',
  'karen_customer',
  'bourgeois_resident',
  'corporate_manager',
  'security_guard',
  'rival_courier',
  'restaurant_owner',
  'doorman',
  'debt_collector',
]);

export type OpponentType = z.infer<typeof OpponentTypeSchema>;

// State definition for the encounter state machine
export const EncounterStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  dialogue: z.string(),
  mood: z.enum(['neutral', 'annoyed', 'angry', 'furious', 'calming', 'satisfied']).default('neutral'),
  playerActions: z.array(SocialActionSchema),
  npcActions: z.array(z.object({
    text: z.string(),
    effect: z.enum(['stress', 'reputation_loss', 'tip_reduction', 'escalate', 'de_escalate']),
    value: z.number().optional(),
  })).optional(),
});

// Transition conditions and effects
export const TransitionSchema = z.object({
  from: z.string(), // state id
  to: z.string(),   // state id
  action: SocialActionSchema.optional(),
  condition: z.object({
    reputation: z.number().optional(),
    stress: z.number().optional(),
    roundsPassed: z.number().optional(),
  }).optional(),
  effects: z.object({
    reputationChange: z.number().optional(),
    stressChange: z.number().optional(),
    dialogueOverride: z.string().optional(),
  }).optional(),
});

// Win/lose conditions
export const ConditionSchema = z.object({
  type: z.enum(['reputation', 'stress', 'rounds', 'state']),
  value: z.number().optional(),
  state: z.string().optional(),
  comparison: z.enum(['gt', 'gte', 'lt', 'lte', 'eq']).default('gte'),
});

// Rewards for successful encounters
export const RewardsSchema = z.object({
  tips: z.number().default(0),
  experience: z.number().default(0),
  reputation: z.number().default(0),
  items: z.array(z.string()).optional(),
  unlocksDialogue: z.string().optional(),
});

// Complete encounter definition
export const EncounterSchema = z.object({
  // Metadata
  id: z.string(),
  type: z.literal('social_encounter'),
  title: z.string(),
  description: z.string().optional(),
  
  // Setting and participants
  setting: z.string(),
  opponent: OpponentTypeSchema,
  difficulty: z.number().min(1).max(10).default(5),
  
  // Initial state
  initialState: z.string(),
  initialValues: z.object({
    reputation: z.number().default(50),
    stress: z.number().default(0),
    maxStress: z.number().default(100),
  }).default({}),
  
  // States and transitions
  states: z.record(z.string(), EncounterStateSchema),
  transitions: z.array(TransitionSchema),
  
  // Win/lose conditions
  winConditions: z.array(ConditionSchema),
  loseConditions: z.array(ConditionSchema),
  
  // Outcomes
  winOutcome: z.object({
    nextState: z.string().optional(),
    dialogue: z.string(),
    rewards: RewardsSchema,
  }),
  loseOutcome: z.object({
    nextState: z.string().optional(),
    dialogue: z.string(),
    consequences: z.object({
      tips: z.number().default(0),
      reputation: z.number().default(0),
    }).optional(),
  }),
  
  // Optional features
  timerSeconds: z.number().optional(), // For timed encounters
  specialMechanics: z.array(z.string()).optional(), // e.g., ["recording", "witness"]
});

export type Encounter = z.infer<typeof EncounterSchema>;
export type EncounterState = z.infer<typeof EncounterStateSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Rewards = z.infer<typeof RewardsSchema>;

// Helper type for the encounter engine
export interface EncounterContext {
  currentState: string;
  reputation: number;
  stress: number;
  maxStress: number;
  roundsPassed: number;
  history: Array<{
    state: string;
    action?: SocialAction;
    timestamp: number;
  }>;
  playerTraits: string[];
  playerStats: {
    social: number;
    logic: number;
    focus: number;
    perception: number;
  };
}