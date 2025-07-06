import { z } from 'zod';

export const TraitMasterySchema = z.enum(['bronze', 'silver', 'gold']);
export type TraitMastery = z.infer<typeof TraitMasterySchema>;

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

export const TraitDetailsSchema = z.object({
  id: NeurodivergentTraitSchema,
  name: z.string(),
  description: z.string(),
  positiveFraming: z.string(),
  missionBenefit: z.string(),
  combatAbility: z.object({
    name: z.string(),
    description: z.string(),
    cooldown: z.number(),
    energyCost: z.number(),
  }),
  statModifiers: z.object({
    focus: z.number().optional(),
    perception: z.number().optional(),
    social: z.number().optional(),
    logic: z.number().optional(),
    stamina: z.number().optional(),
  }),
  masteryBonuses: z.object({
    bronze: z.string(),
    silver: z.string(),
    gold: z.string(),
  }),
});

export type TraitDetails = z.infer<typeof TraitDetailsSchema>;

export const NEURODIVERGENT_TRAITS: Record<NeurodivergentTrait, TraitDetails> = {
  hyperfocus: {
    id: 'hyperfocus',
    name: 'Hyperfocus',
    description: 'The ability to concentrate intensely on tasks of interest',
    positiveFraming: 'Your intense concentration allows you to achieve extraordinary results when engaged with meaningful work.',
    missionBenefit: '+50% efficiency on familiar or interesting tasks',
    combatAbility: {
      name: 'Deep Focus',
      description: 'Enter a state of intense concentration, gaining an extra action this turn',
      cooldown: 3,
      energyCost: 20,
    },
    statModifiers: {
      focus: 50,
      stamina: -10,
    },
    masteryBonuses: {
      bronze: '+60% efficiency instead of +50%',
      silver: '+75% efficiency and reduced energy drain',
      gold: '+100% efficiency and immunity to interruptions',
    },
  },
  pattern_recognition: {
    id: 'pattern_recognition',
    name: 'Pattern Recognition',
    description: 'Natural ability to identify patterns and connections others miss',
    positiveFraming: 'Your mind excels at finding hidden connections and patterns that reveal deeper truths.',
    missionBenefit: 'Reveals hidden information and shortcuts in missions',
    combatAbility: {
      name: 'Pattern Analysis',
      description: 'Analyze enemy patterns, revealing their next 2 moves',
      cooldown: 2,
      energyCost: 15,
    },
    statModifiers: {
      perception: 30,
      logic: 20,
    },
    masteryBonuses: {
      bronze: 'Reveals 3 moves instead of 2',
      silver: 'Also shows enemy weaknesses',
      gold: 'Predicts entire battle flow',
    },
  },
  enhanced_senses: {
    id: 'enhanced_senses',
    name: 'Enhanced Senses',
    description: 'Heightened sensory perception and awareness',
    positiveFraming: 'Your enhanced sensory perception allows you to notice details that others overlook.',
    missionBenefit: 'Superior performance in quality control and observation missions',
    combatAbility: {
      name: 'Sensory Overdrive',
      description: 'Heighten all senses, +50% accuracy and dodge for 2 turns',
      cooldown: 4,
      energyCost: 25,
    },
    statModifiers: {
      perception: 40,
      focus: -5,
    },
    masteryBonuses: {
      bronze: '+60% accuracy/dodge',
      silver: 'Lasts 3 turns',
      gold: 'Grants team-wide sensory boost',
    },
  },
  systematic_thinking: {
    id: 'systematic_thinking',
    name: 'Systematic Thinking',
    description: 'Structured approach to problem-solving and organization',
    positiveFraming: 'Your systematic approach creates elegant solutions to complex problems.',
    missionBenefit: 'Bonus rewards from puzzle and analysis missions',
    combatAbility: {
      name: 'Optimal Strategy',
      description: 'Calculate the best move sequence, showing damage preview',
      cooldown: 2,
      energyCost: 10,
    },
    statModifiers: {
      logic: 40,
      social: -10,
    },
    masteryBonuses: {
      bronze: 'Shows top 2 strategies',
      silver: 'Includes defensive options',
      gold: 'Predicts victory probability',
    },
  },
  attention_to_detail: {
    id: 'attention_to_detail',
    name: 'Attention to Detail',
    description: 'Exceptional focus on small but important details',
    positiveFraming: 'Your meticulous attention ensures nothing important is ever missed.',
    missionBenefit: 'Automatically spots discrepancies and hidden items',
    combatAbility: {
      name: 'Precision Strike',
      description: 'Target weak points for +30% critical chance this turn',
      cooldown: 1,
      energyCost: 5,
    },
    statModifiers: {
      perception: 25,
      focus: 25,
    },
    masteryBonuses: {
      bronze: '+40% critical chance',
      silver: '+50% and pierces armor',
      gold: 'Guaranteed critical with bonus damage',
    },
  },
  routine_mastery: {
    id: 'routine_mastery',
    name: 'Routine Mastery',
    description: 'Excellence through consistent patterns and repetition',
    positiveFraming: 'Your mastery of routines creates unmatched efficiency and reliability.',
    missionBenefit: '30% faster completion of repeated mission types',
    combatAbility: {
      name: 'Practiced Perfection',
      description: 'Reset all ability cooldowns',
      cooldown: 5,
      energyCost: 30,
    },
    statModifiers: {
      stamina: 30,
      focus: 20,
    },
    masteryBonuses: {
      bronze: '40% faster repeated missions',
      silver: '50% faster and bonus rewards',
      gold: 'Instant completion option unlocked',
    },
  },
  sensory_processing: {
    id: 'sensory_processing',
    name: 'Sensory Processing',
    description: 'Unique way of experiencing and interpreting sensory information',
    positiveFraming: 'Your unique sensory processing grants insights others cannot perceive.',
    missionBenefit: 'Enhanced performance in investigation and creative missions',
    combatAbility: {
      name: 'Sensory Map',
      description: 'Reveal all enemies and hazards on the battlefield',
      cooldown: 3,
      energyCost: 20,
    },
    statModifiers: {
      perception: 50,
      stamina: -15,
    },
    masteryBonuses: {
      bronze: 'Also shows item locations',
      silver: 'Predicts environmental changes',
      gold: 'Grants perfect battlefield awareness',
    },
  },
};

