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
    vi.resetModules();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ContentPartnerAdapter', () => {
    it('should convert content characters to partner format', async () => {
      const mockCharacters = [
        {
          metadata: {
            id: 'tania-volkov',
            type: 'character' as const,
            title: 'Tania Volkov',
            description: 'Elite courier',
            name: 'Tania Volkov',
            role: 'partner' as const,
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

But when WHIX took over the city's delivery infrastructure, Tania discovered something remarkable: her hyperfocus wasn't a disability—it was a superpower.`,
          htmlContent: '<p>HTML content</p>',
          slug: 'tania-volkov',
          filePath: '/content/characters/tania-volkov.md'
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
      
      // Check that stats are generated with proper multipliers
      expect(partners[0].stats.focus).toBeGreaterThan(80); // With legendary multiplier
      expect(partners[0].relationships).toEqual({ miguel: 80, kai: 60 });
    });

    it('should determine rarity based on character importance', async () => {
      const characters = [
        {
          metadata: {
            id: 'main-char',
            type: 'character' as const,
            title: 'Main Character',
            description: 'A main character',
            name: 'Main Character',
            tags: ['main_character'],
            traits: ['hyperfocus'],
            published: true,
            role: 'partner' as const
          },
          content: 'Character story with determination and creativity...',
          htmlContent: '<p>HTML</p>',
          slug: 'main-char',
          filePath: '/content/characters/main-char.md'
        },
        {
          metadata: {
            id: 'unique-char',
            type: 'character' as const,
            title: 'Unique Character',
            description: 'A unique character',
            name: 'Unique Character',
            tags: ['unique'],
            traits: ['hyperfocus', 'pattern_recognition', 'enhanced_senses'],
            published: true,
            role: 'partner' as const
          },
          content: 'Character with analysis and empathy...',
          htmlContent: '<p>HTML</p>',
          slug: 'unique-char',
          filePath: '/content/characters/unique-char.md'
        },
        {
          metadata: {
            id: 'common-char',
            type: 'character' as const,
            title: 'Common Character',
            description: 'A common character',
            name: 'Common Character',
            traits: ['hyperfocus'],
            published: true,
            role: 'partner' as const
          },
          content: 'Simple character backstory...',
          htmlContent: '<p>HTML</p>',
          slug: 'common-char',
          filePath: '/content/characters/common-char.md'
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
      const mockCharacters = [
        {
          metadata: {
            id: 'early-char',
            type: 'character' as const,
            title: 'Early Character',
            description: 'An early game character',
            name: 'Early Character',
            role: 'partner' as const,
            class: 'courier',
            traits: ['hyperfocus'],
            published: true,
            unlockCondition: 'level >= 1'
          },
          content: 'Early character story...',
          htmlContent: '<p>HTML</p>',
          slug: 'early-char',
          filePath: '/content/characters/early-char.md'
        },
        {
          metadata: {
            id: 'late-char',
            type: 'character' as const,
            title: 'Late Character',
            description: 'A late game character',
            name: 'Late Character',
            role: 'partner' as const,
            class: 'analyst',
            traits: ['pattern_recognition'],
            published: true,
            unlockCondition: 'level >= 10'
          },
          content: 'Late character story...',
          htmlContent: '<p>HTML</p>',
          slug: 'late-char',
          filePath: '/content/characters/late-char.md'
        },
        {
          metadata: {
            id: 'story-char',
            type: 'character' as const,
            title: 'Story Character',
            description: 'A story-locked character',
            name: 'Story Character',
            role: 'partner' as const,
            class: 'negotiator',
            traits: ['enhanced_senses'],
            published: true,
            unlockCondition: 'chapter >= chapter-2'
          },
          content: 'Story character backstory...',
          htmlContent: '<p>HTML</p>',
          slug: 'story-char',
          filePath: '/content/characters/story-char.md'
        }
      ];

      const { loadAllCharacters } = await import('@/lib/cms/content-loader');
      vi.mocked(loadAllCharacters).mockResolvedValue(mockCharacters as any);

      const available = await ContentPartnerAdapter.getAvailableForRecruitment(
        ['chapter-1'], // Story progress
        [], // Unlocked characters
        5 // Player level
      );

      // Should include early character (level 5 >= 1) but not late character (level 5 < 10)
      // Should not include story character (chapter-1 < chapter-2)
      expect(available).toHaveLength(1);
      expect(available[0].contentId).toBe('early-char');
      expect(available[0].unlockCondition).toBe('level >= 1');
    });

    it('should handle unlocked characters filter', async () => {
      const mockCharacters = [
        {
          metadata: {
            id: 'char1',
            type: 'character' as const,
            title: 'Character 1',
            description: 'First character',
            name: 'Character 1',
            role: 'partner' as const,
            class: 'courier',
            traits: ['hyperfocus'],
            published: true
          },
          content: 'Character 1 story...',
          htmlContent: '<p>HTML</p>',
          slug: 'char1',
          filePath: '/content/characters/char1.md'
        },
        {
          metadata: {
            id: 'char2',
            type: 'character' as const,
            title: 'Character 2',
            description: 'Second character',
            name: 'Character 2',
            role: 'partner' as const,
            class: 'analyst',
            traits: ['pattern_recognition'],
            published: true
          },
          content: 'Character 2 story...',
          htmlContent: '<p>HTML</p>',
          slug: 'char2',
          filePath: '/content/characters/char2.md'
        }
      ];

      const { loadAllCharacters } = await import('@/lib/cms/content-loader');
      vi.mocked(loadAllCharacters).mockResolvedValue(mockCharacters as any);

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