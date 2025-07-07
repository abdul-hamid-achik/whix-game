import { z } from 'zod';

// Base metadata that all content types share
export const BaseMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  published: z.boolean().default(true),
});

// Character metadata schema
export const CharacterMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal('character'),
  name: z.string(),
  role: z.enum(['protagonist', 'partner', 'npc', 'antagonist']),
  class: z.enum(['courier', 'analyst', 'negotiator', 'specialist', 'investigator']).optional(),
  traits: z.array(z.string()).optional(),
  stats: z.object({
    focus: z.number().optional(),
    perception: z.number().optional(),
    social: z.number().optional(),
    logic: z.number().optional(),
    stamina: z.number().optional(),
  }).optional(),
  relationships: z.record(z.string(), z.number()).optional(),
  unlockCondition: z.string().optional(),
  voiceStyle: z.string().optional(),
  sprite: z.string().optional(),
});

// Level/Mission metadata schema
export const LevelMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal('level'),
  difficulty: z.enum(['easy', 'normal', 'hard', 'extreme']),
  missionType: z.enum([
    'standard_delivery',
    'rush_delivery', 
    'fragile_cargo',
    'vip_client',
    'investigation',
    'sabotage',
    'rescue',
    'story'
  ]),
  objectives: z.array(z.object({
    id: z.string(),
    description: z.string(),
    type: z.enum(['deliver', 'collect', 'defeat', 'survive', 'interact']),
    target: z.union([z.string(), z.number()]).optional(),
    optional: z.boolean().default(false),
  })),
  rewards: z.object({
    tips: z.number().optional(),
    experience: z.number().optional(),
    starFragments: z.number().optional(),
    items: z.array(z.string()).optional(),
    unlocksChapter: z.string().optional(),
    unlocksCharacter: z.string().optional(),
  }),
  requirements: z.object({
    level: z.number().optional(),
    completedMissions: z.array(z.string()).optional(),
    humanityIndex: z.number().optional(),
    hasPartner: z.string().optional(),
    hasTrait: z.string().optional(),
  }).optional(),
  enemyGroups: z.array(z.string()).optional(),
  dialogueNodes: z.array(z.string()).optional(),
});

// Chapter/Story metadata schema
export const ChapterMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal('chapter'),
  chapterNumber: z.number(),
  act: z.number().optional(),
  setting: z.string(),
  timeOfDay: z.enum(['dawn', 'morning', 'afternoon', 'evening', 'night', 'midnight']),
  weather: z.enum(['clear', 'rain', 'storm', 'fog', 'snow', 'toxic']).optional(),
  mainCharacters: z.array(z.string()),
  choices: z.array(z.object({
    id: z.string(),
    description: z.string(),
    requirements: z.object({
      humanityIndex: z.number().optional(),
      trait: z.string().optional(),
      item: z.string().optional(),
      previousChoice: z.string().optional(),
    }).optional(),
    consequences: z.object({
      humanityChange: z.number().optional(),
      relationshipChanges: z.record(z.string(), z.number()).optional(),
      unlocksPath: z.string().optional(),
      givesItem: z.string().optional(),
    }).optional(),
  })),
  musicTrack: z.string().optional(),
  backgroundImage: z.string().optional(),
});

// Map/Location metadata schema
export const MapMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal('map'),
  zone: z.enum(['downtown', 'industrial', 'residential', 'underground', 'corporate', 'wasteland']),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  gridType: z.enum(['square', 'hex']).default('square'),
  obstacles: z.array(z.object({
    x: z.number(),
    y: z.number(),
    type: z.enum(['wall', 'barrier', 'hazard', 'cover']),
    destructible: z.boolean().default(false),
  })).optional(),
  spawnPoints: z.array(z.object({
    x: z.number(),
    y: z.number(),
    type: z.enum(['player', 'enemy', 'ally', 'objective']),
    id: z.string().optional(),
  })),
  environmentalEffects: z.array(z.object({
    type: z.enum(['rain', 'fog', 'toxic', 'emp', 'darkness']),
    intensity: z.number().min(0).max(1),
    area: z.enum(['global', 'zone']).optional(),
    zones: z.array(z.object({
      x: z.number(),
      y: z.number(),
      radius: z.number(),
    })).optional(),
  })).optional(),
  interactables: z.array(z.object({
    x: z.number(),
    y: z.number(),
    type: z.enum(['terminal', 'door', 'item', 'npc', 'trigger']),
    id: z.string(),
    requiresItem: z.string().optional(),
    requiresTrait: z.string().optional(),
  })).optional(),
});

