import { z } from 'zod';

export const ItemRaritySchema = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique']);
export type ItemRarity = z.infer<typeof ItemRaritySchema>;

export const ItemTypeSchema = z.enum([
  'survival',
  'map_tool', 
  'combat',
  'social',
  'special',
  'consumable',
  'key_item'
]);
export type ItemType = z.infer<typeof ItemTypeSchema>;

export const ItemEffectSchema = z.object({
  type: z.enum(['stat', 'status', 'unlock', 'narrative', 'passive']),
  target: z.string(),
  value: z.union([z.number(), z.string(), z.boolean()]),
  duration: z.number().optional(),
  condition: z.string().optional(),
});

export type ItemEffect = z.infer<typeof ItemEffectSchema>;

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  lore: z.string(),
  type: ItemTypeSchema,
  rarity: ItemRaritySchema,
  effects: z.array(ItemEffectSchema),
  hiddenEffects: z.array(ItemEffectSchema).optional(),
  stackable: z.boolean().default(true),
  maxStack: z.number().default(99),
  value: z.number().default(0),
  soulbound: z.boolean().default(false),
  specialInteractions: z.array(z.string()).optional(),
});

export type Item = z.infer<typeof ItemSchema>;

// Survival Items
export const SURVIVAL_ITEMS: Record<string, Item> = {
  cardboard_palace: {
    id: 'cardboard_palace',
    name: 'Cardboard Palace',
    description: 'Modular shelter system from Whix boxes',
    lore: "Architectural Digest called it 'disturbingly innovative'—a modular shelter system crafted from Whix delivery boxes. Each panel still smells of unpaid labor.",
    type: 'survival',
    rarity: 'common',
    effects: [
      { type: 'stat', target: 'stamina_recovery', value: 15 },
    ],
    hiddenEffects: [
      { type: 'narrative', target: 'hidden_messages', value: 'previous_occupant' },
    ],
    stackable: false,
    value: 0,
  },
  
  pigeons_friend: {
    id: 'pigeons_friend',
    name: "Pigeon's Friend",
    description: 'Recycled breadcrumb pouch',
    lore: "Local pigeons recognize this recycled breadcrumb pouch. They remember who feeds them and whisper secrets about tomorrow's weather—or so the street philosophers claim.",
    type: 'survival',
    rarity: 'uncommon',
    effects: [
      { type: 'passive', target: 'weather_prediction', value: 25 },
      { type: 'passive', target: 'tip_multiplier_rain', value: 2 },
    ],
    value: 5,
    specialInteractions: ['pigeon_network'],
  },
  
  miguels_first_star: {
    id: 'miguels_first_star',
    name: "Miguel's First Star",
    description: 'Digital badge of broken promises',
    lore: "A digital badge that reduced your exploitation from 75% to 60%. It gleams with the hollow promise of eventual fairness. Tania threw hers away at 4.9.",
    type: 'special',
    rarity: 'unique',
    effects: [
      { type: 'passive', target: 'tip_cut_reduction', value: 15 },
      { type: 'passive', target: 'star_bearer_detection', value: true },
    ],
    stackable: false,
    soulbound: true,
    specialInteractions: ['tania_dialogue', 'shatter_for_humanity'],
  },
};

// Map Tools
export const MAP_TOOLS: Record<string, Item> = {
  bootleg_neighborhood_os: {
    id: 'bootleg_neighborhood_os',
    name: 'Bootleg Neighborhood OS',
    description: 'Jailbroken Whix mapping software',
    lore: "Some tech partner jailbroke Whix's mapping software and shared it freely. It shows the city as it is, not as Whix pretends it to be. Updates hourly until Whix patches the exploit.",
    type: 'map_tool',
    rarity: 'rare',
    effects: [
      { type: 'unlock', target: 'true_map', value: '5x5', duration: 10 },
    ],
    hiddenEffects: [
      { type: 'status', target: 'account_flagged', value: true },
    ],
    stackable: true,
    maxStack: 3,
    value: 50,
  },
  
  tanias_last_note: {
    id: 'tanias_last_note',
    name: "Tania's Last Note",
    description: 'Coordinates to impossible places',
    lore: "A delivery receipt with coordinates written in her shaking hand. The ink is smudged with something that might be tears or rain. It leads to places that shouldn't exist.",
    type: 'map_tool',
    rarity: 'legendary',
    effects: [
      { type: 'unlock', target: 'impossible_location', value: 'one_per_chapter' },
    ],
    hiddenEffects: [
      { type: 'stat', target: 'humanity_index', value: -5 },
    ],
    stackable: false,
    soulbound: true,
  },
};

