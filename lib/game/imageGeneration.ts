import { z } from 'zod';
import { CharacterRarity } from './gacha';

// Character visual attributes for image generation
export const CharacterVisualAttributesSchema = z.object({
  // Base attributes
  bodyType: z.enum(['slim', 'average', 'stocky', 'athletic']),
  skinTone: z.enum(['pale', 'light', 'medium', 'tan', 'dark', 'deep']),
  hairStyle: z.enum([
    'buzz_cut', 'short_messy', 'medium_wavy', 'long_straight', 
    'dreadlocks', 'mohawk', 'bald', 'ponytail', 'braids', 'afro'
  ]),
  hairColor: z.enum([
    'black', 'brown', 'blonde', 'red', 'gray', 'white', 
    'blue', 'green', 'purple', 'pink' // Dystopian colors
  ]),
  facialHair: z.enum(['none', 'stubble', 'goatee', 'full_beard', 'mustache']).optional(),
  
  // Clothing - Delivery worker themed
  uniform: z.enum([
    'basic_whix', // Standard WHIX uniform
    'worn_whix', // Battle-worn uniform
    'premium_whix', // Premium courier uniform
    'indie_courier', // Independent courier outfit
    'resistance', // Anti-WHIX resistance gear
    'corporate', // Corporate infiltration suit
    'night_rider', // Night delivery specialist
    'weather_gear' // All-weather delivery gear
  ]),
  
  // Accessories
  helmet: z.enum(['none', 'basic', 'smart', 'damaged', 'custom', 'visor']),
  glasses: z.enum(['none', 'sunglasses', 'smart_glasses', 'goggles', 'broken']),
  mask: z.enum(['none', 'medical', 'pollution', 'bandana', 'tech_mask']),
  
  // Equipment
  backpack: z.enum(['basic', 'insulated', 'mega', 'tech', 'makeshift']),
  vehicle: z.enum(['bike', 'ebike', 'scooter', 'skateboard', 'rollerblades', 'on_foot']),
  
  // Environmental details
  weatherEffect: z.enum(['none', 'rain', 'snow', 'heat_waves', 'smog']),
  timeOfDay: z.enum(['dawn', 'day', 'dusk', 'night', 'neon_night']),
  
  // Unique features based on rarity
  specialEffect: z.enum([
    'none',
    'glowing_eyes', // Augmented
    'data_stream', // Tech integration
    'exhausted_aura', // Overworked
    'golden_glow', // Legendary courier
    'resistance_badge', // Anti-corporate
    'corpo_implants' // Corporate mods
  ]).optional(),
  
  // Pose
  pose: z.enum([
    'standing_ready',
    'on_vehicle',
    'holding_food',
    'checking_phone',
    'arguing',
    'exhausted',
    'victorious'
  ])
});

export type CharacterVisualAttributes = z.infer<typeof CharacterVisualAttributesSchema>;

// Rarity-based attribute pools
const ATTRIBUTE_POOLS: Record<CharacterRarity, Partial<CharacterVisualAttributes>> = {
  common: {
    specialEffect: 'none',
    uniform: 'basic_whix',
    helmet: 'basic',
    backpack: 'basic'
  },
  rare: {
    specialEffect: 'none',
    uniform: 'worn_whix',
    helmet: 'smart',
    backpack: 'insulated'
  },
  epic: {
    specialEffect: 'exhausted_aura',
    uniform: 'indie_courier',
    helmet: 'custom',
    backpack: 'tech'
  },
  legendary: {
    specialEffect: 'golden_glow',
    uniform: 'premium_whix',
    helmet: 'visor',
    backpack: 'mega'
  },
  mythic: {
    specialEffect: 'data_stream',
    uniform: 'resistance',
    helmet: 'visor',
    backpack: 'tech'
  }
};

// Generate random attributes based on rarity
export function generateCharacterVisualAttributes(rarity: CharacterRarity): CharacterVisualAttributes {
  const rarityDefaults = ATTRIBUTE_POOLS[rarity];
  
  // Random selection functions
  const randomFrom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  const bodyTypes: CharacterVisualAttributes['bodyType'][] = ['slim', 'average', 'stocky', 'athletic'];
  const skinTones: CharacterVisualAttributes['skinTone'][] = ['pale', 'light', 'medium', 'tan', 'dark', 'deep'];
  const hairStyles: CharacterVisualAttributes['hairStyle'][] = [
    'buzz_cut', 'short_messy', 'medium_wavy', 'long_straight', 
    'dreadlocks', 'mohawk', 'bald', 'ponytail', 'braids', 'afro'
  ];
  const hairColors: CharacterVisualAttributes['hairColor'][] = [
    'black', 'brown', 'blonde', 'red', 'gray', 'white', 
    'blue', 'green', 'purple', 'pink'
  ];
  const poses: CharacterVisualAttributes['pose'][] = [
    'standing_ready', 'on_vehicle', 'holding_food', 
    'checking_phone', 'arguing', 'exhausted', 'victorious'
  ];
  const vehicles: CharacterVisualAttributes['vehicle'][] = [
    'bike', 'ebike', 'scooter', 'skateboard', 'rollerblades', 'on_foot'
  ];
  
  // Higher rarity = more exotic features
  const useExoticHair = rarity === 'mythic' || rarity === 'legendary' || Math.random() < 0.2;
  const availableHairColors = useExoticHair ? hairColors : hairColors.slice(0, 6);
  
  return {
    bodyType: randomFrom(bodyTypes),
    skinTone: randomFrom(skinTones),
    hairStyle: randomFrom(hairStyles),
    hairColor: randomFrom(availableHairColors),
    facialHair: Math.random() < 0.3 ? randomFrom(['stubble', 'goatee', 'full_beard', 'mustache']) : 'none',
    uniform: rarityDefaults.uniform || randomFrom(['basic_whix', 'worn_whix', 'indie_courier']),
    helmet: rarityDefaults.helmet || randomFrom(['none', 'basic', 'smart']),
    glasses: randomFrom(['none', 'sunglasses', 'smart_glasses', 'goggles', 'broken']),
    mask: Math.random() < 0.4 ? randomFrom(['medical', 'pollution', 'bandana', 'tech_mask']) : 'none',
    backpack: rarityDefaults.backpack || 'basic',
    vehicle: randomFrom(vehicles),
    weatherEffect: randomFrom(['none', 'rain', 'snow', 'heat_waves', 'smog']),
    timeOfDay: randomFrom(['dawn', 'day', 'dusk', 'night', 'neon_night']),
    specialEffect: rarityDefaults.specialEffect,
    pose: randomFrom(poses)
  };
}

