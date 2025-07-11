import { z } from 'zod';

// Base metadata schema shared by all content types
const baseMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  published: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Character Schema
export const characterMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('character').optional(),
  name: z.string(),
  role: z.enum(['protagonist', 'partner', 'npc', 'antagonist', 'enemy']).optional(),
  class: z.enum(['courier', 'analyst', 'negotiator', 'specialist', 'investigator']).optional(),
  traits: z.array(z.string()).optional(), // Allow any trait string
  stats: z.object({
    level: z.number().default(1),
    health: z.number().default(100),
    speed: z.number().default(10),
    efficiency: z.number().default(10),
    humanity: z.number().default(50),
  }).optional(),
  relationships: z.record(z.string(), z.union([z.number(), z.string()])).optional(), // Allow string or number
  backStory: z.string().optional(),
  abilities: z.array(z.union([z.string(), z.object({name: z.string(), description: z.string().optional()})])).optional(),
  portrait: z.string().optional(),
  sprite: z.string().optional(),
});

// Level Schema
export const levelMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('level').optional(),
  difficulty: z.enum(['easy', 'normal', 'hard', 'extreme']),
  missionType: z.enum([
    'standard_delivery',
    'rush_delivery',
    'stealth_delivery',
    'investigation',
    'social_engineering',
    'sabotage',
    'rescue',
    'story'
  ]),
  zone: z.enum([
    'downtown',
    'industrial',
    'residential',
    'underground',
    'corporate',
    'wasteland'
  ]),
  timeLimit: z.number().optional(),
  rewards: z.object({
    tips: z.number(),
    experience: z.number(),
    items: z.array(z.string()).optional(),
    unlocks: z.array(z.string()).optional(),
  }),
  hazards: z.array(z.enum([
    'police_patrols',
    'surveillance_drones',
    'rival_couriers',
    'weather_conditions',
    'system_glitches',
    'corporate_security'
  ])).optional(),
  requirements: z.object({
    level: z.number().optional(),
    items: z.array(z.string()).optional(),
    traits: z.array(z.string()).optional(),
    previousMissions: z.array(z.string()).optional(),
  }).optional(),
  roguelikeElements: z.object({
    randomEncounters: z.boolean().optional(),
    procedualLayout: z.boolean().optional(),
    permadeathRisk: z.boolean().optional(),
  }).optional(),
  dialogueNodes: z.array(z.string()).optional(),
});

// Item Schema
export const itemMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('item').optional(),
  category: z.enum([
    'consumable', 'equipment', 'key', 'collectible', 'currency',
    'medicine', 'transport', 'storage', 'cultural_item', 'religious_item',
    'corporate_equipment', 'food', 'weapon', 'accessory', 'headgear',
    'armor', 'material'
  ]),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'restricted']).optional(),
  value: z.number(),
  stackable: z.boolean().default(true),
  maxStack: z.number().default(99),
  effects: z.array(z.object({
    type: z.string(),
    value: z.number(),
    duration: z.number().optional(),
  })).optional(),
  requirements: z.object({
    level: z.number().optional(),
    class: z.array(z.string()).optional(),
    traits: z.array(z.string()).optional(),
  }).optional(),
  icon: z.string().optional(),
});

// Map Schema
export const mapMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('map').optional(),
  zone: z.enum([
    'downtown',
    'industrial',
    'residential',
    'underground',
    'corporate',
    'wasteland'
  ]),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  tileSet: z.string(),
  encounters: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    triggerCondition: z.string().optional(),
  })).optional(),
  connections: z.array(z.object({
    to: z.string(),
    direction: z.enum(['north', 'south', 'east', 'west']),
    requirements: z.object({
      items: z.array(z.string()).optional(),
      level: z.number().optional(),
    }).optional(),
  })).optional(),
  backgroundImage: z.string().optional(),
  ambientSound: z.string().optional(),
  weatherEffects: z.array(z.string()).optional(),
  interactables: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    interaction: z.string(),
  })).optional(),
});

// Chapter Schema
export const chapterMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('chapter').optional(),
  chapterNumber: z.number(),
  setting: z.string(),
  timeOfDay: z.enum(['dawn', 'morning', 'afternoon', 'evening', 'night', 'midnight']),
  weather: z.enum(['clear', 'rain', 'fog', 'smog', 'storm']).optional(),
  mainCharacters: z.array(z.string()),
  choices: z.array(z.object({
    id: z.string(),
    description: z.string(),
    requirements: z.object({
      trait: z.string().optional(),
      item: z.string().optional(),
      relationshipLevel: z.object({
        character: z.string(),
        minLevel: z.number(),
      }).optional(),
    }).optional(),
    consequences: z.object({
      humanityChange: z.number().optional(),
      relationshipChanges: z.record(z.string(), z.number()).optional(),
      givesItem: z.string().optional(),
      unlocksPath: z.string().optional(),
    }),
  })),
  musicTrack: z.string().optional(),
  backgroundImage: z.string().optional(),
  act: z.number().optional(),
});

