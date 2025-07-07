import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentPartnerAdapter } from '@/lib/cms/content-partner-adapter';
import { ContentGachaSystem } from '@/lib/cms/content-gacha-system';

// Mock the content loader
vi.mock('@/lib/cms/content-loader', () => ({
  loadAllCharacters: vi.fn(),
  loadCharacter: vi.fn(),
}));

describe('Content Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ContentPartnerAdapter', () => {
    it('should convert content characters to partner format', async () => {
      const mockCharacters = [
        {
          metadata: {
            id: 'tania-volkov',
            type: 'character',
            title: 'Tania Volkov',
            name: 'Tania Volkov',
            role: 'partner',
            class: 'courier',
            traits: ['hyperfocus', 'pattern_recognition'],
            stats: { focus: 85, perception: 70, social: 45, logic: 60, stamina: 75 },
            relationships: { miguel: 80, kai: 60 },
            voiceStyle: 'Direct, practical, with dry humor',
            tags: ['main_character', 'rebel', 'neurodivergent'],
            published: true
          },
          content: `# Tania Volkov

## Background

Tania grew up in the Industrial District of Neo Prosperity, where the air tastes like metal and hope is a luxury few can afford. Diagnosed with ADHD as a child, she spent years being told she'd never amount to anything because she couldn't sit still in school.

But when WHIX took over the city's delivery infrastructure, Tania discovered something remarkable: her hyperfocus wasn't a disability—it was a superpower.`
        }
      ];

      const { loadAllCharacters } = await import('@/lib/cms/content-loader');
      vi.mocked(loadAllCharacters).mockResolvedValue(mockCharacters as any);

      const partners = await ContentPartnerAdapter.loadAllContentCharacters();

      expect(partners).toHaveLength(1);
      expect(partners[0]).toMatchObject({
        name: 'Tania Volkov',
        class: 'courier',
        primaryTrait: 'hyperfocus',
        secondaryTrait: 'pattern_recognition',
        rarity: 'legendary', // Main character should be legendary
        isContentBased: true,
        contentId: 'tania-volkov'
      });
      
      expect(partners[0].stats.focus).toBe(85);
      expect(partners[0].relationships).toEqual({ miguel: 80, kai: 60 });
    });

    it('should determine rarity based on character importance', async () => {
      const characters = [
        {
          metadata: {
            id: 'main-char',
            tags: ['main_character'],
            traits: ['hyperfocus'],
            published: true,
            role: 'partner'
          }
        },
        {
          metadata: {
            id: 'unique-char',
            tags: ['unique'],
            traits: ['trait1', 'trait2', 'trait3'],
            published: true,
            role: 'partner'
          }
        },
        {
          metadata: {
            id: 'common-char',
            traits: ['trait1'],
            published: true,
            role: 'partner'
          }
        }
      ];

      const { loadAllCharacters } = await import('@/lib/cms/content-loader');
      vi.mocked(loadAllCharacters).mockResolvedValue(characters as any);

      const partners = await ContentPartnerAdapter.loadAllContentCharacters();

      // Main character should be legendary
      const mainChar = partners.find(p => p.contentId === 'main-char');
      expect(mainChar?.rarity).toBe('legendary');

      // Unique character with 3 traits should be epic
      const uniqueChar = partners.find(p => p.contentId === 'unique-char');
      expect(uniqueChar?.rarity).toBe('epic');

      // Common character should be common
      const commonChar = partners.find(p => p.contentId === 'common-char');
      expect(commonChar?.rarity).toBe('common');
    });
  });

  describe('ContentGachaSystem', () => {
    it('should perform content-based gacha pull', async () => {
      const mockCharacters = [
        {
          contentId: 'char1',
          rarity: 'common',
          name: 'Test Character 1'
        },
        {
          contentId: 'char2',
          rarity: 'rare',
          name: 'Test Character 2'
        }
      ];

      vi.spyOn(ContentPartnerAdapter, 'getGachaPool').mockResolvedValue({
        characters: mockCharacters as any,
        rarityWeights: { common: 70, rare: 30 }
      });

      vi.spyOn(ContentPartnerAdapter, 'getAvailableForRecruitment').mockResolvedValue(mockCharacters as any);

      const result = await ContentGachaSystem.pullGacha(
        'single',
        0, // pullsSinceEpic
        0, // pullsSinceLegendary
        [], // ownedCharacters
        ['chapter-1'], // storyProgress
        5 // playerLevel
      );

      expect(result.results).toHaveLength(1);
      expect(result.pullType).toBe('single');
      expect(result.cost).toBe(100);
      expect(result.results[0].partner).toBeDefined();
      expect(result.results[0].isNew).toBe(true);
    });

    it('should apply pity system correctly', async () => {
      const mockCharacters = [
        { contentId: 'char1', rarity: 'legendary', name: 'Legendary Character' }
      ];

      vi.spyOn(ContentPartnerAdapter, 'getGachaPool').mockResolvedValue({
        characters: mockCharacters as any,
        rarityWeights: { legendary: 100 }
      });

      vi.spyOn(ContentPartnerAdapter, 'getAvailableForRecruitment').mockResolvedValue(mockCharacters as any);

      // Test legendary pity (90 pulls)
      const result = await ContentGachaSystem.pullGacha(
        'single',
        50, // pullsSinceEpic
        90, // pullsSinceLegendary (should trigger pity)
        [], // ownedCharacters
        [],
        1
      );

      expect(result.results[0].pityBroken).toBe('legendary');
    });

    it('should calculate pity rates correctly', () => {
      const rates = ContentGachaSystem.calculatePityRates(25, 45);

      expect(rates.epic).toBe(0.5); // 25/50
      expect(rates.legendary).toBe(0.5); // 45/90
      expect(rates.nextEpicIn).toBe(25); // 50-25
      expect(rates.nextLegendaryIn).toBe(45); // 90-45
    });

    it('should get cost for different pull types', () => {
      expect(ContentGachaSystem.getCost('single')).toBe(100);
      expect(ContentGachaSystem.getCost('multi')).toBe(900);
    });
  });

  describe('Partner Selection Integration', () => {
    it('should filter available partners correctly', async () => {
      const allCharacters = [
        { 
          contentId: 'early-char',
          unlockCondition: 'level >= 1',
          name: 'Early Character'
        },
        {
          contentId: 'late-char', 
          unlockCondition: 'level >= 10',
          name: 'Late Character'
        },
        {
          contentId: 'story-char',
          unlockCondition: 'chapter >= chapter-2',
          name: 'Story Character'
        }
      ];

      vi.spyOn(ContentPartnerAdapter, 'loadAllContentCharacters').mockResolvedValue(allCharacters as any);

      const available = await ContentPartnerAdapter.getAvailableForRecruitment(
        ['chapter-1'], // Story progress
        [], // Unlocked characters
        5 // Player level
      );

      // Should include early character (level 5 >= 1) but not late character (level 5 < 10)
      // Should not include story character (chapter-1 < chapter-2)
      expect(available.map(char => char.contentId)).toContain('early-char');
      expect(available.map(char => char.contentId)).not.toContain('late-char');
      expect(available.map(char => char.contentId)).not.toContain('story-char');
    });

    it('should handle unlocked characters filter', async () => {
      const characters = [
        { contentId: 'char1', name: 'Character 1' },
        { contentId: 'char2', name: 'Character 2' }
      ];

      vi.spyOn(ContentPartnerAdapter, 'loadAllContentCharacters').mockResolvedValue(characters as any);

      const available = await ContentPartnerAdapter.getAvailableForRecruitment(
        [],
        ['char1'], // Already unlocked
        1
      );

      // Should only include char2, not char1 which is already unlocked
      expect(available.map(char => char.contentId)).toEqual(['char2']);
    });
  });
});