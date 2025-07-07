import { z } from 'zod';
import { StoredPartner } from '@/lib/schemas/game-schemas';
import { PARTNER_CLASSES, PartnerClass, Rarity } from '@/lib/game/classes';
import { NEURODIVERGENT_TRAITS, NeurodivergentTrait } from '@/lib/game/traits';

// Arena mode types
export const ArenaModeSchema = z.enum([
  'training',      // Practice against AI
  'challenge',     // Preset challenges
  'survival',      // Endless waves
  'pvp',          // Player vs Player simulation
]);

export type ArenaMode = z.infer<typeof ArenaModeSchema>;

// Arena difficulty schema
export const ArenaDifficultySchema = z.enum([
  'rookie',
  'veteran',
  'elite',
  'legendary',
]);

export type ArenaDifficulty = z.infer<typeof ArenaDifficultySchema>;

// Arena opponent schema
export const ArenaOpponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.array(z.any()), // StoredPartner[]
  difficulty: ArenaDifficultySchema,
  strategy: z.enum(['aggressive', 'defensive', 'balanced', 'adaptive']),
  rewards: z.object({
    tips: z.number(),
    experience: z.number(),
    items: z.array(z.string()).optional(),
  }),
});

export type ArenaOpponent = z.infer<typeof ArenaOpponentSchema>;

// Arena match result schema
export const ArenaMatchResultSchema = z.object({
  winner: z.enum(['player', 'opponent']),
  rounds: z.number(),
  playerScore: z.number(),
  opponentScore: z.number(),
  mvp: z.string().optional(), // Partner ID
  rewards: z.object({
    tips: z.number(),
    experience: z.number(),
    items: z.array(z.string()).optional(),
    rating: z.number().optional(),
  }),
  highlights: z.array(z.object({
    round: z.number(),
    event: z.string(),
    partnerId: z.string(),
  })),
});

export type ArenaMatchResult = z.infer<typeof ArenaMatchResultSchema>;

// Arena season schema
export const ArenaSeasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  rewards: z.array(z.object({
    rank: z.number(),
    tips: z.number(),
    items: z.array(z.string()),
    exclusive: z.boolean(),
  })),
});

export type ArenaSeason = z.infer<typeof ArenaSeasonSchema>;

// Arena rating schema
export const ArenaRatingSchema = z.object({
  rating: z.number(),
  wins: z.number(),
  losses: z.number(),
  winStreak: z.number(),
  bestStreak: z.number(),
  rank: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']),
  seasonId: z.string(),
});

export type ArenaRating = z.infer<typeof ArenaRatingSchema>;

// Arena system class
export class ArenaSystem {
  private static instance: ArenaSystem;

  private constructor() {}

  static getInstance(): ArenaSystem {
    if (!this.instance) {
      this.instance = new ArenaSystem();
    }
    return this.instance;
  }

  // Generate AI opponents based on difficulty
  generateOpponent(difficulty: ArenaDifficulty, _mode: ArenaMode): ArenaOpponent {
    const difficultyConfigs = {
      rookie: { 
        levelRange: [1, 15], 
        teamSize: 2, 
        rarityWeights: { common: 0.8, uncommon: 0.2, rare: 0, epic: 0, legendary: 0 },
        statMultiplier: 0.8,
        rewardMultiplier: 1,
      },
      veteran: { 
        levelRange: [10, 25], 
        teamSize: 3, 
        rarityWeights: { common: 0.5, uncommon: 0.3, rare: 0.2, epic: 0, legendary: 0 },
        statMultiplier: 1,
        rewardMultiplier: 1.5,
      },
      elite: { 
        levelRange: [20, 35], 
        teamSize: 3, 
        rarityWeights: { common: 0.2, uncommon: 0.3, rare: 0.3, epic: 0.2, legendary: 0 },
        statMultiplier: 1.2,
        rewardMultiplier: 2,
      },
      legendary: { 
        levelRange: [30, 50], 
        teamSize: 3, 
        rarityWeights: { common: 0, uncommon: 0.2, rare: 0.3, epic: 0.3, legendary: 0.2 },
        statMultiplier: 1.5,
        rewardMultiplier: 3,
      },
    };

    const config = difficultyConfigs[difficulty];
    const team: StoredPartner[] = [];

    // Generate team members
    for (let i = 0; i < config.teamSize; i++) {
      const level = Math.floor(
        Math.random() * (config.levelRange[1] - config.levelRange[0] + 1) + config.levelRange[0]
      );
      
      const rarity = this.selectRarity(config.rarityWeights);
      const partnerClass = this.selectRandomClass();
      const traits = this.selectRandomTraits();

      const partner: StoredPartner = {
        id: `arena_${difficulty}_${i}`,
        name: this.generateArenaPartnerName(partnerClass, rarity),
        class: partnerClass,
        primaryTrait: traits.primary,
        secondaryTrait: traits.secondary,
        level,
        rarity,
        stats: this.generateStats(level, rarity, partnerClass, config.statMultiplier),
        experience: 0,
        currentEnergy: 100,
        maxEnergy: 100,
        bondLevel: 0,
        isInjured: false,
        traitMastery: {},
        equipment: {},
        missions: 0,
        personality: {
          traits: ['competitive', 'focused', 'determined'],
          likes: ['combat', 'training', 'victory'],
          dislikes: ['defeat', 'weakness', 'hesitation'],
          backstory: 'Arena challenger with a hunger for victory',
        },
      };

      team.push(partner);
    }

    const strategies = ['aggressive', 'defensive', 'balanced', 'adaptive'] as const;
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];