// Trait Schema
export const traitMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('trait').optional(),
  name: z.string(),
  category: z.enum(['cognitive', 'sensory', 'social', 'physical', 'neurodivergent']).optional(), // Allow more categories
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
  statBonus: z.record(z.string(), z.number()).optional(),
  compatibleClasses: z.array(z.string()).optional(),
  abilityUnlocks: z.array(z.union([z.string(), z.object({name: z.string(), description: z.string().optional()})])).optional(),
  synergyTraits: z.array(z.string()).optional(),
  icon: z.string().optional(),
});

// Dialog Schema
export const dialogMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('dialogue').optional(),
  speaker: z.string(),
  location: z.string().optional(),
  conditions: z.object({
    requiredLevel: z.number().optional(),
    requiredItems: z.array(z.string()).optional(),
    requiredRelationship: z.object({
      character: z.string(),
      minLevel: z.number(),
    }).optional(),
    requiredChoices: z.array(z.string()).optional(),
  }).optional(),
  branches: z.array(z.object({
    id: z.string(),
    text: z.string(),
    playerResponse: z.string().optional(),
    consequences: z.object({
      humanityChange: z.number().optional(),
      relationshipChange: z.number().optional(),
      givesItem: z.string().optional(),
      unlocksDialogue: z.string().optional(),
    }).optional(),
    nextBranch: z.string().optional(),
  })),
  audio: z.string().optional(),
  animation: z.string().optional(),
});

// UI Content Schema
export const uiContentMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('ui-content').optional(),
  version: z.string(),
  category: z.enum(['loading', 'login', 'error', 'general']),
  screens: z.record(z.string(), z.any()).optional(),
  messages: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  branding: z.object({
    company_name: z.string().optional(),
    logo_text: z.string().optional(),
    slogan: z.string().optional(),
    colors: z.record(z.string(), z.string()).optional(),
  }).optional(),
  animations: z.object({
    timings: z.record(z.string(), z.number()).optional(),
    effects: z.record(z.string(), z.boolean()).optional(),
  }).optional(),
  accessibility: z.object({
    screen_reader_text: z.record(z.string(), z.string()).optional(),
    keyboard_shortcuts: z.record(z.string(), z.string()).optional(),
  }).optional(),
});

// Union type for all content metadata
// Using z.union instead of discriminatedUnion since type field is optional
export const contentMetadataSchema = z.union([
  characterMetadataSchema,
  levelMetadataSchema,
  itemMetadataSchema,
  mapMetadataSchema,
  chapterMetadataSchema,
  traitMetadataSchema,
  dialogMetadataSchema,
  uiContentMetadataSchema,
]);

// Content file schema (includes the parsed content)
export const contentFileSchema = <T extends z.ZodTypeAny>(metadataSchema: T) =>
  z.object({
    metadata: metadataSchema,
    content: z.string(),
    slug: z.string(),
    filePath: z.string(),
  });

// Type exports
export type CharacterMetadata = z.infer<typeof characterMetadataSchema>;
export type LevelMetadata = z.infer<typeof levelMetadataSchema>;
export type ItemMetadata = z.infer<typeof itemMetadataSchema>;
export type MapMetadata = z.infer<typeof mapMetadataSchema>;
export type ChapterMetadata = z.infer<typeof chapterMetadataSchema>;
export type TraitMetadata = z.infer<typeof traitMetadataSchema>;
export type DialogMetadata = z.infer<typeof dialogMetadataSchema>;
export type UIContentMetadata = z.infer<typeof uiContentMetadataSchema>;
export type ContentMetadata = z.infer<typeof contentMetadataSchema>;
export type ContentFile<T> = z.infer<ReturnType<typeof contentFileSchema<z.ZodType<T>>>>;

// Helper functions for type-safe parsing
export function parseContentMetadata(data: unknown): ContentMetadata {
  return contentMetadataSchema.parse(data);
}

export function parseContentFile<T extends ContentMetadata>(
  data: unknown,
  metadataSchema: z.ZodType<T>
): ContentFile<T> {
  return contentFileSchema(metadataSchema).parse(data);
}

// Game data schema for the full export
export const gameDataSchema = z.object({
  characters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    class: z.string(),
    rarity: z.string().optional(),
    traits: z.array(z.string()).optional(),
    level: z.number().optional(),
    stats: z.any().optional(),
    abilities: z.array(z.string()).optional(),
  })),
  traits: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    rarity: z.string(),
    statBonus: z.record(z.string(), z.number()).optional(),
    abilityUnlocks: z.array(z.string()).optional(),
  })),
  levels: z.array(z.object({
    id: z.string(),
    name: z.string(),
    difficulty: z.string(),
    unlockLevel: z.number().optional(),
    rewards: z.any().optional(),
    hazards: z.array(z.string()).optional(),
    opportunities: z.array(z.string()).optional(),
    roguelikeElements: z.any().optional(),
  })),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    rarity: z.string(),
    value: z.number(),
    stats: z.any().optional(),
    effects: z.array(z.any()).optional(),
    traitSynergies: z.array(z.string()).optional(),
  })),
  maps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    regions: z.array(z.string()).optional(),
    scale: z.number().optional(),
    landmarks: z.array(z.string()).optional(),
    hiddenLocations: z.array(z.string()).optional(),
  })),
  chapters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    unlockLevel: z.number().optional(),
    difficulty: z.string().optional(),
    rewards: z.any().optional(),
    roguelikeElements: z.any().optional(),
  })),
});

export type GameData = z.infer<typeof gameDataSchema>;