// Special Items
export const SPECIAL_ITEMS: Record<string, Item> = {
  algorithms_heart: {
    id: 'algorithms_heart',
    name: "The Algorithm's Heart",
    description: 'USB drive of pure mathematics',
    lore: "A USB drive containing 47 gigabytes of pure mathematics. Some say it's Whix's source code. Others claim it's Employee Zero's suicide note. It hums with malevolent purpose.",
    type: 'special',
    rarity: 'legendary',
    effects: [
      { type: 'unlock', target: 'algorithm_vision', value: true },
      { type: 'narrative', target: 'neighborhood_structure', value: 'revealed' },
    ],
    hiddenEffects: [
      { type: 'stat', target: 'humanity_index', value: -50 },
    ],
    stackable: false,
    value: 0,
    specialInteractions: ['old_timer_reaction', 'tania_breakdown'],
  },
  
  mateos_drawing: {
    id: 'mateos_drawing',
    name: "Mateo's Drawing",
    description: 'Map drawn with frosting and hope',
    lore: "A frosting-and-crayon map drawn by a seven-year-old's hand. It shows passages that adult eyes can't see and marks places where 'the sad lady cried.' Somehow, it's always accurate.",
    type: 'special',
    rarity: 'unique',
    effects: [
      { type: 'unlock', target: 'find_character_instant', value: 'once_per_run' },
      { type: 'passive', target: 'child_sight', value: true },
    ],
    stackable: false,
    soulbound: true,
    specialInteractions: ['invisible_passages', 'mateo_trust'],
  },
  
  community_soup: {
    id: 'community_soup',
    name: 'Community Soup',
    description: 'Made from whatever neighbors can spare',
    lore: "Made from whatever neighbors can spare. The recipe changes but the warmth remains constant. Whix can't monetize what's freely given.",
    type: 'consumable',
    rarity: 'uncommon',
    effects: [
      { type: 'stat', target: 'party_heal', value: 100 },
      { type: 'status', target: 'morale_boost', value: true, duration: 30 },
    ],
    stackable: true,
    maxStack: 5,
    value: 0,
    condition: 'humanity_index_above_75',
    specialInteractions: ['strengthen_community_bonds'],
  },
};

// Item Interaction System
export const ItemInteractionSchema = z.object({
  itemId: z.string(),
  targetId: z.string(), // NPC, location, or other item
  result: z.object({
    dialogue: z.string().optional(),
    unlock: z.string().optional(),
    transform: z.string().optional(), // item transforms into another
    consequence: z.string().optional(),
  }),
});

export type ItemInteraction = z.infer<typeof ItemInteractionSchema>;

export const ITEM_INTERACTIONS: ItemInteraction[] = [
  {
    itemId: 'miguels_first_star',
    targetId: 'tania',
    result: {
      dialogue: 'tania_star_memory',
      consequence: 'tania_breakdown_temporary',
    },
  },
  {
    itemId: 'mateos_drawing',
    targetId: 'locked_building',
    result: {
      unlock: 'any_building_once',
      dialogue: 'mateo_secret_path',
    },
  },
  {
    itemId: 'algorithms_heart',
    targetId: 'old_timer',
    result: {
      dialogue: 'old_timer_recognition',
      unlock: 'temporal_coherence',
      consequence: 'reality_fracture',
    },
  },
];

// Item Discovery Messages
export const HIDDEN_MESSAGES: Record<string, string[]> = {
  cardboard_palace: [
    "Day 47: The boxes remember their routes",
    "If you're reading this, check under the third panel",
    "They're watching through the barcode scanners",
    "The algorithm dreams of efficiency. We dream of food.",
    "Tania was here. Before the change. She left coordinates.",
  ],
  temporal_fragment: [
    "Time isn't money. Time is life. They steal both.",
    "13 minutes. Always 13 minutes. Why?",
    "I've delivered this package before. I'll deliver it again.",
    "The Old Timer knows. But he can't say. Only ask.",
  ],
};