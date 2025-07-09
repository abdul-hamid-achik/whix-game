import { z } from 'zod';

// Base metadata schema with flexible approach
const baseMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  published: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Character Schema - Very flexible for content, normalized for DB
export const characterMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(), // Accept any type string
  name: z.string(),
  role: z.string().optional(), // Accept any role
  class: z.string().optional(), // Accept any class
  traits: z.array(z.string()).optional(), // Accept any trait strings
  stats: z.record(z.string(), z.union([z.number(), z.string()])).optional()
    .transform((val) => {
      // Convert string stats to numbers if possible
      if (!val) return val;
      const normalized: Record<string, number> = {};
      for (const [key, value] of Object.entries(val)) {
        normalized[key] = typeof value === 'string' ? parseInt(value, 10) || 0 : value;
      }
      return normalized;
    }),
  relationships: z.record(z.string(), z.union([z.number(), z.string()])).optional()
    .transform((val) => {
      // Convert string relationships to numbers if possible
      if (!val) return val;
      const normalized: Record<string, number> = {};
      for (const [key, value] of Object.entries(val)) {
        normalized[key] = typeof value === 'string' ? parseInt(value, 10) || 0 : value;
      }
      return normalized;
    }),
  backStory: z.string().optional(),
  abilities: z.array(
    z.union([
      z.string(),
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    ])
  ).optional()
    .transform((val) => {
      // Normalize abilities to strings for DB
      if (!val) return val;
      return val.map(ability => 
        typeof ability === 'string' ? ability : ability.name
      );
    }),
  portrait: z.string().optional(),
  sprite: z.string().optional(),
  voiceStyle: z.string().optional(),
  level: z.number().optional(),
  rarity: z.string().optional(),
});

// Item Schema - Flexible categories and rarities
export const itemMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(),
  name: z.string().optional(), // Some items might not have separate name
  category: z.string(), // Accept any category string
  subcategory: z.string().optional(),
  rarity: z.string().optional().default('common'),
  value: z.number(),
  stackable: z.boolean().default(true),
  tradeable: z.boolean().optional(),
  maxStack: z.number().default(99),
  itemLevel: z.number().optional(),
  effects: z.union([
    z.array(z.object({
      type: z.string(),
      value: z.number(),
      duration: z.number().optional(),
    })),
    z.object({
      passive: z.array(z.any()).optional(),
      active: z.array(z.any()).optional(),
    })
  ]).optional(),
  requirements: z.object({
    level: z.number().optional(),
    class: z.array(z.string()).optional(),
    traits: z.array(z.string()).optional(),
  }).optional(),
  icon: z.string().optional(),
  stats: z.any().optional(),
  traitSynergies: z.any().optional(),
});

// Level Schema
export const levelMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(),
  difficulty: z.string().optional().default('normal'),
  missionType: z.string().optional().default('standard_delivery'),
  zone: z.string().optional().default('downtown'),
  timeLimit: z.number().optional(),
  rewards: z.object({
    tips: z.number().optional(),
    experience: z.number().optional(),
    items: z.array(z.string()).optional(),
    unlocks: z.array(z.string()).optional(),
  }).default({}),
  hazards: z.array(z.string()).optional(),
  requirements: z.any().optional(),
  roguelikeElements: z.any().optional(),
  dialogueNodes: z.array(z.string()).optional(),
});

// Map Schema
export const mapMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(),
  zone: z.string().optional().default('downtown'),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }).optional().default({ width: 100, height: 100 }),
  tileSet: z.string().optional(),
  encounters: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
  backgroundImage: z.string().optional(),
  ambientSound: z.string().optional(),
  weatherEffects: z.array(z.string()).optional(),
  interactables: z.array(z.any()).optional(),
});

// Chapter Schema
export const chapterMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(),
  chapterNumber: z.number().optional(),
  setting: z.string().optional(),
  timeOfDay: z.string().optional(),
  weather: z.string().optional(),
  mainCharacters: z.array(z.string()).optional().default([]),
  choices: z.array(z.any()).optional().default([]),
  musicTrack: z.string().optional(),
  backgroundImage: z.string().optional(),
  act: z.number().optional(),
  unlockLevel: z.number().optional(),
  rewards: z.any().optional(),
  objectives: z.array(z.string()).optional(),
});

