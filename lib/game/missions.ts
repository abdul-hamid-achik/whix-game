import { z } from 'zod';
import { NeurodivergentTraitSchema, PartnerClassSchema } from './classes';

export const MissionTypeSchema = z.enum([
  'standard_delivery',
  'customer_negotiation',
  'quality_control',
  'data_analysis',
  'investigation',
  'special_event',
  'story',
  'daily',
  'weekly',
]);

export type MissionType = z.infer<typeof MissionTypeSchema>;

export const MissionDifficultySchema = z.enum(['easy', 'normal', 'hard', 'expert', 'nightmare']);
export type MissionDifficulty = z.infer<typeof MissionDifficultySchema>;

export const MissionRequirementSchema = z.object({
  level: z.number().optional(),
  class: PartnerClassSchema.optional(),
  traits: z.array(NeurodivergentTraitSchema).optional(),
  stats: z.object({
    focus: z.number().optional(),
    perception: z.number().optional(),
    social: z.number().optional(),
    logic: z.number().optional(),
    stamina: z.number().optional(),
  }).optional(),
});

export type MissionRequirement = z.infer<typeof MissionRequirementSchema>;

export const MissionRewardSchema = z.object({
  tips: z.number(),
  starFragments: z.number().optional(),
  experience: z.number(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    chance: z.number(), // 0-100 percentage
  })).optional(),
  traitExperience: z.object({
    trait: NeurodivergentTraitSchema,
    amount: z.number(),
  }).optional(),
});

export type MissionReward = z.infer<typeof MissionRewardSchema>;

export const MissionObjectiveSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.enum(['deliver', 'talk', 'analyze', 'investigate', 'survive', 'collect']),
  target: z.union([z.string(), z.number()]).optional(),
  current: z.number().default(0),
  required: z.number().default(1),
  completed: z.boolean().default(false),
});

export type MissionObjective = z.infer<typeof MissionObjectiveSchema>;

export const MissionSchema = z.object({
  id: z.string(),
  type: MissionTypeSchema,
  title: z.string(),
  description: z.string(),
  difficulty: MissionDifficultySchema,
  requirements: MissionRequirementSchema.optional(),
  rewards: MissionRewardSchema,
  objectives: z.array(MissionObjectiveSchema),
  timeLimit: z.number().optional(), // in minutes
  specialConditions: z.array(z.object({
    type: z.string(),
    description: z.string(),
    effect: z.any(),
  })).optional(),
  dialogue: z.array(z.object({
    speaker: z.string(),
    text: z.string(),
    portrait: z.string().optional(),
    choices: z.array(z.object({
      text: z.string(),
      requirement: z.object({
        trait: NeurodivergentTraitSchema.optional(),
        stat: z.string().optional(),
        value: z.number().optional(),
      }).optional(),
      outcome: z.string(),
    })).optional(),
  })).optional(),
});

export type Mission = z.infer<typeof MissionSchema>;

export const MISSION_TEMPLATES: Record<MissionType, Partial<Mission>> = {
  standard_delivery: {
    type: 'standard_delivery',
    objectives: [{
      id: 'deliver',
      description: 'Deliver package to destination',
      type: 'deliver',
      current: 0,
      required: 1,
      completed: false,
    }],
    rewards: {
      tips: 50,
      experience: 20,
    },
  },
  customer_negotiation: {
    type: 'customer_negotiation',
    objectives: [{
      id: 'negotiate',
      description: 'Successfully negotiate with customer',
      type: 'talk',
      current: 0,
      required: 1,
      completed: false,
    }],
    rewards: {
      tips: 75,
      experience: 30,
    },
  },
  quality_control: {
    type: 'quality_control',
    objectives: [{
      id: 'inspect',
      description: 'Inspect items for quality issues',
      type: 'analyze',
      current: 0,
      required: 5,
      completed: false,
    }],
    rewards: {
      tips: 60,
      experience: 25,
    },
  },
  data_analysis: {
    type: 'data_analysis',
    objectives: [{
      id: 'analyze_data',
      description: 'Analyze data patterns',
      type: 'analyze',
      current: 0,
      required: 3,
      completed: false,
    }],
    rewards: {
      tips: 80,
      experience: 35,
      starFragments: 1,
    },
  },
  investigation: {
    type: 'investigation',
    objectives: [{
      id: 'find_clues',
      description: 'Gather clues about the target',
      type: 'investigate',
      current: 0,
      required: 4,
      completed: false,
    }],
    rewards: {
      tips: 100,
      experience: 40,
      starFragments: 2,
    },
  },
  special_event: {
    type: 'special_event',
    objectives: [{
      id: 'special_objective',
      description: 'Complete the special event',
      type: 'survive',
      current: 0,
      required: 1,
      completed: false,
    }],
    rewards: {
      tips: 200,
      experience: 100,
      starFragments: 5,
    },
  },
  story: {
    type: 'story',
    objectives: [{
      id: 'story_progress',
      description: 'Progress through the story',
      type: 'talk',
      current: 0,
      required: 1,
      completed: false,
    }],
    rewards: {
      tips: 0,
      experience: 50,
    },
  },
  daily: {
    type: 'daily',
    objectives: [{
      id: 'daily_task',
      description: 'Complete daily tasks',
      type: 'deliver',
      current: 0,
      required: 3,
      completed: false,
    }],
    rewards: {
      tips: 150,
      experience: 60,
      starFragments: 3,
    },
  },
  weekly: {
    type: 'weekly',
    objectives: [{
      id: 'weekly_challenge',
      description: 'Complete weekly challenge',
      type: 'collect',
      current: 0,
      required: 10,
      completed: false,
    }],
    rewards: {
      tips: 500,
      experience: 200,
      starFragments: 10,
    },
  },
};

