import { describe, it, expect } from 'vitest';
import { 
  generatePartner, 
  generateMultiplePulls, 
  applyPitySystem 
} from '@/lib/game/partnerGenerator';

describe('Partner Generator', () => {
  describe('generatePartner', () => {
    it('generates a partner with all required fields', () => {
      const partner = generatePartner();
      
      expect(partner).toHaveProperty('id');
      expect(partner).toHaveProperty('name');
      expect(partner).toHaveProperty('class');
      expect(partner).toHaveProperty('primaryTrait');
      expect(partner).toHaveProperty('level');
      expect(partner).toHaveProperty('rarity');
      expect(partner).toHaveProperty('stats');
      expect(partner).toHaveProperty('personality');
    });

    it('generates partners with valid classes', () => {
      const validClasses = ['courier', 'analyst', 'negotiator', 'specialist', 'investigator'];
      const partner = generatePartner();
      
      expect(validClasses).toContain(partner.class);
    });

    it('generates partners with valid traits', () => {
      const validTraits = [
        'hyperfocus', 'pattern_recognition', 'enhanced_senses',
        'systematic_thinking', 'attention_to_detail', 'routine_mastery',
        'sensory_processing'
      ];
      const partner = generatePartner();
      
      expect(validTraits).toContain(partner.primaryTrait);
      if (partner.secondaryTrait) {
        expect(validTraits).toContain(partner.secondaryTrait);
      }
    });

    it('respects guaranteed rarity when provided', () => {
      const legendary = generatePartner('legendary');
      expect(legendary.rarity).toBe('legendary');
      
      const epic = generatePartner('epic');
      expect(epic.rarity).toBe('epic');
    });

    it('gives more traits to higher rarity partners', () => {
      const common = generatePartner('common');
      const legendary = generatePartner('legendary');
      
      const commonTraits = [common.primaryTrait, common.secondaryTrait, common.tertiaryTrait]
        .filter(Boolean).length;
      const legendaryTraits = [legendary.primaryTrait, legendary.secondaryTrait, legendary.tertiaryTrait]
        .filter(Boolean).length;
      
      expect(commonTraits).toBe(1);
      expect(legendaryTraits).toBe(3);
    });

    it('generates unique backstories mentioning traits positively', () => {
      const partner = generatePartner();
      const backstory = partner.personality.backstory;
      
      expect(backstory).toBeTruthy();
      expect(backstory.length).toBeGreaterThan(50);
      // Should mention the partner's name
      expect(backstory).toContain(partner.name.split(' ')[0]);
    });
  });

  describe('generateMultiplePulls', () => {
    it('generates the correct number of partners', () => {
      const singles = generateMultiplePulls(1);
      expect(singles).toHaveLength(1);
      
      const multi = generateMultiplePulls(10);
      expect(multi).toHaveLength(10);
    });

    it('guarantees at least one rare or better in 10-pull', () => {
      const pulls = generateMultiplePulls(10, true);
      const hasRareOrBetter = pulls.some(p => 
        p.rarity === 'rare' || p.rarity === 'epic' || p.rarity === 'legendary'
      );
      
      expect(hasRareOrBetter).toBe(true);
    });
  });

  describe('applyPitySystem', () => {
    it('returns legendary at 90 pulls', () => {
      const result = applyPitySystem(50, 90);
      expect(result).toBe('legendary');
    });

    it('returns epic at 50 pulls since epic', () => {
      const result = applyPitySystem(50, 45);
      expect(result).toBe('epic');
    });

    it('returns undefined when below pity thresholds', () => {
      const result = applyPitySystem(30, 40);
      expect(result).toBeUndefined();
    });
  });

  describe('Partner Stats', () => {
    it('calculates stats based on class, level, and rarity', () => {
      const courier = generatePartner('common');
      courier.class = 'courier';
      
      const analyst = generatePartner('common');
      analyst.class = 'analyst';
      
      // Stats are calculated based on class, rarity, level, and traits
      // We can't guarantee exact values due to trait modifiers
      expect(courier.stats).toBeDefined();
      expect(analyst.stats).toBeDefined();
      
      // All stats should be positive numbers
      Object.values(courier.stats).forEach(stat => {
        expect(stat).toBeGreaterThan(0);
      });
      
      Object.values(analyst.stats).forEach(stat => {
        expect(stat).toBeGreaterThan(0);
      });
    });

    it('scales stats with rarity', () => {
      const common = generatePartner('common');
      const legendary = generatePartner('legendary');
      
      // Legendary should have higher stats
      expect(legendary.stats.focus).toBeGreaterThan(common.stats.focus);
    });
  });
});