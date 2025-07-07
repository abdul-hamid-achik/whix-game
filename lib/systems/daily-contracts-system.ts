import { z } from 'zod';

// Contract types based on WHIX's gig economy theme
export const ContractTypeSchema = z.enum([
  'express_delivery',
  'data_courier',
  'social_negotiation',
  'puzzle_solving',
  'combat_escort',
  'stealth_delivery',
  'multi_drop',
  'timed_rush'
]);

export type ContractType = z.infer<typeof ContractTypeSchema>;

// Difficulty affects rewards and requirements
export const ContractDifficultySchema = z.enum(['easy', 'normal', 'hard', 'extreme']);
export type ContractDifficulty = z.infer<typeof ContractDifficultySchema>;

// Contract requirements
export const ContractRequirementSchema = z.object({
  minLevel: z.number().optional(),
  requiredTrait: z.string().optional(),
  requiredClass: z.string().optional(),
  completedMissions: z.number().optional(),
});

// Daily Contract schema
export const DailyContractSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date string
  type: ContractTypeSchema,
  title: z.string(),
  description: z.string(),
  clientName: z.string(),
  difficulty: ContractDifficultySchema,
  requirements: ContractRequirementSchema,
  objectives: z.array(z.object({
    id: z.string(),
    description: z.string(),
    completed: z.boolean(),
    progress: z.number().optional(),
    target: z.number().optional(),
  })),
  rewards: z.object({
    tips: z.number(),
    experience: z.number(),
    items: z.array(z.string()).optional(),
    partnerUnlock: z.string().optional(),
    bonusObjective: z.object({
      description: z.string(),
      reward: z.number(),
    }).optional(),
  }),
  timeLimit: z.number(), // in minutes
  expiresAt: z.string(), // ISO timestamp
  completed: z.boolean(),
  claimed: z.boolean(),
});

export type DailyContract = z.infer<typeof DailyContractSchema>;

