import { db } from '@/lib/db';
import { skins, playerSkins, skinGachaPulls, players } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { skinGenerator } from '@/lib/ai/skin-generator';
import { nanoid } from 'nanoid';

export interface SkinGachaResult {
  skinId: string;
  skin: any;
  generatedImage?: any;
  isNew: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tipCost: number;
}

export interface SkinGachaRates {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

// Skin gacha rates (percentages)
const DEFAULT_RATES: SkinGachaRates = {
  common: 60,    // 60%
  rare: 30,      // 30% 
  epic: 8,       // 8%
  legendary: 2   // 2%
};

// Tip costs for skin gacha (using tips as currency like in partner gacha)
const SKIN_GACHA_COSTS = {
  single: 150,     // 150 tips for single pull
  multi: 1350      // 1350 tips for 10-pull (save 150 tips)
};

export class SkinGachaSystem {
  private static instance: SkinGachaSystem;
  
  public static getInstance(): SkinGachaSystem {
    if (!SkinGachaSystem.instance) {
      SkinGachaSystem.instance = new SkinGachaSystem();
    }
    return SkinGachaSystem.instance;
  }

  private constructor() {}

  async pullSkinGacha(
    playerId: string, 
    partnerId: string,
    pullType: 'single' | 'multi' = 'single'
  ): Promise<SkinGachaResult[]> {
    const pullCount = pullType === 'single' ? 1 : 10;
    const tipCost = SKIN_GACHA_COSTS[pullType];
    
    // Check if player has enough tips
    const player = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
    if (!player[0] || player[0].currentTips < tipCost) {
      throw new Error('Insufficient tips for skin gacha');
    }

    // Get partner info for skin generation context
    const partnerData = await this.getPartnerForSkinGeneration(partnerId);
    
    const results: SkinGachaResult[] = [];
    
    for (let i = 0; i < pullCount; i++) {
      const rarity = this.determineRarity();
      const skin = await this.selectRandomSkin(rarity);
      
      if (!skin) {
        throw new Error(`No skin available for rarity: ${rarity}`);
      }

      // Check if player already has this skin
      const existingSkin = await db.select()
        .from(playerSkins)
        .where(and(
          eq(playerSkins.playerId, playerId),
          eq(playerSkins.skinId, skin.id),
          eq(playerSkins.partnerId, partnerId)
        ))
        .limit(1);

      let generatedImage = null;
      const isNew = existingSkin.length === 0;

      if (isNew) {
        // Generate new skin image for this partner
        try {
          generatedImage = await skinGenerator.generateSkinImage(
            {
              id: skin.id,
              name: skin.name,
              description: skin.description,
              rarity: skin.rarity,
              skinType: skin.skinType,
              category: skin.category,
              basePrompt: skin.imagePrompt,
              styleModifiers: (skin.styleModifiers || {}) as Record<string, string>,
              partnerClassCompatible: (skin.partnerClassCompatible || []) as string[],
              traitSynergies: (skin.traitSynergies || []) as string[],
              tipCost: skin.tipCost
            },
            partnerData.class,
            partnerData.traits,
            partnerData.name
          );

          // Save the new skin to player's collection
          await db.insert(playerSkins).values({
            id: nanoid(),
            playerId,
            skinId: skin.id,
            partnerId,
            generatedImageUrl: generatedImage.url,
            generatedAt: new Date(),
            isEquipped: false,
            acquisitionMethod: 'gacha',
            obtainedAt: new Date()
          });

        } catch (error) {
          console.error('Error generating skin image:', error);
          // Still add skin to collection without generated image
          await db.insert(playerSkins).values({
            id: nanoid(),
            playerId,
            skinId: skin.id,
            partnerId,
            isEquipped: false,
            acquisitionMethod: 'gacha',
            obtainedAt: new Date()
          });
        }
      }

      // Record the gacha pull
      await db.insert(skinGachaPulls).values({
        id: nanoid(),
        playerId,
        skinId: skin.id,
        tipCost: Math.floor(tipCost / pullCount),
        rarity: rarity,
        wasGenerated: isNew,
        pulledAt: new Date()
      });

      results.push({
        skinId: skin.id,
        skin,
        generatedImage,
        isNew,
        rarity,
        tipCost: Math.floor(tipCost / pullCount)
      });
    }

    // Deduct tips from player
    await db.update(players)
      .set({ 
        currentTips: player[0].currentTips - tipCost,
        updatedAt: new Date()
      })
      .where(eq(players.id, playerId));

    return results;
  }

  private determineRarity(): 'common' | 'rare' | 'epic' | 'legendary' {
    const roll = Math.random() * 100;
    
    if (roll <= DEFAULT_RATES.legendary) {
      return 'legendary';
    } else if (roll <= DEFAULT_RATES.legendary + DEFAULT_RATES.epic) {
      return 'epic';
    } else if (roll <= DEFAULT_RATES.legendary + DEFAULT_RATES.epic + DEFAULT_RATES.rare) {
      return 'rare';
    } else {
      return 'common';
    }
  }

  private async selectRandomSkin(rarity: string) {
    const availableSkins = await db.select()
      .from(skins)
      .where(and(
        eq(skins.rarity, rarity as any),
        eq(skins.isActive, true)
      ));

    if (availableSkins.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableSkins.length);
    return availableSkins[randomIndex];
  }

  private async getPartnerForSkinGeneration(_partnerId: string) {
    // This would fetch partner data - for now return mock data
    // In real implementation, join with partners table
    return {
      name: "Miguel Santos",
      class: "courier",
      traits: ["hyperfocus", "pattern_recognition"]
    };
  }

  async getPlayerSkins(playerId: string, _partnerId?: string) {
    const whereConditions = [eq(playerSkins.playerId, playerId)];
    
    if (_partnerId) {
      whereConditions.push(eq(playerSkins.partnerId, _partnerId));
    }

    return await db.select({
      playerSkin: playerSkins,
      skin: skins
    })
    .from(playerSkins)
    .leftJoin(skins, eq(playerSkins.skinId, skins.id))
    .where(and(...whereConditions));
  }

  async equipSkin(playerId: string, playerSkinId: string) {
    const playerSkin = await db.select()
      .from(playerSkins)
      .where(and(
        eq(playerSkins.id, playerSkinId),
        eq(playerSkins.playerId, playerId)
      ))
      .limit(1);

    if (!playerSkin[0]) {
      throw new Error('Skin not found or not owned by player');
    }

    // Unequip all other skins for this partner
    if (playerSkin[0].partnerId) {
      await db.update(playerSkins)
        .set({ isEquipped: false })
        .where(and(
          eq(playerSkins.playerId, playerId),
          eq(playerSkins.partnerId, playerSkin[0].partnerId!)
        ));
    }

    // Equip the selected skin
    await db.update(playerSkins)
      .set({ isEquipped: true })
      .where(eq(playerSkins.id, playerSkinId));

    return true;
  }

  async getSkinGachaStats() {
    return {
      rates: DEFAULT_RATES,
      costs: SKIN_GACHA_COSTS,
      availableSkins: await this.getAvailableSkinCounts()
    };
  }

  private async getAvailableSkinCounts() {
    const counts = await db.select()
      .from(skins)
      .where(eq(skins.isActive, true));

    return counts.reduce((acc, skin) => {
      acc[skin.rarity] = (acc[skin.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const skinGachaSystem = SkinGachaSystem.getInstance();