// Trait Schema
export const traitMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(),
  name: z.string(),
  category: z.string().optional().default('neurodivergent'),
  rarity: z.string().optional().default('common'),
  statBonus: z.record(z.string(), z.number()).optional(),
  compatibleClasses: z.array(z.string()).optional(),
  abilityUnlocks: z.array(
    z.union([
      z.string(),
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    ])
  ).optional()
    .transform((val) => {
      // Normalize to strings for DB
      if (!val) return val;
      return val.map(ability => 
        typeof ability === 'string' ? ability : ability.name
      );
    }),
  synergyTraits: z.array(z.string()).optional(),
  icon: z.string().optional(),
});

// Dialog Schema
export const dialogMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(),
  speaker: z.string().optional().default('Unknown'),
  location: z.string().optional(),
  conditions: z.any().optional(),
  branches: z.array(z.any()).optional().default([]),
  audio: z.string().optional(),
  animation: z.string().optional(),
});

// UI Content Schema
export const uiContentMetadataSchema = baseMetadataSchema.extend({
  type: z.string().optional(),
  version: z.string().optional().default('1.0.0'),
  category: z.string().optional().default('general'),
  screens: z.record(z.string(), z.any()).optional(),
  messages: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  branding: z.any().optional(),
  animations: z.any().optional(),
  accessibility: z.any().optional(),
});

// Create a flexible content metadata schema that tries each type
export const flexibleContentMetadataSchema = z.union([
  characterMetadataSchema,
  itemMetadataSchema,
  levelMetadataSchema,
  mapMetadataSchema,
  chapterMetadataSchema,
  traitMetadataSchema,
  dialogMetadataSchema,
  uiContentMetadataSchema,
]).catch((ctx) => {
  // If none match, return a basic metadata object
  // Silently handle - likely a non-content file (README, etc)
  return {
    id: 'unknown',
    title: 'Unknown Content',
    description: 'Failed to parse content metadata',
    published: false,
    type: 'unknown'
  };
});

// Content file schema
export const contentFileSchema = <T extends z.ZodTypeAny>(metadataSchema: T) =>
  z.object({
    metadata: metadataSchema,
    content: z.string(),
    slug: z.string(),
    filePath: z.string(),
  });

// Type exports
export type CharacterMetadata = z.output<typeof characterMetadataSchema>;
export type ItemMetadata = z.output<typeof itemMetadataSchema>;
export type LevelMetadata = z.output<typeof levelMetadataSchema>;
export type MapMetadata = z.output<typeof mapMetadataSchema>;
export type ChapterMetadata = z.output<typeof chapterMetadataSchema>;
export type TraitMetadata = z.output<typeof traitMetadataSchema>;
export type DialogMetadata = z.output<typeof dialogMetadataSchema>;
export type UIContentMetadata = z.output<typeof uiContentMetadataSchema>;
export type ContentMetadata = z.output<typeof flexibleContentMetadataSchema>;

// Helper to normalize enum values for database
export function normalizeForDatabase(value: string | undefined, enumMap: Record<string, string>): string {
  if (!value) return enumMap.default || 'unknown';
  const normalized = value.toLowerCase().replace(/[-_\s]/g, '');
  return enumMap[normalized] || enumMap.default || value;
}

// Common normalization maps
export const rarityMap: Record<string, string> = {
  common: 'common',
  uncommon: 'rare',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
  restricted: 'legendary',
  default: 'common'
};

export const itemTypeMap: Record<string, string> = {
  equipment: 'armor',
  headgear: 'armor',
  weapon: 'weapon',
  accessory: 'accessory',
  consumable: 'consumable',
  material: 'material',
  food: 'consumable',
  medicine: 'consumable',
  transport: 'accessory',
  storage: 'accessory',
  culturalitem: 'collectible',
  religiousitem: 'collectible',
  corporateequipment: 'armor',
  default: 'material'
};

export const classMap: Record<string, string> = {
  courier: 'courier',
  analyst: 'analyst',
  negotiator: 'negotiator',
  specialist: 'specialist',
  investigator: 'investigator',
  brokencourier: 'courier',
  enemy: 'courier',
  default: 'courier'
};

export const traitMap: Record<string, string> = {
  // Valid traits
  hyperfocus: 'hyperfocus',
  patternrecognition: 'pattern_recognition',
  enhancedsenses: 'enhanced_senses',
  systematicthinking: 'systematic_thinking',
  attentiontodetail: 'attention_to_detail',
  routinemastery: 'routine_mastery',
  sensoryprocessing: 'sensory_processing',
  // Map unknown traits to valid ones
  strategicdeception: 'pattern_recognition',
  righteousfury: 'hyperfocus',
  sensorydifference: 'sensory_processing',
  timeblindness: 'attention_to_detail',
  // Default
  default: 'hyperfocus'
};