// Contract templates for variety
const CONTRACT_TEMPLATES: Record<ContractType, {
  titles: string[];
  descriptions: string[];
  clients: string[];
  objectives: string[][];
}> = {
  express_delivery: {
    titles: [
      'Rush Hour Madness',
      'Priority Package Protocol',
      'Time-Critical Cargo',
      'Express Lane Elite'
    ],
    descriptions: [
      'Corporate exec needs their package ASAP. No delays tolerated.',
      'Medical supplies must reach the clinic before someone notices they\'re missing.',
      'Deliver the mysterious package. Don\'t ask questions.',
      'VIP client demands white-glove service. Make it happen.'
    ],
    clients: ['NeuroCorp Executive', 'Underground Clinic', 'Anonymous Sender', 'Elite Penthouse Resident'],
    objectives: [
      ['Deliver within time limit', 'Avoid detection by WHIX supervisors'],
      ['Complete delivery', 'Maintain package integrity above 80%'],
      ['Reach destination', 'Don\'t scan the package contents'],
      ['Deliver with style', 'Earn 5-star rating']
    ]
  },
  data_courier: {
    titles: [
      'Digital Dead Drop',
      'Encrypted Exchange',
      'Data Smuggling Run',
      'Information Broker'
    ],
    descriptions: [
      'Transport sensitive data through corporate firewalls.',
      'Exchange encrypted files without triggering security.',
      'Smuggle resistance intel past WHIX monitoring.',
      'Broker information between rival factions.'
    ],
    clients: ['Resistance Hacker', 'Corporate Spy', 'Data Broker', 'Anonymous Whistleblower'],
    objectives: [
      ['Download data packet', 'Upload to secure server', 'Avoid digital traces'],
      ['Meet contact', 'Exchange verification codes', 'Complete transfer'],
      ['Bypass 3 security nodes', 'Deliver intel intact'],
      ['Contact both parties', 'Negotiate fair exchange', 'Secure payment']
    ]
  },
  social_negotiation: {
    titles: [
      'Customer Crisis Management',
      'Union Negotiation',
      'Corporate Peacekeeping',
      'Reputation Recovery'
    ],
    descriptions: [
      'Smooth over a delivery disaster with an angry customer.',
      'Negotiate better conditions with fellow couriers.',
      'Mediate between competing corporate interests.',
      'Rebuild trust after a major WHIX scandal.'
    ],
    clients: ['Angry Customer', 'Courier Union Rep', 'Corporate Mediator', 'PR Department'],
    objectives: [
      ['Calm the customer', 'Secure positive review', 'Avoid supervisor involvement'],
      ['Rally 5 couriers', 'Present demands', 'Achieve one concession'],
      ['Meet both parties', 'Find compromise', 'Document agreement'],
      ['Visit 3 affected clients', 'Deliver apology gifts', 'Restore reputation']
    ]
  },
  puzzle_solving: {
    titles: [
      'Route Optimization Challenge',
      'Package Sorting Mastery',
      'Delivery Logic Puzzle',
      'Algorithmic Efficiency'
    ],
    descriptions: [
      'Find the most efficient route through traffic chaos.',
      'Sort packages faster than the automated system.',
      'Solve the delivery paradox that stumped other couriers.',
      'Beat WHIX\'s algorithm at its own game.'
    ],
    clients: ['WHIX Algorithm', 'Sorting Facility Manager', 'Logistics AI', 'Efficiency Expert'],
    objectives: [
      ['Complete route under par', 'Use less than 50 energy', 'Beat AI prediction'],
      ['Sort 20 packages', 'Achieve 100% accuracy', 'Beat time limit'],
      ['Solve delivery sequence', 'Find optimal solution', 'Document method'],
      ['Complete 5 deliveries', 'Use custom route', 'Outperform algorithm by 20%']
    ]
  },
  combat_escort: {
    titles: [
      'VIP Protection Detail',
      'Hostile Territory Run',
      'Gang Gauntlet',
      'Security Escort'
    ],
    descriptions: [
      'Protect a VIP through dangerous neighborhoods.',
      'Escort valuable cargo through gang territory.',
      'Fight through hostile zones to ensure delivery.',
      'Provide security for high-risk transport.'
    ],
    clients: ['Corporate VIP', 'Black Market Dealer', 'Rival Gang', 'Security Firm'],
    objectives: [
      ['Escort VIP to destination', 'Defeat all attackers', 'Keep VIP health above 50%'],
      ['Deliver cargo', 'Survive 3 ambushes', 'Minimize damage'],
      ['Clear hostile zones', 'Defeat gang leaders', 'Complete delivery'],
      ['Provide overwatch', 'Eliminate threats', 'Ensure safe passage']
    ]
  },
  stealth_delivery: {
    titles: [
      'Shadow Courier',
      'Invisible Exchange',
      'Ghost Protocol',
      'Surveillance Evasion'
    ],
    descriptions: [
      'Deliver without being detected by anyone.',
      'Complete exchange under heavy surveillance.',
      'Become a ghost in the corporate machine.',
      'Evade WHIX tracking for entire route.'
    ],
    clients: ['Paranoid Client', 'Surveillance Target', 'Resistance Cell', 'Privacy Advocate'],
    objectives: [
      ['Remain undetected', 'Complete delivery', 'Leave no trace'],
      ['Avoid 5 cameras', 'Meet contact', 'Exchange package unseen'],
      ['Disable tracking', 'Complete route', 'Ghost status maintained'],
      ['Jam surveillance', 'Deliver package', 'Erase digital footprint']
    ]
  },
  multi_drop: {
    titles: [
      'Delivery Marathon',
      'Multi-Stop Madness',
      'Package Relay Race',
      'Distribution Network'
    ],
    descriptions: [
      'Handle multiple deliveries in one efficient run.',
      'Coordinate complex multi-stop delivery route.',
      'Race against time with sequential drops.',
      'Establish new distribution network.'
    ],
    clients: ['Distribution Center', 'Restaurant Chain', 'Retail Network', 'Franchise Owner'],
    objectives: [
      ['Complete 5 deliveries', 'Maintain schedule', 'All packages intact'],
      ['Visit 7 locations', 'Optimize route', 'Under time limit'],
      ['Sequential delivery', 'Beat par times', 'Perfect completion'],
      ['Establish 4 nodes', 'Test network', 'Report efficiency']
    ]
  },
  timed_rush: {
    titles: [
      'Midnight Rush',
      'Dawn Patrol',
      'Rush Hour Rally',
      'Time Trial Tuesday'
    ],
    descriptions: [
      'Beat the clock in this extreme time challenge.',
      'Early morning rush before the city wakes.',
      'Navigate rush hour chaos at maximum speed.',
      'Weekly time trial for elite couriers only.'
    ],
    clients: ['Time Trial Committee', 'Dawn Shift Manager', 'Rush Coordinator', 'Elite Timer'],
    objectives: [
      ['Beat gold time', 'No crashes', 'Maintain combo'],
      ['Complete before sunrise', 'Wake no one', 'Perfect stealth'],
      ['Navigate traffic', 'Beat clock', 'Avoid violations'],
      ['Set new record', 'Perfect run', 'Earn elite status']
    ]
  }
};

