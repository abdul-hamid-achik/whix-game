import { z } from 'zod';

// Performance metric types
export const MetricTypeSchema = z.enum([
  'mission_time',
  'damage_dealt',
  'damage_taken',
  'healing_done',
  'tips_earned',
  'accuracy',
  'combo_count',
  'perfect_missions',
  'speed_runs',
  'efficiency_score',
]);

export type MetricType = z.infer<typeof MetricTypeSchema>;

// Performance record schema
export const PerformanceRecordSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  timestamp: z.date(),
  missionId: z.string(),
  missionType: z.enum(['story', 'daily', 'weekly', 'arena']),
  metrics: z.object({
    completionTime: z.number(), // in seconds
    damageDealt: z.number(),
    damageTaken: z.number(),
    healingDone: z.number(),
    tipsEarned: z.number(),
    accuracy: z.number(), // percentage
    comboCount: z.number(),
    perfectClear: z.boolean(),
    partnersUsed: z.array(z.string()), // partner IDs
    difficultyModifier: z.number(), // 1.0 for normal, higher for harder
  }),
  score: z.number(), // calculated overall score
});

export type PerformanceRecord = z.infer<typeof PerformanceRecordSchema>;

// Leaderboard entry schema
export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  playerId: z.string(),
  playerName: z.string(),
  score: z.number(),
  metrics: z.record(MetricTypeSchema, z.number()),
  timestamp: z.date(),
  partners: z.array(z.object({
    id: z.string(),
    name: z.string(),
    level: z.number(),
    class: z.string(),
  })),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// Leaderboard type schema
export const LeaderboardTypeSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'all_time',
  'mission_specific',
  'arena',
  'speed_run',
  'efficiency',
]);

export type LeaderboardType = z.infer<typeof LeaderboardTypeSchema>;

// Achievement schema
export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(['combat', 'exploration', 'collection', 'mastery', 'special']),
  requirement: z.object({
    type: MetricTypeSchema,
    threshold: z.number(),
    condition: z.enum(['greater_than', 'less_than', 'equal_to']),
  }),
  reward: z.object({
    tips: z.number().optional(),
    items: z.array(z.string()).optional(),
    title: z.string().optional(),
    cosmetic: z.string().optional(),
  }),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  progress: z.number().default(0),
  unlocked: z.boolean().default(false),
  unlockedAt: z.date().optional(),
});

export type Achievement = z.infer<typeof AchievementSchema>;

// Statistics summary schema
export const StatisticsSummarySchema = z.object({
  totalMissions: z.number(),
  successfulMissions: z.number(),
  failedMissions: z.number(),
  totalPlayTime: z.number(), // in seconds
  averageMissionTime: z.number(),
  totalTipsEarned: z.number(),
  totalDamageDealt: z.number(),
  totalDamageTaken: z.number(),
  favoritePartner: z.string().optional(),
  bestCombo: z.number(),
  perfectMissions: z.number(),
  achievements: z.object({
    total: z.number(),
    unlocked: z.number(),
    points: z.number(),
  }),
});

export type StatisticsSummary = z.infer<typeof StatisticsSummarySchema>;

// Performance tracking system
export class PerformanceTrackingSystem {
  private static instance: PerformanceTrackingSystem;
  private records: Map<string, PerformanceRecord[]> = new Map();
  private achievements: Achievement[] = [];
  private leaderboards: Map<LeaderboardType, LeaderboardEntry[]> = new Map();

  private constructor() {
    this.initializeAchievements();
  }

  static getInstance(): PerformanceTrackingSystem {
    if (!this.instance) {
      this.instance = new PerformanceTrackingSystem();
    }
    return this.instance;
  }

