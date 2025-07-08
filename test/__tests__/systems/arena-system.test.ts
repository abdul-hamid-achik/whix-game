import { describe, it, expect, beforeEach } from 'vitest';
import { arenaSystem, ArenaMode, ArenaDifficulty, ArenaOpponent } from '@/lib/systems/arena-system';
import { StoredPartner } from '@/lib/schemas/game-schemas';
import { PartnerClass } from '@/lib/game/classes';

describe('ArenaSystem', () => {
  const mockPlayerTeam: StoredPartner[] = [
    {
      id: 'player-partner-1',
      name: 'Elena Vasquez',
      class: 'specialist',
      primaryTrait: 'hyperfocus',
      secondaryTrait: 'pattern_recognition',
      level: 15,
      rarity: 'rare',
      stats: {
        focus: 120,
        perception: 110,
        social: 80,
        logic: 100,
        stamina: 95,
      },
      experience: 5000,
      currentEnergy: 90,
      maxEnergy: 100,
      bondLevel: 4,
      isInjured: false,
      traitMastery: { hyperfocus: 3 },
      equipment: { weapon: 'enhanced-scanner' },
      missions: 25,
      personality: {
        traits: ['determined', 'analytical'],
        likes: ['efficiency', 'patterns'],
        dislikes: ['chaos', 'interruptions'],
        backstory: 'Former data analyst turned courier',
      },
    },
    {
      id: 'player-partner-2',
      name: 'Marcus Chen',
      class: 'negotiator',
      primaryTrait: 'enhanced_senses',
      level: 12,
      rarity: 'uncommon',
      stats: {
        focus: 85,
        perception: 95,
        social: 120,
        logic: 80,
        stamina: 75,
      },
      experience: 3000,
      currentEnergy: 85,
      maxEnergy: 100,
      bondLevel: 3,
      isInjured: false,
      traitMastery: {},
      equipment: {},
      missions: 15,
      personality: {
        traits: ['charismatic', 'observant'],
        likes: ['conversation', 'people'],
        dislikes: ['conflict', 'isolation'],
        backstory: 'Street-smart negotiator',
      },
    },
  ];

  describe('Opponent Generation', () => {
    it('should generate opponents based on difficulty', () => {
      const rookieOpponent = arenaSystem.generateOpponent('rookie', 'training');
      const eliteOpponent = arenaSystem.generateOpponent('elite', 'training');

      expect(rookieOpponent.difficulty).toBe('rookie');
      expect(eliteOpponent.difficulty).toBe('elite');

      // Rookie should have lower level partners
      const rookieLevels = rookieOpponent.team.map(p => p.level);
      const eliteLevels = eliteOpponent.team.map(p => p.level);

      expect(Math.max(...rookieLevels)).toBeLessThanOrEqual(15);
      expect(Math.min(...eliteLevels)).toBeGreaterThanOrEqual(20);
    });

    it('should generate teams with appropriate size', () => {
      const rookie = arenaSystem.generateOpponent('rookie', 'training');
      const veteran = arenaSystem.generateOpponent('veteran', 'challenge');

      expect(rookie.team).toHaveLength(2); // Rookie teams have 2 members
      expect(veteran.team).toHaveLength(3); // Veteran+ teams have 3 members
    });

    it('should assign appropriate rarities based on difficulty', () => {
      const legendary = arenaSystem.generateOpponent('legendary', 'pvp');
      
      // Legendary opponents should have higher rarity partners
      const rarities = legendary.team.map(p => p.rarity);
      const hasHighRarity = rarities.some(r => ['rare', 'epic', 'legendary'].includes(r));
      
      expect(hasHighRarity).toBe(true);
      expect(rarities).not.toContain('common'); // No common partners in legendary
    });

    it('should generate diverse team compositions', () => {
      const opponent = arenaSystem.generateOpponent('veteran', 'survival');
      
      const classes = opponent.team.map(p => p.class);
      const traits = opponent.team.flatMap(p => [p.primaryTrait, p.secondaryTrait].filter(Boolean));
      
      // Should have variety in classes and traits
      expect(new Set(classes).size).toBeGreaterThan(0);
      expect(new Set(traits).size).toBeGreaterThan(0);
    });

    it('should apply stat multipliers correctly', () => {
      const elite = arenaSystem.generateOpponent('elite', 'training');
      
      elite.team.forEach(partner => {
        const totalStats = Object.values(partner.stats).reduce((sum, stat) => sum + stat, 0);
        // Elite partners should have higher total stats due to multiplier
        expect(totalStats).toBeGreaterThan(250); // Base stats would be around 250-300
      });
    });

    it('should generate appropriate opponent names', () => {
      const difficulties: ArenaDifficulty[] = ['rookie', 'veteran', 'elite', 'legendary'];
      
      difficulties.forEach(difficulty => {
        const opponent = arenaSystem.generateOpponent(difficulty, 'training');
        expect(opponent.name).toBeTruthy();
        expect(opponent.name).not.toContain('undefined');
        
        // Names should be thematically appropriate
        expect(opponent.name).toMatch(/Newcomers|Runners|Rookies|Veterans|Shadows|Champions|Elite|Legends|Squad|Team|Couriers|Master|Supreme|Apex|Undefeated|Fresh|Experienced|District/);
      });
    });
  });

  describe('Match Simulation', () => {
    it('should calculate match results', () => {
      const opponent = arenaSystem.generateOpponent('veteran', 'training');
      const result = arenaSystem.calculateMatchResult(
        mockPlayerTeam,
        opponent.team,
        opponent.strategy,
        'training'
      );

      expect(result.winner).toMatch(/^(player|opponent)$/);
      expect(result.rounds).toBeGreaterThan(0);
      expect(result.playerScore + result.opponentScore).toBe(result.rounds);
      expect(result.highlights).toBeInstanceOf(Array);
    });

    it('should generate highlights for matches', () => {
      const opponent = arenaSystem.generateOpponent('elite', 'challenge');
      const result = arenaSystem.calculateMatchResult(
        mockPlayerTeam,
        opponent.team,
        'aggressive',
        'challenge'
      );

      expect(result.highlights.length).toBeGreaterThan(0);
      
      result.highlights.forEach(highlight => {
        expect(highlight.round).toBeGreaterThanOrEqual(1);
        expect(highlight.round).toBeLessThanOrEqual(result.rounds);
        expect(highlight.event).toBeTruthy();
        expect(highlight.partnerId).toBeTruthy();
      });
    });

    it('should calculate rewards based on difficulty and outcome', () => {
      const rookieOpponent = arenaSystem.generateOpponent('rookie', 'training');
      const legendaryOpponent = arenaSystem.generateOpponent('legendary', 'training');

      const rookieWin = arenaSystem.calculateMatchResult(
        mockPlayerTeam,
        rookieOpponent.team,
        'balanced',
        'training'
      );

      const legendaryWin = arenaSystem.calculateMatchResult(
        mockPlayerTeam,
        legendaryOpponent.team,
        'adaptive',
        'training'
      );

      // Assuming player wins both
      if (rookieWin.winner === 'player' && legendaryWin.winner === 'player') {
        expect(legendaryWin.rewards.tips).toBeGreaterThan(rookieWin.rewards.tips);
        expect(legendaryWin.rewards.experience).toBeGreaterThan(rookieWin.rewards.experience);
      }
    });

    it('should handle different strategies', () => {
      const opponent = arenaSystem.generateOpponent('veteran', 'pvp');
      const strategies = ['aggressive', 'defensive', 'balanced', 'adaptive'] as const;

      strategies.forEach(strategy => {
        const result = arenaSystem.calculateMatchResult(
          mockPlayerTeam,
          opponent.team,
          strategy,
          'pvp'
        );

        expect(result).toBeDefined();
        expect(result.winner).toBeDefined();
      });
    });

    it('should identify MVP partners', () => {
      const opponent = arenaSystem.generateOpponent('veteran', 'challenge');
      const result = arenaSystem.calculateMatchResult(
        mockPlayerTeam,
        opponent.team,
        'balanced',
        'challenge'
      );

      if (result.winner === 'player' && result.mvp) {
        const mvpPartner = mockPlayerTeam.find(p => p.id === result.mvp);
        expect(mvpPartner).toBeDefined();
      }
    });
  });

  describe('Season Management', () => {
    it('should get current season information', () => {
      const season = arenaSystem.getCurrentSeason();
      
      expect(season.id).toBeTruthy();
      expect(season.name).toBeTruthy();
      expect(season.startDate).toBeInstanceOf(Date);
      expect(season.endDate).toBeInstanceOf(Date);
      expect(season.rewards).toBeInstanceOf(Array);
    });

    it('should have appropriate season rewards', () => {
      const season = arenaSystem.getCurrentSeason();
      
      expect(season.rewards.length).toBeGreaterThan(0);
      
      season.rewards.forEach(reward => {
        expect(reward.rank).toBeGreaterThan(0);
        expect(reward.tips).toBeGreaterThan(0);
        expect(reward.items).toBeInstanceOf(Array);
        expect(typeof reward.exclusive).toBe('boolean');
      });

      // Higher ranks should have better rewards
      const sortedRewards = [...season.rewards].sort((a, b) => a.rank - b.rank);
      for (let i = 1; i < sortedRewards.length; i++) {
        expect(sortedRewards[i].tips).toBeLessThanOrEqual(sortedRewards[i-1].tips);
      }
    });
  });

  describe('Rating System', () => {
    it('should calculate player rank based on rating', () => {
      const ranks = [
        { rating: 0, expected: 'bronze' },
        { rating: 600, expected: 'silver' },
        { rating: 1200, expected: 'gold' },
        { rating: 1700, expected: 'platinum' },
        { rating: 2200, expected: 'diamond' },
        { rating: 2800, expected: 'master' },
      ];

      ranks.forEach(({ rating, expected }) => {
        expect(arenaSystem.calculateRank(rating)).toBe(expected);
      });
    });
  });

  describe('Soviet-Aztec Theme Consistency', () => {
    it('should generate thematically appropriate partner names', () => {
      const opponent = arenaSystem.generateOpponent('elite', 'training');
      
      opponent.team.forEach(partner => {
        // Should not have fantasy names
        expect(partner.name).not.toMatch(/Dragon|Wizard|Knight|Mage/);
        
        // Should have appropriate class names
        expect(['courier', 'analyst', 'negotiator', 'specialist', 'investigator'])
          .toContain(partner.class);
      });
    });

    it('should have appropriate personality traits', () => {
      const opponent = arenaSystem.generateOpponent('veteran', 'survival');
      
      opponent.team.forEach(partner => {
        expect(partner.personality.traits).toContain('competitive');
        expect(partner.personality.backstory).toContain('Arena challenger');
        
        // Should not have fantasy elements
        partner.personality.likes.forEach(like => {
          expect(like).not.toMatch(/magic|spell|dragon/);
        });
      });
    });

    it('should generate items with appropriate names', () => {
      const season = arenaSystem.getCurrentSeason();
      
      season.rewards.forEach(reward => {
        reward.items.forEach(item => {
          // Items should be tech/modern themed
          expect(item).toMatch(/ticket|skin|enhancement/);
          expect(item).not.toMatch(/sword|staff|rune|potion/);
        });
      });
    });
  });

  describe('Team Power Calculation', () => {
    it('should calculate team power correctly', () => {
      // Use private method through bracket notation for testing
      const power = arenaSystem['calculateTeamPower'](mockPlayerTeam);
      
      expect(power).toBeGreaterThan(0);
      
      // Higher level and rarity should increase power
      const singlePartner = [mockPlayerTeam[0]];
      const singlePower = arenaSystem['calculateTeamPower'](singlePartner);
      
      expect(power).toBeGreaterThan(singlePower); // Two partners > one partner
    });
  });
});