export const TraitCombinationSchema = z.object({
  traits: z.array(NeurodivergentTraitSchema).min(2).max(2),
  synergyBonus: z.string(),
  unlockCondition: z.string(),
});

export type TraitCombination = z.infer<typeof TraitCombinationSchema>;

export const TRAIT_SYNERGIES: TraitCombination[] = [
  {
    traits: ['hyperfocus', 'pattern_recognition'],
    synergyBonus: 'Deep Analysis: Uncover hidden mechanics in complex systems',
    unlockCondition: 'Both traits at Silver mastery',
  },
  {
    traits: ['enhanced_senses', 'sensory_processing'],
    synergyBonus: 'Sensory Symphony: Perfect environmental awareness',
    unlockCondition: 'Complete 10 missions using both traits',
  },
  {
    traits: ['systematic_thinking', 'attention_to_detail'],
    synergyBonus: 'Perfect Execution: Zero margin for error',
    unlockCondition: 'Achieve Gold mastery in either trait',
  },
  {
    traits: ['routine_mastery', 'hyperfocus'],
    synergyBonus: 'Flow State: Unlimited efficiency on familiar tasks',
    unlockCondition: 'Complete 50 repeated missions',
  },
];

export const calculateTraitEffectiveness = (
  trait: NeurodivergentTrait,
  mastery: TraitMastery,
  partnerLevel: number
): number => {
  const masteryMultipliers = {
    bronze: 1.2,
    silver: 1.5,
    gold: 2.0,
  };
  
  const baseEffectiveness = 100;
  const levelBonus = partnerLevel * 2;
  const masteryBonus = masteryMultipliers[mastery];
  
  return Math.floor(baseEffectiveness * masteryBonus + levelBonus);
};