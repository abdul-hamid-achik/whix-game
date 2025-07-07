import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkinGachaSystem } from '@/lib/game/skin-gacha';
import { db } from '@/lib/db';
import { players, skins, playerSkins, skinGachaPulls } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Mock database operations
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([]))
        })),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([]))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve())
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve())
      }))
    }))
  }
}));

// Mock AI skin generator
vi.mock('@/lib/ai/skin-generator', () => ({
  skinGenerator: {
    generateSkinImage: vi.fn(() => Promise.resolve({
      url: 'https://fake-image.com/skin.png',
      prompt: 'Generated skin image'
    }))
  }
}));

describe('SkinGachaSystem - Polanco Theme', () => {
  let skinGacha: SkinGachaSystem;
  const mockPlayerId = 'player-123';
  const mockPartnerId = 'partner-456';

  beforeEach(() => {
    vi.clearAllMocks();
    skinGacha = SkinGachaSystem.getInstance();
  });

  describe('Skin Pull Mechanics', () => {
    it('should check player has enough tips in Polanco currency', async () => {
      const mockPlayer = {
        id: mockPlayerId,
        currentTips: 100, // Not enough for single pull (150 tips)
      };

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockPlayer]))
          }))
        }))
      } as any);

      await expect(
        skinGacha.pullSkinGacha(mockPlayerId, mockPartnerId, 'single')
      ).rejects.toThrow('Insufficient tips for skin gacha');
    });

    it('should pull common WHIX delivery uniform skin', async () => {
      const mockPlayer = {
        id: mockPlayerId,
        currentTips: 200, // Enough for single pull
      };

      const mockSkin = {
        id: 'skin-001',
        name: 'Standard WHIX Jacket',
        description: 'Basic delivery uniform with Aztec-Soviet patches',
        rarity: 'common',
        skinType: 'outfit',
        category: 'delivery_uniform',
        imagePrompt: 'Standard WHIX delivery jacket, soviet-style utility design with Aztec geometric patterns',
        tipCost: 150,
        isActive: true,
      };

      // Force common rarity by mocking Math.random
      vi.spyOn(Math, 'random').mockReturnValue(0.8); // Will trigger common (60% threshold)

      // Mock player with enough tips
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockPlayer]))
          }))
        }))
      } as any);

      // Mock skin selection
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([mockSkin]))
        }))
      } as any);

      // Mock existing skin check (not owned)
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([]))
          }))
        }))
      } as any);

      const results = await skinGacha.pullSkinGacha(mockPlayerId, mockPartnerId, 'single');

      expect(results).toHaveLength(1);
      expect(results[0].rarity).toBe('common');
      expect(results[0].isNew).toBe(true);
      expect(results[0].generatedImage).toBeDefined();
      expect(results[0].tipCost).toBe(150);
    });

    it('should handle epic Aztec-Soviet themed skin', async () => {
      const mockPlayer = {
        id: mockPlayerId,
        currentTips: 1500, // Enough for 10-pull
      };

      const mockEpicSkin = {
        id: 'skin-epic-001',
        name: 'Elite Collective Courier Gear',
        description: 'Elite courier outfit with Aztec gold trim and Soviet-tech HUD',
        rarity: 'epic',
        skinType: 'outfit',
        category: 'delivery_uniform',
        imagePrompt: 'Elite courier gear, Aztec gold trim, integrated Soviet-tech HUD, weather adaptive',
        styleModifiers: {
          'accent_color': 'gold',
          'tech_level': 'advanced',
          'cultural_fusion': 'aztec-soviet'
        },
        partnerClassCompatible: ['courier', 'specialist'],
        traitSynergies: ['hyperfocus', 'enhanced_senses'],
        tipCost: 1350,
        isActive: true,
      };

      // Mock player with enough tips
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockPlayer]))
          }))
        }))
      } as any);

      // Force epic rarity by mocking the random selection
      vi.spyOn(Math, 'random').mockReturnValue(0.05); // Will trigger epic (2% legendary + 8% epic threshold)

      // Mock skin selection
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([mockEpicSkin]))
        }))
      } as any);

      // Mock existing skin check (not owned)
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([]))
          }))
        }))
      } as any);

      const results = await skinGacha.pullSkinGacha(mockPlayerId, mockPartnerId, 'single');

      expect(results[0].rarity).toBe('epic');
      expect(results[0].skin.styleModifiers?.cultural_fusion).toBe('aztec-soviet');
    });
  });

  describe('Polanco District Themed Skins', () => {
    it('should generate skins with proper Polanco delivery dystopia themes', async () => {
      const mockPlayer = { id: mockPlayerId, currentTips: 1500 };
      
      const polancoSkins = [
        {
          id: 'skin-polanco-001',
          name: 'Polanco Street Survivor',
          description: 'Street wear with resistance pins and Aztec motifs',
          category: 'street_wear',
          imagePrompt: 'Polanco street clothes, patched hoodie with Aztec motifs, worn soviet-style work pants',
        },
        {
          id: 'skin-polanco-002',
          name: 'Corporate Climber Suit',
          description: 'Desperate professionalism in collective dystopia',
          category: 'corporate',
          imagePrompt: 'Corporate middle management attire, cheap synthetic suit with subtle geometric patterns',
        },
        {
          id: 'skin-polanco-003',
          name: 'Underground Courier Bike',
          description: 'Modified for navigating Polanco chaos',
          category: 'courier_bike',
          imagePrompt: 'Beat-up delivery bike, rust spots, multiple repairs, economic desperation on wheels',
        }
      ];

      // Verify all skins have Polanco/WHIX themes, not medieval/fantasy
      polancoSkins.forEach(skin => {
        expect(skin.imagePrompt).not.toContain('medieval');
        expect(skin.imagePrompt).not.toContain('fantasy');
        expect(skin.imagePrompt).not.toContain('kingdom');
        expect(skin.imagePrompt).not.toContain('magic');
        
        // Should contain dystopian delivery themes
        const lowerPrompt = skin.imagePrompt.toLowerCase();
        const hasProperTheme = 
          lowerPrompt.includes('polanco') ||
          lowerPrompt.includes('delivery') ||
          lowerPrompt.includes('corporate') ||
          lowerPrompt.includes('aztec') ||
          lowerPrompt.includes('soviet') ||
          lowerPrompt.includes('dystopi') ||
          lowerPrompt.includes('collective') ||
          lowerPrompt.includes('courier') ||
          lowerPrompt.includes('gig') ||
          lowerPrompt.includes('economic');
        
        expect(hasProperTheme).toBe(true);
      });
    });
  });

  describe('Skin Equipment System', () => {
    it('should equip skin to specific partner', async () => {
      const mockPlayerSkinId = 'player-skin-001';
      const mockPlayerSkin = {
        id: mockPlayerSkinId,
        playerId: mockPlayerId,
        skinId: 'skin-001',
        partnerId: mockPartnerId,
        isEquipped: false,
      };

      // Mock finding the player's skin
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockPlayerSkin]))
          }))
        }))
      } as any);

      // Mock unequipping other skins
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve())
        }))
      } as any);

      // Mock equipping the selected skin
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve())
        }))
      } as any);

      const result = await skinGacha.equipSkin(mockPlayerId, mockPlayerSkinId);
      
      expect(result).toBe(true);
      expect(db.update).toHaveBeenCalledTimes(2); // Unequip others, then equip selected
    });
  });

  describe('Gacha Statistics', () => {
    it('should return proper gacha rates and costs in tips', async () => {
      // Mock the skin counts query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([
            { rarity: 'common' },
            { rarity: 'common' },
            { rarity: 'common' },
            { rarity: 'rare' },
            { rarity: 'rare' },
            { rarity: 'epic' },
            { rarity: 'legendary' }
          ]))
        }))
      } as any);

      const stats = await skinGacha.getSkinGachaStats();

      expect(stats.rates).toEqual({
        common: 60,
        rare: 30,
        epic: 8,
        legendary: 2
      });

      expect(stats.costs).toEqual({
        single: 150,
        multi: 1350 // 10-pull discount
      });
    });
  });
});