export class DailyContractsSystem {
  private static instance: DailyContractsSystem;
  
  private constructor() {}
  
  static getInstance(): DailyContractsSystem {
    if (!this.instance) {
      this.instance = new DailyContractsSystem();
    }
    return this.instance;
  }
  
  // Generate daily contracts for a specific date
  generateDailyContracts(date: Date, playerLevel: number): DailyContract[] {
    const contracts: DailyContract[] = [];
    const dateStr = date.toISOString().split('T')[0];
    
    // Use date as seed for consistent generation
    const seed = this.dateToSeed(dateStr);
    const rng = this.seededRandom(seed);
    
    // Generate 3-5 contracts per day
    const contractCount = 3 + Math.floor(rng() * 3);
    
    // Ensure variety in contract types
    const availableTypes = [...Object.values(ContractTypeSchema.enum)];
    
    for (let i = 0; i < contractCount; i++) {
      const typeIndex = Math.floor(rng() * availableTypes.length);
      const type = availableTypes.splice(typeIndex, 1)[0];
      
      const difficulty = this.selectDifficulty(playerLevel, rng);
      const contract = this.generateContract(dateStr, type, difficulty, i, rng);
      
      contracts.push(contract);
    }
    
    return contracts.sort((a, b) => {
      // Sort by difficulty for better UI presentation
      const diffOrder = { easy: 0, normal: 1, hard: 2, extreme: 3 };
      return diffOrder[a.difficulty] - diffOrder[b.difficulty];
    });
  }
  
  private generateContract(
    dateStr: string,
    type: ContractType,
    difficulty: ContractDifficulty,
    index: number,
    rng: () => number
  ): DailyContract {
    const template = CONTRACT_TEMPLATES[type];
    const titleIndex = Math.floor(rng() * template.titles.length);
    const descIndex = Math.floor(rng() * template.descriptions.length);
    const clientIndex = Math.floor(rng() * template.clients.length);
    const objectivesIndex = Math.floor(rng() * template.objectives.length);
    
    // Calculate rewards based on difficulty
    const baseRewards = {
      easy: { tips: 500, exp: 100 },
      normal: { tips: 1000, exp: 250 },
      hard: { tips: 2000, exp: 500 },
      extreme: { tips: 5000, exp: 1000 }
    };
    
    const rewards = baseRewards[difficulty];
    
    // Generate objectives
    const objectives = template.objectives[objectivesIndex].map((obj, i) => ({
      id: `obj-${i}`,
      description: obj,
      completed: false,
      progress: 0,
      target: obj.includes('5') ? 5 : obj.includes('3') ? 3 : 1
    }));
    
    // Time limits based on contract type and difficulty
    const timeLimits: Record<string, Record<ContractDifficulty, number>> & {
      default: Record<ContractDifficulty, number>
    } = {
      express_delivery: { easy: 30, normal: 20, hard: 15, extreme: 10 },
      timed_rush: { easy: 20, normal: 15, hard: 10, extreme: 5 },
      default: { easy: 60, normal: 45, hard: 30, extreme: 20 }
    };
    
    const timeLimit = (timeLimits[type] || timeLimits.default)[difficulty];
    
    // Contract expires at end of day
    const expiresAt = new Date(dateStr);
    expiresAt.setHours(23, 59, 59, 999);
    
    // Add bonus objective for harder difficulties
    const bonusObjective = difficulty === 'hard' || difficulty === 'extreme' ? {
      description: 'Complete without taking damage',
      reward: rewards.tips * 0.5
    } : undefined;
    
    return {
      id: `daily-${dateStr}-${index}`,
      date: dateStr,
      type,
      title: template.titles[titleIndex],
      description: template.descriptions[descIndex],
      clientName: template.clients[clientIndex],
      difficulty,
      requirements: this.generateRequirements(difficulty, type, rng),
      objectives,
      rewards: {
        tips: rewards.tips,
        experience: rewards.exp,
        bonusObjective
      },
      timeLimit,
      expiresAt: expiresAt.toISOString(),
      completed: false,
      claimed: false
    };
  }
  