export const generateMission = (
  type: MissionType,
  difficulty: MissionDifficulty,
  playerLevel: number
): Mission => {
  const template = MISSION_TEMPLATES[type];
  const difficultyMultipliers = {
    easy: 0.8,
    normal: 1,
    hard: 1.5,
    expert: 2,
    nightmare: 3,
  };
  
  const multiplier = difficultyMultipliers[difficulty];
  const levelBonus = 1 + (playerLevel - 1) * 0.1;
  
  return {
    id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: generateMissionTitle(type, difficulty),
    description: generateMissionDescription(type, difficulty),
    difficulty,
    requirements: generateRequirements(type, difficulty, playerLevel),
    rewards: {
      tips: Math.floor((template.rewards?.tips || 50) * multiplier * levelBonus),
      experience: Math.floor((template.rewards?.experience || 20) * multiplier),
      starFragments: template.rewards?.starFragments ? 
        Math.floor(template.rewards.starFragments * multiplier) : undefined,
    },
    objectives: template.objectives || [],
  };
};

function generateMissionTitle(type: MissionType, difficulty: MissionDifficulty): string {
  const titles: Record<MissionType, string[]> = {
    standard_delivery: ['Express Delivery', 'Package Run', 'Quick Drop-off'],
    customer_negotiation: ['Difficult Customer', 'Price Haggling', 'Service Recovery'],
    quality_control: ['Quality Check', 'Inspection Duty', 'Standards Compliance'],
    data_analysis: ['Data Mining', 'Pattern Search', 'System Analysis'],
    investigation: ['Missing Package', 'Fraud Detection', 'Mystery Client'],
    special_event: ['System Glitch', 'Corporate Raid', 'Underground Mission'],
    story: ['Chapter Progress', 'Story Mission', 'Main Quest'],
    daily: ['Daily Grind', 'Routine Tasks', 'Daily Quota'],
    weekly: ['Weekly Challenge', 'Special Assignment', 'Elite Task'],
  };
  
  const titleOptions = titles[type];
  const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
  const difficultyPrefix = difficulty === 'nightmare' ? '⚠️ ' : '';
  
  return `${difficultyPrefix}${title}`;
}

function generateMissionDescription(type: MissionType, _difficulty: MissionDifficulty): string {
  const descriptions: Record<MissionType, string[]> = {
    standard_delivery: [
      'Deliver packages within the time limit',
      'Get these items to their destinations quickly',
      'Standard delivery run through the district',
    ],
    customer_negotiation: [
      'Handle a difficult customer situation',
      'Negotiate better terms with a client',
      'Resolve a service complaint diplomatically',
    ],
    quality_control: [
      'Inspect packages for damage or tampering',
      'Ensure all items meet quality standards',
      'Check deliveries for accuracy and condition',
    ],
    data_analysis: [
      'Analyze delivery patterns for optimization',
      'Find anomalies in the system data',
      'Decrypt encoded customer information',
    ],
    investigation: [
      'Investigate suspicious activity in the area',
      'Track down a missing high-value package',
      'Gather intelligence on competitor operations',
    ],
    special_event: [
      'Handle an unexpected system crisis',
      'Navigate through a corporate lockdown',
      'Complete a high-stakes underground delivery',
    ],
    story: [
      'Continue your journey through Neo Prosperity',
      'Uncover more about Whix\'s true nature',
      'Progress the main storyline',
    ],
    daily: [
      'Complete your daily delivery quota',
      'Finish today\'s assigned tasks',
      'Meet the daily performance targets',
    ],
    weekly: [
      'Take on this week\'s special challenge',
      'Complete the elite weekly assignment',
      'Prove yourself with this difficult task',
    ],
  };
  
  const descOptions = descriptions[type];
  return descOptions[Math.floor(Math.random() * descOptions.length)];
}

function generateRequirements(
  type: MissionType, 
  difficulty: MissionDifficulty, 
  playerLevel: number
): MissionRequirement {
  const difficultyLevels = {
    easy: -2,
    normal: 0,
    hard: 2,
    expert: 5,
    nightmare: 10,
  };
  
  const requiredLevel = Math.max(1, playerLevel + difficultyLevels[difficulty]);
  
  const requirements: MissionRequirement = {
    level: requiredLevel,
  };
  
  // Add specific requirements based on mission type
  if (type === 'customer_negotiation') {
    requirements.stats = { social: 40 + (difficultyLevels[difficulty] * 5) };
  } else if (type === 'data_analysis') {
    requirements.stats = { logic: 40 + (difficultyLevels[difficulty] * 5) };
  } else if (type === 'investigation') {
    requirements.stats = { perception: 40 + (difficultyLevels[difficulty] * 5) };
  }
  
  return requirements;
}