    const baseReward = {
      rookie: { tips: 100, exp: 50 },
      veteran: { tips: 200, exp: 100 },
      elite: { tips: 400, exp: 200 },
      legendary: { tips: 800, exp: 400 },
    };

    const rewards = baseReward[difficulty];

    return {
      id: `opponent_${Date.now()}`,
      name: this.generateOpponentName(difficulty),
      team,
      difficulty,
      strategy,
      rewards: {
        tips: Math.floor(rewards.tips * config.rewardMultiplier),
        experience: Math.floor(rewards.exp * config.rewardMultiplier),
      },
    };
  }

  // Select rarity based on weights
  private selectRarity(weights: Record<string, number>): Rarity {
    const random = Math.random();
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return rarity as Rarity;
      }
    }

    return 'common';
  }

  // Select random partner class
  private selectRandomClass(): PartnerClass {
    const classes = Object.keys(PARTNER_CLASSES) as PartnerClass[];
    return classes[Math.floor(Math.random() * classes.length)];
  }

  // Select random traits
  private selectRandomTraits(): { primary: NeurodivergentTrait; secondary?: NeurodivergentTrait } {
    const traits = Object.keys(NEURODIVERGENT_TRAITS) as NeurodivergentTrait[];
    const primary = traits[Math.floor(Math.random() * traits.length)];
    
    const hasSecondary = Math.random() > 0.5;
    if (hasSecondary) {
      const availableTraits = traits.filter(t => t !== primary);
      const secondary = availableTraits[Math.floor(Math.random() * availableTraits.length)];
      return { primary, secondary };
    }

    return { primary };
  }

  // Generate stats based on level and rarity
  private generateStats(
    level: number, 
    rarity: Rarity, 
    partnerClass: PartnerClass,
    multiplier: number
  ): { focus: number; perception: number; social: number; logic: number; stamina: number } {
    const baseStats = {
      focus: 50,
      perception: 50,
      social: 50,
      logic: 50,
      stamina: 50,
    };

    const rarityBonus = {
      common: 0,
      uncommon: 10,
      rare: 20,
      epic: 35,
      legendary: 50,
    };

    const classDistribution = PARTNER_CLASSES[partnerClass]?.statDistribution || baseStats;
    
    return {
      focus: Math.floor((classDistribution.focus + rarityBonus[rarity] + level * 2) * multiplier),
      perception: Math.floor((classDistribution.perception + rarityBonus[rarity] + level * 2) * multiplier),
      social: Math.floor((classDistribution.social + rarityBonus[rarity] + level * 2) * multiplier),
      logic: Math.floor((classDistribution.logic + rarityBonus[rarity] + level * 2) * multiplier),
      stamina: Math.floor((classDistribution.stamina + rarityBonus[rarity] + level * 2) * multiplier),
    };
  }

  // Generate arena partner names
  private generateArenaPartnerName(partnerClass: PartnerClass, rarity: Rarity): string {
    const prefixes = {
      common: ['Rookie', 'Novice', 'Fresh'],
      uncommon: ['Skilled', 'Seasoned', 'Trained'],
      rare: ['Elite', 'Expert', 'Veteran'],
      epic: ['Master', 'Champion', 'Legendary'],
      legendary: ['Apex', 'Supreme', 'Mythic'],
    };

    const prefix = prefixes[rarity]?.[
      Math.floor(Math.random() * 3)
    ] || 'Arena';

    return `${prefix} ${partnerClass}`;
  }

  // Generate opponent team names
  private generateOpponentName(difficulty: ArenaDifficulty): string {
    const names = {
      rookie: [
        'The Newcomers',
        'Street Runners',
        'District Rookies',
        'Fresh Couriers',
      ],
      veteran: [
        'The Veterans',
        'City Shadows',
        'Experienced Squad',
        'District Elite',
      ],
      elite: [
        'The Champions',
        'Shadow Elite',
        'Master Couriers',
        'City Legends',
      ],
      legendary: [
        'The Apex Squad',
        'Legendary Team',
        'Supreme Couriers',
        'The Undefeated',
      ],
    };

    const nameList = names[difficulty];
    return nameList[Math.floor(Math.random() * nameList.length)];
  }

  // Calculate match results
  calculateMatchResult(
    playerTeam: StoredPartner[],
    opponentTeam: StoredPartner[],
    strategy: string,
    mode: ArenaMode
  ): ArenaMatchResult {
    const rounds = mode === 'survival' ? 10 : 5;
    let playerScore = 0;
    let opponentScore = 0;
    const highlights: { round: number; event: string; partnerId: string }[] = [];

    // Simulate rounds
    for (let round = 1; round <= rounds; round++) {
      const playerPower = this.calculateTeamPower(playerTeam);
      const opponentPower = this.calculateTeamPower(opponentTeam) * this.getStrategyMultiplier(strategy);

      // Add some randomness
      const playerRoll = playerPower * (0.8 + Math.random() * 0.4);
      const opponentRoll = opponentPower * (0.8 + Math.random() * 0.4);

      if (playerRoll > opponentRoll) {
        playerScore++;
        
        // Add highlight
        const mvpPartner = playerTeam[Math.floor(Math.random() * playerTeam.length)];
        highlights.push({
          round,
          event: `${mvpPartner.name} secured the round with a brilliant move!`,
          partnerId: mvpPartner.id,
        });
      } else {
        opponentScore++;
        highlights.push({
          round,
          event: 'Opponent team takes the round!',
          partnerId: 'opponent',
        });
      }
    }

    const winner = playerScore > opponentScore ? 'player' : 'opponent';
    const baseReward = winner === 'player' ? 100 : 25;
    const difficultyMultiplier = {
      rookie: 1,
      veteran: 1.5,
      elite: 2,
      legendary: 3,
    };

    const rewards = {
      tips: Math.floor(baseReward * (difficultyMultiplier[opponentTeam[0].level > 30 ? 'legendary' : 
                                     opponentTeam[0].level > 20 ? 'elite' :
                                     opponentTeam[0].level > 10 ? 'veteran' : 'rookie'] || 1)),
      experience: Math.floor(baseReward * 0.5),
      rating: winner === 'player' ? 25 : -10,
    };

    return {
      winner,
      rounds,
      playerScore,
      opponentScore,
      mvp: highlights.filter(h => h.partnerId !== 'opponent')[0]?.partnerId,
      rewards,
      highlights,
    };
  }

  // Calculate team power
  private calculateTeamPower(team: StoredPartner[]): number {
    return team.reduce((total, partner) => {
      const stats = Object.values(partner.stats).reduce((sum, stat) => sum + stat, 0);
      const levelBonus = partner.level * 10;
      const rarityMultiplier = {
        common: 1,
        uncommon: 1.2,
        rare: 1.5,
        epic: 2,
        legendary: 2.5,
      };

      return total + (stats + levelBonus) * (rarityMultiplier[partner.rarity] || 1);
    }, 0);
  }

  // Get strategy multiplier
  private getStrategyMultiplier(strategy: string): number {
    switch (strategy) {
      case 'aggressive': return 1.2;
      case 'defensive': return 0.9;
      case 'balanced': return 1.0;
      case 'adaptive': return 1.1;
      default: return 1.0;
    }
  }

  // Get current season info
  getCurrentSeason(): ArenaSeason {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      id: `season_${now.getFullYear()}_${now.getMonth() + 1}`,
      name: `Season ${now.getMonth() + 1}`,
      startDate: startOfMonth,
      endDate: endOfMonth,
      rewards: [
        { rank: 1, tips: 10000, items: ['legendary_skin_ticket'], exclusive: true },
        { rank: 10, tips: 5000, items: ['epic_skin_ticket'], exclusive: false },
        { rank: 100, tips: 2000, items: ['rare_skin_ticket'], exclusive: false },
        { rank: 1000, tips: 500, items: ['common_skin_ticket'], exclusive: false },
      ],
    };
  }

  // Calculate player rank based on rating
  calculateRank(rating: number): string {
    if (rating >= 2500) return 'master';
    if (rating >= 2000) return 'diamond';
    if (rating >= 1500) return 'platinum';
    if (rating >= 1000) return 'gold';
    if (rating >= 500) return 'silver';
    return 'bronze';
  }
}

// Export singleton instance
export const arenaSystem = ArenaSystem.getInstance();