  private generateRequirements(
    difficulty: ContractDifficulty,
    type: ContractType,
    rng: () => number
  ): z.infer<typeof ContractRequirementSchema> {
    const requirements: z.infer<typeof ContractRequirementSchema> = {};
    
    // Level requirements based on difficulty
    const levelReqs = {
      easy: 1,
      normal: 3,
      hard: 5,
      extreme: 8
    };
    
    requirements.minLevel = levelReqs[difficulty];
    
    // Some contracts require specific traits or classes
    if (rng() > 0.7) {
      if (type === 'puzzle_solving') {
        requirements.requiredTrait = rng() > 0.5 ? 'pattern_recognition' : 'systematic_thinking';
      } else if (type === 'social_negotiation') {
        requirements.requiredClass = 'negotiator';
      } else if (type === 'data_courier') {
        requirements.requiredTrait = 'enhanced_senses';
      }
    }
    
    // Harder contracts might require mission completion
    if (difficulty === 'extreme') {
      requirements.completedMissions = 10;
    } else if (difficulty === 'hard') {
      requirements.completedMissions = 5;
    }
    
    return requirements;
  }
  
  private selectDifficulty(playerLevel: number, rng: () => number): ContractDifficulty {
    // Weighted selection based on player level
    if (playerLevel < 3) {
      return rng() > 0.8 ? 'normal' : 'easy';
    } else if (playerLevel < 5) {
      const roll = rng();
      if (roll > 0.9) return 'hard';
      if (roll > 0.4) return 'normal';
      return 'easy';
    } else if (playerLevel < 8) {
      const roll = rng();
      if (roll > 0.8) return 'extreme';
      if (roll > 0.5) return 'hard';
      if (roll > 0.2) return 'normal';
      return 'easy';
    } else {
      const roll = rng();
      if (roll > 0.6) return 'extreme';
      if (roll > 0.3) return 'hard';
      return 'normal';
    }
  }
  
  // Convert date to seed for consistent generation
  private dateToSeed(dateStr: string): number {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  // Seeded random number generator
  private seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
  
  // Check if player meets contract requirements
  canAcceptContract(
    contract: DailyContract,
    playerLevel: number,
    playerTraits: string[],
    playerClass: string,
    completedMissions: number
  ): { canAccept: boolean; reason?: string } {
    const req = contract.requirements;
    
    if (req.minLevel && playerLevel < req.minLevel) {
      return { canAccept: false, reason: `Requires level ${req.minLevel}` };
    }
    
    if (req.requiredTrait && !playerTraits.includes(req.requiredTrait)) {
      return { canAccept: false, reason: `Requires ${req.requiredTrait} trait` };
    }
    
    if (req.requiredClass && playerClass !== req.requiredClass) {
      return { canAccept: false, reason: `Requires ${req.requiredClass} class` };
    }
    
    if (req.completedMissions && completedMissions < req.completedMissions) {
      return { canAccept: false, reason: `Complete ${req.completedMissions} missions first` };
    }
    
    return { canAccept: true };
  }
}

// Export singleton instance
export const dailyContractsSystem = DailyContractsSystem.getInstance();