  // Initialize achievements
  private initializeAchievements() {
    this.achievements = [
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a mission in under 2 minutes',
        icon: '⚡',
        category: 'mastery',
        requirement: {
          type: 'mission_time',
          threshold: 120,
          condition: 'less_than',
        },
        reward: {
          tips: 500,
          title: 'Speed Demon',
        },
        rarity: 'rare',
        progress: 0,
        unlocked: false,
      },
      {
        id: 'untouchable',
        name: 'Untouchable',
        description: 'Complete a combat mission without taking damage',
        icon: '🛡️',
        category: 'combat',
        requirement: {
          type: 'damage_taken',
          threshold: 0,
          condition: 'equal_to',
        },
        reward: {
          tips: 1000,
          title: 'Untouchable',
        },
        rarity: 'epic',
        progress: 0,
        unlocked: false,
      },
      {
        id: 'tip_tycoon',
        name: 'Tip Tycoon',
        description: 'Earn 10,000 tips total',
        icon: '💰',
        category: 'collection',
        requirement: {
          type: 'tips_earned',
          threshold: 10000,
          condition: 'greater_than',
        },
        reward: {
          items: ['golden_badge'],
          title: 'Tycoon',
        },
        rarity: 'uncommon',
        progress: 0,
        unlocked: false,
      },
      {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Achieve a 50+ combo in combat',
        icon: '🔥',
        category: 'combat',
        requirement: {
          type: 'combo_count',
          threshold: 50,
          condition: 'greater_than',
        },
        reward: {
          tips: 750,
          cosmetic: 'flame_trail',
        },
        rarity: 'rare',
        progress: 0,
        unlocked: false,
      },
      {
        id: 'perfect_courier',
        name: 'Perfect Courier',
        description: 'Complete 10 missions with perfect rating',
        icon: '⭐',
        category: 'mastery',
        requirement: {
          type: 'perfect_missions',
          threshold: 10,
          condition: 'greater_than',
        },
        reward: {
          tips: 2000,
          title: 'Perfectionist',
          cosmetic: 'golden_emblem',
        },
        rarity: 'legendary',
        progress: 0,
        unlocked: false,
      },
    ];
  }

  // Record performance for a mission
  recordPerformance(record: Omit<PerformanceRecord, 'id' | 'score'>): PerformanceRecord {
    const score = this.calculateScore(record.metrics, record.missionType);
    const fullRecord: PerformanceRecord = {
      ...record,
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      score,
    };

    // Store record
    const playerRecords = this.records.get(record.playerId) || [];
    playerRecords.push(fullRecord);
    this.records.set(record.playerId, playerRecords);

    // Update achievements
    this.updateAchievements(fullRecord);

    // Update leaderboards
    this.updateLeaderboards(fullRecord);

    return fullRecord;
  }

  // Calculate performance score
  private calculateScore(
    metrics: PerformanceRecord['metrics'],
    missionType: PerformanceRecord['missionType']
  ): number {
    let score = 0;

    // Base score from tips earned
    score += metrics.tipsEarned * 1;

    // Time bonus (faster = higher score)
    const timeBonus = Math.max(0, 300 - metrics.completionTime) * 10;
    score += timeBonus;

    // Combat performance
    const combatScore = (metrics.damageDealt * 2) - (metrics.damageTaken * 1);
    score += Math.max(0, combatScore);

    // Accuracy bonus
    score += metrics.accuracy * 10;

    // Combo bonus
    score += metrics.comboCount * 5;

    // Perfect clear bonus
    if (metrics.perfectClear) {
      score *= 1.5;
    }

    // Difficulty modifier
    score *= metrics.difficultyModifier;

    // Mission type modifier
    const typeModifiers = {
      story: 1.0,
      daily: 1.1,
      weekly: 1.3,
      arena: 1.5,
    };
    score *= typeModifiers[missionType];

    return Math.round(score);
  }

  // Update achievement progress
  private updateAchievements(record: PerformanceRecord) {
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let value = 0;
      switch (achievement.requirement.type) {
        case 'mission_time':
          value = record.metrics.completionTime;
          break;
        case 'damage_taken':
          value = record.metrics.damageTaken;
          break;
        case 'tips_earned':
          value = this.getTotalTipsEarned(record.playerId);
          break;
        case 'combo_count':
          value = record.metrics.comboCount;
          break;
        case 'perfect_missions':
          value = this.getPerfectMissionCount(record.playerId);
          break;
        default:
          value = record.metrics[achievement.requirement.type as keyof typeof record.metrics] as number || 0;
      }

      // Check if requirement is met
      let requirementMet = false;
      switch (achievement.requirement.condition) {
        case 'greater_than':
          requirementMet = value > achievement.requirement.threshold;
          break;
        case 'less_than':
          requirementMet = value < achievement.requirement.threshold;
          break;
        case 'equal_to':
          requirementMet = value === achievement.requirement.threshold;
          break;
      }

      if (requirementMet && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        achievement.progress = 100;
      } else {
        // Update progress
        if (achievement.requirement.condition === 'greater_than') {
          achievement.progress = Math.min(100, (value / achievement.requirement.threshold) * 100);
        }
      }
    });
  }

  // Update leaderboards
  private updateLeaderboards(record: PerformanceRecord) {
    // Update daily leaderboard
    this.updateLeaderboard('daily', record);
    
    // Update weekly leaderboard
    this.updateLeaderboard('weekly', record);
    
    // Update monthly leaderboard
    this.updateLeaderboard('monthly', record);
    
    // Update all-time leaderboard
    this.updateLeaderboard('all_time', record);
    
    // Update mission-specific leaderboard
    if (record.missionType === 'story') {
      this.updateLeaderboard('mission_specific', record);
    }
    
    // Update arena leaderboard
    if (record.missionType === 'arena') {
      this.updateLeaderboard('arena', record);
    }
  }

  // Update specific leaderboard
  private updateLeaderboard(type: LeaderboardType, record: PerformanceRecord) {
    const leaderboard = this.leaderboards.get(type) || [];
    
    // Check if player already has an entry
    const existingIndex = leaderboard.findIndex(entry => entry.playerId === record.playerId);
    
    const newEntry: LeaderboardEntry = {
      rank: 0, // Will be updated after sorting
      playerId: record.playerId,
      playerName: `Player_${record.playerId.substr(0, 8)}`, // In real app, get from player data
      score: record.score,
      metrics: {
        mission_time: record.metrics.completionTime,
        damage_dealt: record.metrics.damageDealt,
        damage_taken: record.metrics.damageTaken,
        healing_done: record.metrics.healingDone,
        tips_earned: record.metrics.tipsEarned,
        accuracy: record.metrics.accuracy,
        combo_count: record.metrics.comboCount,
        perfect_missions: record.metrics.perfectClear ? 1 : 0,
        speed_runs: record.metrics.completionTime < 120 ? 1 : 0,
        efficiency_score: record.score,
      },
      timestamp: record.timestamp,
      partners: [], // In real app, get partner details
    };

    if (existingIndex >= 0) {
      // Update if new score is higher
      if (newEntry.score > leaderboard[existingIndex].score) {
        leaderboard[existingIndex] = newEntry;
      }
    } else {
      leaderboard.push(newEntry);
    }

    // Sort by score and update ranks
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep only top 100
    this.leaderboards.set(type, leaderboard.slice(0, 100));
  }

  // Get player statistics
  getPlayerStatistics(playerId: string): StatisticsSummary {
    const records = this.records.get(playerId) || [];
    
    const summary: StatisticsSummary = {
      totalMissions: records.length,
      successfulMissions: records.filter(r => r.score > 0).length,
      failedMissions: records.filter(r => r.score === 0).length,
      totalPlayTime: records.reduce((sum, r) => sum + r.metrics.completionTime, 0),
      averageMissionTime: records.length > 0 
        ? records.reduce((sum, r) => sum + r.metrics.completionTime, 0) / records.length 
        : 0,
      totalTipsEarned: this.getTotalTipsEarned(playerId),
      totalDamageDealt: records.reduce((sum, r) => sum + r.metrics.damageDealt, 0),
      totalDamageTaken: records.reduce((sum, r) => sum + r.metrics.damageTaken, 0),
      bestCombo: Math.max(...records.map(r => r.metrics.comboCount), 0),
      perfectMissions: this.getPerfectMissionCount(playerId),
      achievements: {
        total: this.achievements.length,
        unlocked: this.achievements.filter(a => a.unlocked).length,
        points: this.achievements
          .filter(a => a.unlocked)
          .reduce((sum, a) => sum + (a.rarity === 'legendary' ? 100 : 
                                      a.rarity === 'epic' ? 50 : 
                                      a.rarity === 'rare' ? 25 : 
                                      a.rarity === 'uncommon' ? 10 : 5), 0),
      },
    };

    // Find favorite partner
    const partnerUsage = new Map<string, number>();
    records.forEach(r => {
      r.metrics.partnersUsed.forEach(partnerId => {
        partnerUsage.set(partnerId, (partnerUsage.get(partnerId) || 0) + 1);
      });
    });
    
    let maxUsage = 0;
    partnerUsage.forEach((usage, partnerId) => {
      if (usage > maxUsage) {
        maxUsage = usage;
        summary.favoritePartner = partnerId;
      }
    });

    return summary;
  }

  // Helper methods
  private getTotalTipsEarned(playerId: string): number {
    const records = this.records.get(playerId) || [];
    return records.reduce((sum, r) => sum + r.metrics.tipsEarned, 0);
  }

  private getPerfectMissionCount(playerId: string): number {
    const records = this.records.get(playerId) || [];
    return records.filter(r => r.metrics.perfectClear).length;
  }

  // Get leaderboard
  getLeaderboard(type: LeaderboardType, limit = 10): LeaderboardEntry[] {
    const leaderboard = this.leaderboards.get(type) || [];
    return leaderboard.slice(0, limit);
  }

  // Get player rank
  getPlayerRank(playerId: string, type: LeaderboardType): number | null {
    const leaderboard = this.leaderboards.get(type) || [];
    const entry = leaderboard.find(e => e.playerId === playerId);
    return entry ? entry.rank : null;
  }

  // Get achievements
  getAchievements(_playerId?: string): Achievement[] {
    // Return achievements with progress for specific player
    return this.achievements.map(a => ({ ...a }));
  }

  // Get unlocked achievements
  getUnlockedAchievements(_playerId: string): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }
}

// Export singleton instance
export const performanceTracker = PerformanceTrackingSystem.getInstance();