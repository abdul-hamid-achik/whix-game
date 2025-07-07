import { ClientContentAdapter } from './client-content-adapter';
import { ContentPartner } from './content-partner-adapter';
import { nanoid } from 'nanoid';

export interface GachaResult {
  partner: ContentPartner;
  isNew: boolean;
  pityBroken?: 'epic' | 'legendary';
}

export interface GachaPull {
  id: string;
  results: GachaResult[];
  timestamp: number;
  cost: number;
  pullType: 'single' | 'multi';
}

/**
 * Client-side gacha system for recruiting actual characters
 */
export class ClientGachaSystem {
  private static readonly SINGLE_COST = 100;
  private static readonly MULTI_COST = 900;
  private static readonly EPIC_PITY = 50;
  private static readonly LEGENDARY_PITY = 90;
  
  /**
   * Perform a gacha pull using content characters
   */
  static async pullGacha(
    pullType: 'single' | 'multi',
    pullsSinceEpic: number,
    pullsSinceLegendary: number,
    ownedCharacters: string[],
    storyProgress: string[] = [],
    playerLevel: number = 1
  ): Promise<GachaPull> {
    const { characters: _characters, rarityWeights } = await ClientContentAdapter.getGachaPool();
    
    // Get available characters (not owned, unlocked)
    const availableCharacters = await ClientContentAdapter.getAvailableForRecruitment(
      storyProgress,
      ownedCharacters,
      playerLevel
    );
    
    if (availableCharacters.length === 0) {
      throw new Error('No characters available for recruitment');
    }
    
    const pullCount = pullType === 'single' ? 1 : 10;
    const results: GachaResult[] = [];
    let currentPityEpic = pullsSinceEpic;
    let currentPityLegendary = pullsSinceLegendary;
    
    for (let i = 0; i < pullCount; i++) {
      currentPityEpic++;
      currentPityLegendary++;
      
      // Check pity system
      let guaranteedRarity: string | undefined;
      let pityBroken: 'epic' | 'legendary' | undefined;
      
      if (currentPityLegendary >= this.LEGENDARY_PITY) {
        guaranteedRarity = 'legendary';
        pityBroken = 'legendary';
        currentPityLegendary = 0;
        currentPityEpic = 0;
      } else if (currentPityEpic >= this.EPIC_PITY) {
        guaranteedRarity = 'epic';
        pityBroken = 'epic';
        currentPityEpic = 0;
      }
      
      // Select character
      const selectedRarity = guaranteedRarity || this.rollRarity(rarityWeights);
      const character = this.selectCharacterByRarity(availableCharacters, selectedRarity);
      
      if (character) {
        const isNew = !ownedCharacters.includes(character.contentId);
        
        results.push({
          partner: character,
          isNew,
          pityBroken
        });
        
        // Add to owned to prevent duplicates in same pull
        if (isNew) {
          ownedCharacters.push(character.contentId);
        }
      }
    }
    
    return {
      id: nanoid(),
      results,
      timestamp: Date.now(),
      cost: pullType === 'single' ? this.SINGLE_COST : this.MULTI_COST,
      pullType
    };
  }
  
  /**
   * Roll for rarity based on weights
   */
  private static rollRarity(weights: Record<string, number>): string {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;
    
    for (const [rarity, weight] of Object.entries(weights)) {
      roll -= weight;
      if (roll <= 0) {
        return rarity;
      }
    }
    
    return 'common';
  }
  
  /**
   * Select character of specific rarity
   */
  private static selectCharacterByRarity(
    characters: ContentPartner[], 
    targetRarity: string
  ): ContentPartner | null {
    const candidatesOfRarity = characters.filter(char => char.rarity === targetRarity);
    
    if (candidatesOfRarity.length > 0) {
      return candidatesOfRarity[Math.floor(Math.random() * candidatesOfRarity.length)];
    }
    
    // Fallback to any available character
    return characters.length > 0 
      ? characters[Math.floor(Math.random() * characters.length)]
      : null;
  }
  
  /**
   * Get cost for pull type
   */
  static getCost(pullType: 'single' | 'multi'): number {
    return pullType === 'single' ? this.SINGLE_COST : this.MULTI_COST;
  }
  
  /**
   * Calculate pity rates
   */
  static calculatePityRates(pullsSinceEpic: number, pullsSinceLegendary: number) {
    return {
      epic: Math.min(pullsSinceEpic / this.EPIC_PITY, 1),
      legendary: Math.min(pullsSinceLegendary / this.LEGENDARY_PITY, 1),
      nextEpicIn: Math.max(0, this.EPIC_PITY - pullsSinceEpic),
      nextLegendaryIn: Math.max(0, this.LEGENDARY_PITY - pullsSinceLegendary)
    };
  }
  
  /**
   * Get featured characters for current banner
   */
  static async getFeaturedCharacters(): Promise<ContentPartner[]> {
    const allCharacters = await ClientContentAdapter.loadAllContentCharacters();
    
    return allCharacters.filter(char => 
      char.rarity === 'legendary' || 
      char.rarity === 'epic'
    ).slice(0, 6);
  }
}