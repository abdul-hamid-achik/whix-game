import { z } from 'zod';
import { Partner } from '@/lib/game/classes';

// Campaign types available in the game
export const CampaignType = z.enum([
  'story',           // Main story campaign with chapters
  'endless',         // Endless mode with increasing difficulty
  'challenge',       // Daily/weekly challenge campaigns
  'seasonal',        // Time-limited seasonal campaigns
  'training',        // Tutorial and practice campaigns
  'community',       // User-generated campaigns
]);

export type CampaignType = z.infer<typeof CampaignType>;

// Campaign difficulty settings
export const CampaignDifficulty = z.enum([
  'casual',          // For story-focused players
  'normal',          // Balanced challenge
  'hard',            // For experienced players
  'extreme',         // Maximum challenge
  'custom',          // Player-defined difficulty
]);

export type CampaignDifficulty = z.infer<typeof CampaignDifficulty>;

// Campaign state tracking
export const CampaignState = z.enum([
  'locked',          // Not yet available
  'available',       // Can be started
  'active',          // Currently playing
  'completed',       // Finished successfully
  'failed',          // Failed and can be retried
]);

export type CampaignState = z.infer<typeof CampaignState>;

// Campaign modifiers that affect gameplay
export const CampaignModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  effects: z.object({
    enemyHealthMultiplier: z.number().default(1),
    enemyDamageMultiplier: z.number().default(1),
    playerHealthMultiplier: z.number().default(1),
    playerDamageMultiplier: z.number().default(1),
    tipMultiplier: z.number().default(1),
    experienceMultiplier: z.number().default(1),
    energyCostMultiplier: z.number().default(1),
    injuryChanceMultiplier: z.number().default(1),
  }),
});

export type CampaignModifier = z.infer<typeof CampaignModifierSchema>;

// Campaign definition
export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: CampaignType,
  difficulty: CampaignDifficulty,
  state: CampaignState,
  icon: z.string().optional(),
  bannerImage: z.string().optional(),
  
  // Campaign structure
  totalMissions: z.number(),
  completedMissions: z.number().default(0),
  chapters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    missionIds: z.array(z.string()),
    requiredCompletions: z.number(), // How many missions must be completed to unlock next chapter
    rewards: z.object({
      tips: z.number().optional(),
      experience: z.number().optional(),
      items: z.array(z.string()).optional(),
      partners: z.array(z.string()).optional(),
    }).optional(),
  })).optional(),
  
  // Requirements and restrictions
  requirements: z.object({
    minLevel: z.number().optional(),
    completedCampaigns: z.array(z.string()).optional(),
    ownedPartners: z.array(z.string()).optional(),
    humanityIndex: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  }).optional(),
  
  // Campaign-specific rules
  modifiers: z.array(CampaignModifierSchema).optional(),
  partnerRestrictions: z.object({
    maxSquadSize: z.number().optional(),
    requiredClasses: z.array(z.string()).optional(),
    bannedClasses: z.array(z.string()).optional(),
    requiredTraits: z.array(z.string()).optional(),
    bannedTraits: z.array(z.string()).optional(),
  }).optional(),
  
  // Rewards for completion
  completionRewards: z.object({
    tips: z.number().optional(),
    experience: z.number().optional(),
    items: z.array(z.string()).optional(),
    partners: z.array(z.string()).optional(),
    titles: z.array(z.string()).optional(),
    unlockCampaigns: z.array(z.string()).optional(),
  }).optional(),
  
  // Tracking
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  bestScore: z.number().optional(),
  attempts: z.number().default(0),
  
  // Special features
  features: z.object({
    permadeath: z.boolean().default(false),
    ironman: z.boolean().default(false), // No save scumming
    timedMissions: z.boolean().default(false),
    limitedResources: z.boolean().default(false),
    randomizedEvents: z.boolean().default(false),
  }).optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// Campaign progress tracking
export const CampaignProgressSchema = z.object({
  campaignId: z.string(),
  currentChapter: z.string().optional(),
  currentMission: z.string().optional(),
  decisionsHistory: z.array(z.object({
    missionId: z.string(),
    decisionId: z.string(),
    outcome: z.string(),
    timestamp: z.string(),
  })).optional(),
  partnersUsed: z.array(z.string()),
  totalDamageDealt: z.number().default(0),
  totalDamageTaken: z.number().default(0),
  totalTipsEarned: z.number().default(0),
  totalMissionsCompleted: z.number().default(0),
  totalMissionsFailed: z.number().default(0),
});

