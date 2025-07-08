import { z } from 'zod';
import { PartnerClassSchema, NeurodivergentTraitSchema, RaritySchema } from '../game/classes';

// Partner Schemas
export const GeneratedPartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  class: PartnerClassSchema,
  primaryTrait: NeurodivergentTraitSchema,
  secondaryTrait: NeurodivergentTraitSchema.optional(),
  tertiaryTrait: NeurodivergentTraitSchema.optional(),
  level: z.number().min(1),
  rarity: RaritySchema,
  stats: z.object({
    focus: z.number(),
    perception: z.number(),
    social: z.number(),
    logic: z.number(),
    stamina: z.number(),
  }),
  personality: z.object({
    traits: z.array(z.string()),
    likes: z.array(z.string()),
    dislikes: z.array(z.string()),
    backstory: z.string(),
  }),
});

export const ContentPartnerSchema = GeneratedPartnerSchema.extend({
  contentId: z.string(),
  isContentBased: z.literal(true),
  unlockCondition: z.string().optional(),
  voiceStyle: z.string().optional(),
  relationships: z.record(z.string(), z.number()),
  backstory: z.string(),
});

export const StoredPartnerSchema = GeneratedPartnerSchema.extend({
  experience: z.number(),
  currentEnergy: z.number(),
  maxEnergy: z.number(),
  bondLevel: z.number(),
  isInjured: z.boolean(),
  injuryRecoveryTime: z.number().optional(),
  traitMastery: z.record(z.string(), z.object({
    level: z.number(),
    experience: z.number(),
    unlocked: z.boolean(),
  })),
  equipment: z.object({
    accessory: z.string().optional(),
    booster: z.string().optional(),
  }),
  // Content integration fields
  contentId: z.string().optional(),
  isContentBased: z.boolean().optional(),
  unlockCondition: z.string().optional(),
  voiceStyle: z.string().optional(),
  relationships: z.record(z.string(), z.number()).optional(),
  backstory: z.string().optional(),
  // Mission statistics
  missions: z.number().default(0),
});

// UI Context Schemas
export const GameStateSchema = z.enum([
  'courier_hub',
  'mission_briefing', 
  'partner_selection',
  'adventure_map',
  'tactical_combat',
  'event_resolution',
  'after_action'
]);

// Export as enum for backwards compatibility
export enum GameState {
  COURIER_HUB = 'courier_hub',
  MISSION_BRIEFING = 'mission_briefing', 
  PARTNER_SELECTION = 'partner_selection',
  ADVENTURE_MAP = 'adventure_map',
  TACTICAL_COMBAT = 'tactical_combat',
  EVENT_RESOLUTION = 'event_resolution',
  AFTER_ACTION = 'after_action'
}

export const PanelPositionSchema = z.enum(['left', 'right', 'center', 'overlay']);
export const PanelSizeSchema = z.enum(['small', 'medium', 'large', 'fullscreen']);

// Node data for adventure map
export const NodeDataSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  difficulty: z.number().optional(),
  requirements: z.any().optional(),
  rewards: z.any().optional(),
}).optional();

// Rewards data schema
export const RewardsDataSchema = z.object({
  tips: z.number().optional(),
  bonusTips: z.number().optional(),
  experience: z.number().optional(),
  starFragments: z.number().optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
    quantity: z.number(),
  })).optional(),
  partnerExperience: z.record(z.string(), z.number()).optional(),
  bondIncrease: z.record(z.string(), z.number()).optional(),
}).optional();

// Mission objective schema
export const MissionObjectiveSchema = z.object({
  description: z.string(),
  completed: z.boolean(),
});

export const UIContextDataSchema = z.object({
  missionType: z.string().optional(),
  difficulty: z.string().optional(),
  chapterTitle: z.string().optional(),
  selectedPartners: z.array(z.string()).optional(),
  missionId: z.string().optional(),
  missionName: z.string().optional(),
  returnState: GameStateSchema.optional(),
  encounterType: z.string().optional(),
  nodeData: NodeDataSchema,
  mapData: z.any().optional(),
  combatResult: z.string().optional(),
  eventResult: z.string().optional(),
  rewards: RewardsDataSchema,
  loadingVariant: z.enum(['boot', 'mission', 'sync', 'corporate']).optional(),
  // Mission performance data
  objectives: z.array(MissionObjectiveSchema).optional(),
  timeSpent: z.number().optional(),
  damageDealt: z.number().optional(),
  damageTaken: z.number().optional(),
  itemsUsed: z.number().optional(),
  perfectClear: z.boolean().optional(),
}).optional();

export const PanelConfigSchema = z.object({
  visible: z.boolean(),
  position: PanelPositionSchema,
  size: PanelSizeSchema,
});

// Story Schemas
export const StoryRequirementSchema = z.object({
  previousChoice: z.string().optional(),
  flag: z.string().optional(),
  relationship: z.object({
    character: z.string(),
    minimum: z.number(),
  }).optional(),
  level: z.number().optional(),
  chapter: z.string().optional(),
}).optional();

// Mission Schemas
export const MissionTypeSchema = z.enum(['story', 'side', 'daily', 'weekly', 'special']);
export const MissionDifficultySchema = z.enum(['easy', 'normal', 'hard', 'extreme']);

export const MissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: MissionTypeSchema,
  difficulty: MissionDifficultySchema,
  requirements: z.array(StoryRequirementSchema).optional(),
  rewards: z.object({
    tips: z.number().optional(),
    experience: z.number().optional(),
    items: z.array(z.string()).optional(),
  }),
  completed: z.boolean(),
  available: z.boolean(),
});

// Game State Schemas
export const GameStatsSchema = z.object({
  currentTips: z.number(),
  level: z.number(),
  experience: z.number(),
  humanityIndex: z.number(),
  playerName: z.string(),
});

// Export types
export type GeneratedPartner = z.infer<typeof GeneratedPartnerSchema>;
export type ContentPartner = z.infer<typeof ContentPartnerSchema>;
export type StoredPartner = z.infer<typeof StoredPartnerSchema>;
// GameState is exported as enum above
export type UIContextData = z.infer<typeof UIContextDataSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type RewardsData = z.infer<typeof RewardsDataSchema>;
export type MissionObjective = z.infer<typeof MissionObjectiveSchema>;
export type PanelConfig = z.infer<typeof PanelConfigSchema>;
export type StoryRequirement = z.infer<typeof StoryRequirementSchema>;
export type Mission = z.infer<typeof MissionSchema>;
export type GameStats = z.infer<typeof GameStatsSchema>;