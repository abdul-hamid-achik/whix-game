import { z } from 'zod';

export const PartnerClassSchema = z.enum([
  'courier',
  'analyst', 
  'negotiator',
  'specialist',
  'investigator'
]);

export type PartnerClass = z.infer<typeof PartnerClassSchema>;

export const PartnerClassDetailsSchema = z.object({
  id: PartnerClassSchema,
  name: z.string(),
  description: z.string(),
  primaryStats: z.array(z.enum(['focus', 'perception', 'social', 'logic', 'stamina'])),
  statDistribution: z.object({
    focus: z.number(),
    perception: z.number(),
    social: z.number(),
    logic: z.number(),
    stamina: z.number(),
  }),
  color: z.string(),
  icon: z.string(),
  abilities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    unlockLevel: z.number(),
  })),
});

export type PartnerClassDetails = z.infer<typeof PartnerClassDetailsSchema>;

export const PARTNER_CLASSES: Record<PartnerClass, PartnerClassDetails> = {
  courier: {
    id: 'courier',
    name: 'Courier',
    description: 'Basic delivery specialists with balanced stats for all-around performance',
    primaryStats: ['stamina', 'focus'],
    statDistribution: {
      focus: 50,
      perception: 50,
      social: 50,
      logic: 50,
      stamina: 50,
    },
    color: '#3b82f6',
    icon: 'Package',
    abilities: [
      {
        name: 'Quick Delivery',
        description: 'Complete standard missions 20% faster',
        unlockLevel: 1,
      },
      {
        name: 'Route Optimization',
        description: 'Find the most efficient paths automatically',
        unlockLevel: 5,
      },
    ],
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    description: 'Pattern recognition experts who excel at puzzle solving and data analysis',
    primaryStats: ['logic', 'perception'],
    statDistribution: {
      focus: 60,
      perception: 70,
      social: 30,
      logic: 80,
      stamina: 40,
    },
    color: '#8b5cf6',
    icon: 'Brain',
    abilities: [
      {
        name: 'Data Mining',
        description: 'Extract bonus information from analysis missions',
        unlockLevel: 1,
      },
      {
        name: 'Pattern Mastery',
        description: 'Instantly solve pattern-based puzzles',
        unlockLevel: 7,
      },
    ],
  },
  negotiator: {
    id: 'negotiator',
    name: 'Negotiator',
    description: 'Social interaction specialists who excel at customer relations',
    primaryStats: ['social', 'perception'],
    statDistribution: {
      focus: 50,
      perception: 60,
      social: 80,
      logic: 50,
      stamina: 40,
    },
    color: '#ec4899',
    icon: 'Users',
    abilities: [
      {
        name: 'Silver Tongue',
        description: 'Unlock additional dialogue options',
        unlockLevel: 1,
      },
      {
        name: 'Reputation Boost',
        description: 'Earn 30% more tips from social missions',
        unlockLevel: 6,
      },
    ],
  },
  specialist: {
    id: 'specialist',
    name: 'Specialist',
    description: 'Premium service providers who handle complex and high-value tasks',
    primaryStats: ['focus', 'stamina'],
    statDistribution: {
      focus: 70,
      perception: 60,
      social: 50,
      logic: 60,
      stamina: 60,
    },
    color: '#f59e0b',
    icon: 'Star',
    abilities: [
      {
        name: 'Premium Service',
        description: 'Access to high-paying special missions',
        unlockLevel: 1,
      },
      {
        name: 'Quality Guarantee',
        description: 'Never fail quality control checks',
        unlockLevel: 8,
      },
    ],
  },
  investigator: {
    id: 'investigator',
    name: 'Investigator',
    description: 'Information gathering experts with enhanced observation skills',
    primaryStats: ['perception', 'logic'],
    statDistribution: {
      focus: 60,
      perception: 80,
      social: 40,
      logic: 70,
      stamina: 40,
    },
    color: '#10b981',
    icon: 'Search',
    abilities: [
      {
        name: 'Keen Observation',
        description: 'Reveal hidden clues and information',
        unlockLevel: 1,
      },
      {
        name: 'Case Closed',
        description: 'Instantly complete investigation missions',
        unlockLevel: 9,
      },
    ],
  },
};

export const calculatePartnerStats = (
  baseClass: PartnerClass,
  level: number,
  rarity: z.infer<typeof RaritySchema>,
  traits: z.infer<typeof NeurodivergentTraitSchema>[]
) => {
  const classStats = PARTNER_CLASSES[baseClass].statDistribution;
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
  const levelMultiplier = 1 + (level - 1) * 0.1;
  
  const stats = { ...classStats };
  
  Object.keys(stats).forEach((stat) => {
    const key = stat as keyof typeof stats;
    stats[key] = Math.floor(stats[key] * rarityMultiplier * levelMultiplier);
  });
  
  traits.forEach((trait) => {
    const traitData = NEURODIVERGENT_TRAITS[trait];
    if (traitData.statModifiers) {
      Object.entries(traitData.statModifiers).forEach(([stat, modifier]) => {
        const key = stat as keyof typeof stats;
        if (key in stats) {
          stats[key] = Math.floor(stats[key] * (1 + modifier / 100));
        }
      });
    }
  });
  
  return stats;
};

export const RaritySchema = z.enum(['common', 'rare', 'epic', 'legendary']);
export type Rarity = z.infer<typeof RaritySchema>;

export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1,
  rare: 1.2,
  epic: 1.5,
  legendary: 2,
};

export const NeurodivergentTraitSchema = z.enum([
  'hyperfocus',
  'pattern_recognition',
  'enhanced_senses',
  'systematic_thinking',
  'attention_to_detail',
  'routine_mastery',
  'sensory_processing'
]);

export type NeurodivergentTrait = z.infer<typeof NeurodivergentTraitSchema>;

export const NEURODIVERGENT_TRAITS: Record<NeurodivergentTrait, {
  name: string;
  description: string;
  statModifiers?: Record<string, number>;
  combatAbility?: string;
}> = {
  hyperfocus: {
    name: 'Hyperfocus',
    description: '+50% efficiency on familiar tasks',
    statModifiers: { focus: 50 },
    combatAbility: 'Double action this turn',
  },
  pattern_recognition: {
    name: 'Pattern Recognition',
    description: 'Reveals hidden information',
    statModifiers: { perception: 30, logic: 20 },
    combatAbility: 'Reveal enemy patterns',
  },
  enhanced_senses: {
    name: 'Enhanced Senses',
    description: 'Better at quality control missions',
    statModifiers: { perception: 40 },
    combatAbility: 'Increased accuracy/dodge',
  },
  systematic_thinking: {
    name: 'Systematic Thinking',
    description: 'Bonus to puzzle solving',
    statModifiers: { logic: 40 },
    combatAbility: 'Calculate optimal moves',
  },
  attention_to_detail: {
    name: 'Attention to Detail',
    description: 'Spot discrepancies',
    statModifiers: { perception: 25, focus: 25 },
    combatAbility: 'Critical hit chance +30%',
  },
  routine_mastery: {
    name: 'Routine Mastery',
    description: 'Faster completion of repeated tasks',
    statModifiers: { stamina: 30, focus: 20 },
    combatAbility: 'Reduce ability cooldowns',
  },
  sensory_processing: {
    name: 'Sensory Processing',
    description: 'Enhanced perception in missions',
    statModifiers: { perception: 50 },
    combatAbility: 'Area awareness boost',
  },
};