export type CampaignProgress = z.infer<typeof CampaignProgressSchema>;

// Predefined campaign templates
export const CAMPAIGN_TEMPLATES: Record<string, Partial<Campaign>> = {
  // Main story campaign
  mainStory: {
    id: 'main-story',
    name: 'WHIX: Rise of the Gig Workers',
    description: 'Follow the journey of neurodivergent delivery partners as they navigate the dystopian gig economy of Neo-Tokyo',
    type: 'story',
    difficulty: 'normal',
    totalMissions: 30,
    chapters: [
      {
        id: 'chapter-1',
        name: 'Welcome to WHIX',
        description: 'Your first days as a WHIX manager',
        missionIds: ['intro-1', 'intro-2', 'intro-3', 'intro-4', 'intro-5'],
        requiredCompletions: 3,
        rewards: {
          tips: 1000,
          partners: ['starter-courier'],
        },
      },
      {
        id: 'chapter-2',
        name: 'Corporate Pressure',
        description: 'The true nature of WHIX begins to reveal itself',
        missionIds: ['corp-1', 'corp-2', 'corp-3', 'corp-4', 'corp-5'],
        requiredCompletions: 4,
        rewards: {
          tips: 2500,
          experience: 500,
        },
      },
    ],
  },
  
  // Endless survival mode
  endlessDelivery: {
    id: 'endless-delivery',
    name: 'Delivery Marathon',
    description: 'How long can you keep your partners delivering in the unforgiving streets?',
    type: 'endless',
    difficulty: 'normal',
    totalMissions: Infinity,
    modifiers: [
      {
        id: 'escalating-difficulty',
        name: 'Escalating Pressure',
        description: 'Each successful delivery makes the next one harder',
        effects: {
          enemyHealthMultiplier: 1.05,
          enemyDamageMultiplier: 1.02,
          tipMultiplier: 1.1,
        },
      },
    ],
    features: {
      permadeath: true,
      limitedResources: true,
      randomizedEvents: true,
    },
  },
  
  // Weekly challenge
  weeklyChallenge: {
    id: 'weekly-challenge-template',
    name: 'Weekly Challenge',
    description: 'A unique challenge that changes every week',
    type: 'challenge',
    difficulty: 'hard',
    totalMissions: 7,
    modifiers: [], // Filled dynamically
    partnerRestrictions: {
      maxSquadSize: 3,
    },
    completionRewards: {
      tips: 5000,
      experience: 1000,
    },
  },
  
  // Training campaign
  partnerTraining: {
    id: 'partner-training',
    name: 'WHIX Academy',
    description: 'Learn the basics of managing neurodivergent delivery partners',
    type: 'training',
    difficulty: 'casual',
    totalMissions: 10,
    features: {
      permadeath: false,
      ironman: false,
    },
    modifiers: [
      {
        id: 'training-wheels',
        name: 'Training Mode',
        description: 'Reduced penalties and increased rewards for learning',
        effects: {
          enemyHealthMultiplier: 0.7,
          enemyDamageMultiplier: 0.5,
          tipMultiplier: 2,
          injuryChanceMultiplier: 0.1,
        },
      },
    ],
  },
};

// Campaign manager class
export class CampaignManager {
  private campaigns: Map<string, Campaign> = new Map();
  private progress: Map<string, CampaignProgress> = new Map();
  
  constructor() {
    this.initializeDefaultCampaigns();
  }
  
  private initializeDefaultCampaigns() {
    // Initialize main story campaign
    const mainStory: Campaign = {
      ...CAMPAIGN_TEMPLATES.mainStory,
      state: 'available',
      completedMissions: 0,
      attempts: 0,
    } as Campaign;
    
    this.campaigns.set(mainStory.id, mainStory);
    
    // Initialize training campaign
    const training: Campaign = {
      ...CAMPAIGN_TEMPLATES.partnerTraining,
      state: 'available',
      completedMissions: 0,
      attempts: 0,
    } as Campaign;
    
    this.campaigns.set(training.id, training);
  }
  