// Create detailed prompt for AI image generation
export function createCharacterImagePrompt(
  attributes: CharacterVisualAttributes,
  rarity: CharacterRarity,
  _name?: string
): string {
  const parts: string[] = [
    'pixel art style',
    '32x32 pixel character',
    'delivery courier gig worker',
    'dystopian cyberpunk Aztec-Soviet aesthetic',
    'Mexico City Polanco setting'
  ];
  
  // Character description
  parts.push(`${attributes.bodyType} build ${attributes.skinTone} skin`);
  
  // Hair
  if (attributes.hairStyle !== 'bald') {
    parts.push(`${attributes.hairColor} ${attributes.hairStyle.replace('_', ' ')} hair`);
  }
  
  if (attributes.facialHair && attributes.facialHair !== 'none') {
    parts.push(attributes.facialHair.replace('_', ' '));
  }
  
  // Clothing
  const uniformDescriptions: Record<string, string> = {
    basic_whix: 'basic red WHIX delivery uniform',
    worn_whix: 'battle-worn WHIX uniform with patches',
    premium_whix: 'premium black and gold WHIX uniform',
    indie_courier: 'independent courier outfit with custom mods',
    resistance: 'anti-corporate resistance gear with symbols',
    corporate: 'corporate infiltration business casual',
    night_rider: 'night delivery specialist dark gear',
    weather_gear: 'all-weather protective delivery gear'
  };
  
  parts.push(uniformDescriptions[attributes.uniform] || attributes.uniform);
  
  // Accessories
  if (attributes.helmet !== 'none') {
    parts.push(`${attributes.helmet} delivery helmet`);
  }
  
  if (attributes.glasses !== 'none') {
    parts.push(attributes.glasses.replace('_', ' '));
  }
  
  if (attributes.mask !== 'none') {
    parts.push(attributes.mask.replace('_', ' '));
  }
  
  // Equipment
  const backpackDesc: Record<string, string> = {
    basic: 'basic delivery backpack',
    insulated: 'insulated food delivery bag',
    mega: 'oversized multi-order backpack',
    tech: 'high-tech smart delivery pack',
    makeshift: 'makeshift DIY delivery bag'
  };
  
  parts.push(backpackDesc[attributes.backpack]);
  
  // Pose and vehicle
  const poseDesc: Record<string, string> = {
    standing_ready: 'standing ready for delivery',
    on_vehicle: `riding ${attributes.vehicle}`,
    holding_food: 'holding food delivery bag',
    checking_phone: 'checking WHIX app on phone',
    arguing: 'in heated discussion gesture',
    exhausted: 'exhausted slouching posture',
    victorious: 'victorious fist pump pose'
  };
  
  parts.push(poseDesc[attributes.pose]);
  
  // Environmental
  if (attributes.weatherEffect !== 'none') {
    parts.push(`${attributes.weatherEffect} weather effect`);
  }
  
  parts.push(`${attributes.timeOfDay} lighting`);
  
  // Special effects for rarity
  if (attributes.specialEffect && attributes.specialEffect !== 'none') {
    const effectDesc: Record<string, string> = {
      glowing_eyes: 'glowing augmented eyes',
      data_stream: 'digital data streams flowing',
      exhausted_aura: 'visible exhaustion aura',
      golden_glow: 'legendary golden courier glow',
      resistance_badge: 'anti-WHIX resistance symbols glowing',
      corpo_implants: 'visible corporate neural implants'
    };
    
    parts.push(effectDesc[attributes.specialEffect]);
  }
  
  // Rarity glow
  const rarityColors: Record<CharacterRarity, string> = {
    common: 'subtle gray outline',
    rare: 'blue glow outline',
    epic: 'purple energy outline',
    legendary: 'golden shimmer outline',
    mythic: 'rainbow prismatic outline'
  };
  
  parts.push(rarityColors[rarity]);
  
  // Style modifiers
  parts.push('retro pixel art', 'limited color palette', 'dithering effect');
  
  return parts.join(', ');
}

// Generate unique seed for consistent character generation
export function generateCharacterSeed(attributes: CharacterVisualAttributes): string {
  const values = Object.values(attributes).join('-');
  return Buffer.from(values).toString('base64').substring(0, 16);
}