// Item metadata schema
export const ItemMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal('item'),
  category: z.enum(['consumable', 'equipment', 'key', 'collectible', 'currency']),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  stackable: z.boolean().default(true),
  maxStack: z.number().default(99),
  value: z.number().default(0),
  soulbound: z.boolean().default(false),
  effects: z.array(z.object({
    type: z.enum(['heal', 'boost', 'damage', 'unlock', 'story']),
    value: z.number().optional(),
    duration: z.number().optional(),
    target: z.enum(['self', 'partner', 'team', 'enemy']).optional(),
  })).optional(),
  requirements: z.object({
    level: z.number().optional(),
    class: z.string().optional(),
    trait: z.string().optional(),
  }).optional(),
  icon: z.string().optional(),
});

// Trait metadata schema
export const TraitMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal('trait'),
  name: z.string(),
  category: z.enum(['neurodivergent', 'social', 'technical', 'physical']),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  statBonus: z.record(z.string(), z.number()).optional(),
  personalityTraits: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  abilityUnlocks: z.array(z.object({
    level: z.number(),
    ability: z.string(),
    description: z.string(),
  })).optional(),
  compatibleClasses: z.array(z.string()).optional(),
  positiveRepresentation: z.object({
    description: z.string(),
    examples: z.array(z.string()).optional(),
  }).optional(),
  realWorldConnection: z.object({
    description: z.string(),
    notableFigures: z.array(z.string()).optional(),
  }).optional(),
  gameplayMechanics: z.object({
    passiveEffect: z.string().optional(),
    activeAbility: z.string().optional(),
    drawback: z.string().optional(),
    synergies: z.array(z.object({
      trait: z.string(),
      effect: z.string(),
    })).optional(),
  }).optional(),
});

// Dialogue metadata schema
export const DialogueMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal('dialogue'),
  characters: z.array(z.string()),
  location: z.string().optional(),
  trigger: z.enum(['interaction', 'auto', 'mission', 'combat', 'item']),
  priority: z.enum(['main', 'side', 'flavor']).default('side'),
  repeatable: z.boolean().default(false),
  conditions: z.object({
    minimumLevel: z.number().optional(),
    requiredMissions: z.array(z.string()).optional(),
    requiredItems: z.array(z.string()).optional(),
    humanityRange: z.tuple([z.number(), z.number()]).optional(),
    timeOfDay: z.string().optional(),
  }).optional(),
  branches: z.array(z.object({
    id: z.string(),
    condition: z.string().optional(),
    nextDialogue: z.string().optional(),
  })).optional(),
});

// Union type for all content metadata
export const ContentMetadataSchema = z.discriminatedUnion('type', [
  CharacterMetadataSchema,
  LevelMetadataSchema,
  ChapterMetadataSchema,
  MapMetadataSchema,
  ItemMetadataSchema,
  TraitMetadataSchema,
  DialogueMetadataSchema,
]);

export type BaseMetadata = z.infer<typeof BaseMetadataSchema>;
export type CharacterMetadata = z.infer<typeof CharacterMetadataSchema>;
export type LevelMetadata = z.infer<typeof LevelMetadataSchema>;
export type ChapterMetadata = z.infer<typeof ChapterMetadataSchema>;
export type MapMetadata = z.infer<typeof MapMetadataSchema>;
export type ItemMetadata = z.infer<typeof ItemMetadataSchema>;
export type TraitMetadata = z.infer<typeof TraitMetadataSchema>;
export type DialogueMetadata = z.infer<typeof DialogueMetadataSchema>;
export type ContentMetadata = z.infer<typeof ContentMetadataSchema>;