  // Get all campaigns
  getAllCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }
  
  // Get campaigns by type
  getCampaignsByType(type: CampaignType): Campaign[] {
    return this.getAllCampaigns().filter(c => c.type === type);
  }
  
  // Get available campaigns for a player
  getAvailableCampaigns(playerLevel: number, completedCampaigns: string[]): Campaign[] {
    return this.getAllCampaigns().filter(campaign => {
      if (campaign.state === 'locked') {
        // Check requirements
        if (campaign.requirements) {
          if (campaign.requirements.minLevel && playerLevel < campaign.requirements.minLevel) {
            return false;
          }
          
          if (campaign.requirements.completedCampaigns) {
            const hasCompleted = campaign.requirements.completedCampaigns.every(
              id => completedCampaigns.includes(id)
            );
            if (!hasCompleted) return false;
          }
        }
      }
      
      return campaign.state === 'available' || campaign.state === 'active';
    });
  }
  
  // Start a campaign
  startCampaign(campaignId: string, selectedPartners: Partner[]): CampaignProgress | null {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.state === 'locked') return null;
    
    // Validate partner restrictions
    if (campaign.partnerRestrictions) {
      const restrictions = campaign.partnerRestrictions;
      
      if (restrictions.maxSquadSize && selectedPartners.length > restrictions.maxSquadSize) {
        throw new Error(`Squad size exceeds maximum of ${restrictions.maxSquadSize}`);
      }
      
      if (restrictions.requiredClasses) {
        const hasRequired = restrictions.requiredClasses.every(
          cls => selectedPartners.some(p => p.class === cls)
        );
        if (!hasRequired) {
          throw new Error('Missing required partner classes');
        }
      }
      
      if (restrictions.bannedClasses) {
        const hasBanned = selectedPartners.some(
          p => restrictions.bannedClasses!.includes(p.class)
        );
        if (hasBanned) {
          throw new Error('Squad contains banned partner classes');
        }
      }
    }
    
    // Create progress tracking
    const progress: CampaignProgress = {
      campaignId,
      currentChapter: campaign.chapters?.[0]?.id,
      currentMission: campaign.chapters?.[0]?.missionIds[0],
      partnersUsed: selectedPartners.map(p => p.id),
      decisionsHistory: [],
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalTipsEarned: 0,
      totalMissionsCompleted: 0,
      totalMissionsFailed: 0,
    };
    
    // Update campaign state
    campaign.state = 'active';
    campaign.startedAt = new Date().toISOString();
    campaign.attempts += 1;
    
    this.progress.set(campaignId, progress);
    return progress;
  }
  
  // Update campaign progress
  updateProgress(
    campaignId: string, 
    missionCompleted: boolean,
    stats: {
      damageDealt?: number;
      damageTaken?: number;
      tipsEarned?: number;
    }
  ): void {
    const campaign = this.campaigns.get(campaignId);
    const progress = this.progress.get(campaignId);
    
    if (!campaign || !progress) return;
    
    // Update stats
    if (stats.damageDealt) progress.totalDamageDealt += stats.damageDealt;
    if (stats.damageTaken) progress.totalDamageTaken += stats.damageTaken;
    if (stats.tipsEarned) progress.totalTipsEarned += stats.tipsEarned;
    
    if (missionCompleted) {
      progress.totalMissionsCompleted += 1;
      campaign.completedMissions += 1;
      
      // Check for chapter completion
      if (campaign.chapters && progress.currentChapter) {
        const currentChapter = campaign.chapters.find(c => c.id === progress.currentChapter);
        if (currentChapter) {
          const chapterProgress = currentChapter.missionIds.filter(
            id => progress.decisionsHistory?.some(d => d.missionId === id)
          ).length;
          
          if (chapterProgress >= currentChapter.requiredCompletions) {
            // Move to next chapter
            const currentIndex = campaign.chapters.indexOf(currentChapter);
            if (currentIndex < campaign.chapters.length - 1) {
              progress.currentChapter = campaign.chapters[currentIndex + 1].id;
              progress.currentMission = campaign.chapters[currentIndex + 1].missionIds[0];
            }
          }
        }
      }
      
      // Check for campaign completion
      if (campaign.type !== 'endless' && campaign.completedMissions >= campaign.totalMissions) {
        this.completeCampaign(campaignId);
      }
    } else {
      progress.totalMissionsFailed += 1;
      
      // Check for campaign failure conditions
      if (campaign.features?.ironman) {
        campaign.state = 'failed';
      }
    }
  }
  
  // Complete a campaign
  private completeCampaign(campaignId: string): void {
    const campaign = this.campaigns.get(campaignId);
    const progress = this.progress.get(campaignId);
    
    if (!campaign || !progress) return;
    
    campaign.state = 'completed';
    campaign.completedAt = new Date().toISOString();
    
    // Calculate score for leaderboards
    const score = this.calculateCampaignScore(campaign, progress);
    if (!campaign.bestScore || score > campaign.bestScore) {
      campaign.bestScore = score;
    }
  }
  
  // Calculate campaign score
  private calculateCampaignScore(campaign: Campaign, progress: CampaignProgress): number {
    let score = 0;
    
    // Base score from missions completed
    score += progress.totalMissionsCompleted * 100;
    
    // Bonus for perfect run
    if (progress.totalMissionsFailed === 0) {
      score *= 1.5;
    }
    
    // Difficulty multiplier
    const difficultyMultipliers = {
      casual: 0.5,
      normal: 1,
      hard: 1.5,
      extreme: 2,
      custom: 1,
    };
    score *= difficultyMultipliers[campaign.difficulty];
    
    // Efficiency bonus (less damage taken)
    const damageRatio = progress.totalDamageTaken / (progress.totalDamageDealt || 1);
    if (damageRatio < 0.5) score *= 1.2;
    
    // Tips earned bonus
    score += progress.totalTipsEarned * 0.1;
    
    return Math.round(score);
  }
  
  // Generate a weekly challenge
  generateWeeklyChallenge(weekNumber: number): Campaign {
    const seed = weekNumber; // Use week number as seed for consistency
    const random = this.seededRandom(seed);
    
    // Random modifiers
    const possibleModifiers: CampaignModifier[] = [
      {
        id: 'double-damage',
        name: 'Glass Cannon',
        description: 'Deal and take double damage',
        effects: {
          enemyHealthMultiplier: 1,
          enemyDamageMultiplier: 2,
          playerHealthMultiplier: 1,
          playerDamageMultiplier: 2,
          tipMultiplier: 1.5,
          experienceMultiplier: 1.5,
          energyCostMultiplier: 1,
          injuryChanceMultiplier: 2,
        },
      },
      {
        id: 'exhaustion',
        name: 'Exhaustion',
        description: 'Partners use double energy',
        effects: {
          enemyHealthMultiplier: 1,
          enemyDamageMultiplier: 1,
          playerHealthMultiplier: 1,
          playerDamageMultiplier: 1,
          tipMultiplier: 1.3,
          experienceMultiplier: 1,
          energyCostMultiplier: 2,
          injuryChanceMultiplier: 1,
        },
      },
      {
        id: 'elite-enemies',
        name: 'Elite Opposition',
        description: 'All enemies are elite versions',
        effects: {
          enemyHealthMultiplier: 1.5,
          enemyDamageMultiplier: 1.3,
          playerHealthMultiplier: 1,
          playerDamageMultiplier: 1,
          tipMultiplier: 2,
          experienceMultiplier: 2,
          energyCostMultiplier: 1,
          injuryChanceMultiplier: 1.5,
        },
      },
    ];
    
    // Select 1-3 random modifiers
    const modifierCount = Math.floor(random() * 3) + 1;
    const selectedModifiers: CampaignModifier[] = [];
    
    for (let i = 0; i < modifierCount; i++) {
      const index = Math.floor(random() * possibleModifiers.length);
      selectedModifiers.push(possibleModifiers[index]);
      possibleModifiers.splice(index, 1);
    }
    
    // Generate challenge campaign
    const challenge: Campaign = {
      ...CAMPAIGN_TEMPLATES.weeklyChallenge,
      id: `weekly-challenge-${weekNumber}`,
      name: `Week ${weekNumber} Challenge`,
      description: `This week's challenge: ${selectedModifiers.map(m => m.name).join(', ')}`,
      state: 'available',
      modifiers: selectedModifiers,
      completedMissions: 0,
      attempts: 0,
    } as Campaign;
    
    return challenge;
  }
  
  // Seeded random for consistent weekly challenges
  private seededRandom(seed: number): () => number {
    return () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
  }
}

// Export singleton instance
export const campaignManager = new CampaignManager();