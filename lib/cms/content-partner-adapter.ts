import { CharacterMetadata } from './content-types';
import { loadAllCharacters, loadCharacter } from './content-loader';
import { GeneratedPartner } from '../game/partnerGenerator';
import { nanoid } from 'nanoid';
import { PartnerClassSchema, NeurodivergentTraitSchema } from '../game/classes';

export interface ContentPartner extends GeneratedPartner {
  contentId: string;
  isContentBased: true;
  unlockCondition?: string;
  voiceStyle?: string;
  relationships: Record<string, number>;
  backstory: string;
}

/**
 * Converts content/characters/ to partner format for game systems
 */
export class ContentPartnerAdapter {
  private static characterCache = new Map<string, CharacterMetadata>();
  
  /**
   * Load all available characters from content directory
   */
  static async loadAllContentCharacters(): Promise<ContentPartner[]> {
    try {
      const characters = await loadAllCharacters();
      return characters
        .filter(char => char.metadata.published && char.metadata.role === 'partner')
        .map(char => this.convertToPartner(char.metadata, char.content));
    } catch (error) {
      console.error('Failed to load content characters:', error);
      return [];
    }
  }
  
  /**
   * Load specific character by content ID
   */
  static async loadCharacter(contentId: string): Promise<ContentPartner | null> {
    try {
      const character = await loadCharacter(contentId);
      if (!character || !character.metadata.published) {
        return null;
      }
      
      return this.convertToPartner(character.metadata, character.content);
    } catch (error) {
      console.error(`Failed to load character ${contentId}:`, error);
      return null;
    }
  }
  
  /**
   * Convert content character to partner format
   */
  private static convertToPartner(metadata: CharacterMetadata, content: string): ContentPartner {
    // Extract rarity from traits/class or default logic
    const rarity = this.determineRarity(metadata);
    
    // Validate and parse class
    const partnerClass = PartnerClassSchema.safeParse(metadata.class || 'courier');
    const validClass = partnerClass.success ? partnerClass.data : 'courier';
    
    // Validate and parse traits with proper type narrowing
    const getPrimaryTrait = () => {
      if (!metadata.traits?.[0]) return 'hyperfocus' as const;
      const result = NeurodivergentTraitSchema.safeParse(metadata.traits[0]);
      return result.success ? result.data : 'hyperfocus' as const;
    };
    
    const getSecondaryTrait = () => {
      if (!metadata.traits?.[1]) return undefined;
      const result = NeurodivergentTraitSchema.safeParse(metadata.traits[1]);
      return result.success ? result.data : undefined;
    };
    
    const getTertiaryTrait = () => {
      if (!metadata.traits?.[2]) return undefined;
      const result = NeurodivergentTraitSchema.safeParse(metadata.traits[2]);
      return result.success ? result.data : undefined;
    };
    
    return {
      id: nanoid(), // Generate unique ID for this partner instance
      contentId: metadata.id,
      name: metadata.name,
      class: validClass,
      primaryTrait: getPrimaryTrait(),
      secondaryTrait: getSecondaryTrait(),
      tertiaryTrait: getTertiaryTrait(),
      level: 1,
      rarity,
      stats: this.generateDefaultStats(validClass, rarity),
      personality: {
        traits: this.extractPersonalityTraits(content),
        likes: this.extractLikes(content),
        dislikes: this.extractDislikes(content), 
        backstory: this.extractBackstory(content)
      },
      isContentBased: true,
      unlockCondition: metadata.unlockCondition,
      voiceStyle: metadata.voiceStyle,
      relationships: metadata.relationships || {},
      backstory: this.extractBackstory(content)
    };
  }
  
  /**
   * Determine rarity based on character importance/traits
   */
  private static determineRarity(metadata: CharacterMetadata): 'common' | 'rare' | 'epic' | 'legendary' {
    // Main story characters are legendary
    if (metadata.tags?.includes('main_character')) {
      return 'legendary';
    }
    
    // Characters with unique traits or story importance
    if (metadata.tags?.includes('unique') || (metadata.traits?.length || 0) >= 3) {
      return 'epic';
    }
    
    // Secondary characters with interesting abilities
    if ((metadata.traits?.length || 0) >= 2) {
      return 'rare';
    }
    
    return 'common';
  }
  
  /**
   * Generate default stats based on class and rarity
   */
  private static generateDefaultStats(partnerClass: string, rarity: string) {
    const baseStats = {
      focus: 50,
      perception: 50,
      social: 50,
      logic: 50,
      stamina: 50
    };
    
    // Class modifiers
    const classModifiers: Record<string, Partial<typeof baseStats>> = {
      courier: { stamina: 20, focus: 10 },
      analyst: { logic: 20, perception: 10 },
      negotiator: { social: 20, perception: 10 },
      specialist: { focus: 15, logic: 15 },
      investigator: { perception: 20, logic: 10 }
    };
    
    // Rarity multipliers
    const rarityMultiplier = {
      common: 1,
      rare: 1.2,
      epic: 1.4,
      legendary: 1.6
    }[rarity] || 1;
    
    const modifiers = classModifiers[partnerClass] || {};
    
    return Object.entries(baseStats).reduce((stats, [key, value]) => {
      const modifier = modifiers[key as keyof typeof baseStats] || 0;
      stats[key as keyof typeof baseStats] = Math.round((value + modifier) * rarityMultiplier);
      return stats;
    }, {} as typeof baseStats);
  }
  
  /**
   * Extract personality traits from content
   */
  private static extractPersonalityTraits(content: string): string[] {
    // Simple extraction - look for personality markers
    const traits = [];
    if (content.includes('determined') || content.includes('determination')) traits.push('determined');
    if (content.includes('creative') || content.includes('creativity')) traits.push('creative');
    if (content.includes('analytical') || content.includes('analysis')) traits.push('analytical');
    if (content.includes('empathetic') || content.includes('empathy')) traits.push('empathetic');
    if (content.includes('resourceful')) traits.push('resourceful');
    if (content.includes('rebellious') || content.includes('rebel')) traits.push('rebellious');
    
    return traits.length > 0 ? traits.slice(0, 3) : ['determined', 'resourceful', 'loyal'];
  }
  
  /**
   * Extract likes from content
   */
  private static extractLikes(content: string): string[] {
    const likes = [];
    if (content.includes('puzzle') || content.includes('pattern')) likes.push('solving puzzles');
    if (content.includes('help') || content.includes('support')) likes.push('helping others');
    if (content.includes('justice') || content.includes('fair')) likes.push('social justice');
    if (content.includes('system') || content.includes('organize')) likes.push('organizing systems');
    if (content.includes('efficient')) likes.push('efficiency');
    
    return likes.length > 0 ? likes.slice(0, 3) : ['finding patterns', 'helping partners', 'fighting injustice'];
  }
  
  /**
   * Extract dislikes from content
   */
  private static extractDislikes(content: string): string[] {
    const dislikes = ['corporate exploitation']; // Always include this
    if (content.includes('noise') || content.includes('loud')) dislikes.push('loud noises');
    if (content.includes('unfair') || content.includes('injustice')) dislikes.push('unfair treatment');
    if (content.includes('rush') || content.includes('pressure')) dislikes.push('being rushed');
    if (content.includes('lies') || content.includes('dishonest')) dislikes.push('dishonesty');
    
    return dislikes.slice(0, 3);
  }
  
  /**
   * Extract backstory from content
   */
  private static extractBackstory(content: string): string {
    // Look for ## Background or ## Backstory sections
    const backgroundMatch = content.match(/## (?:Background|Backstory)\s*\n\n([\s\S]*?)(?=\n\n##|\n\n$|$)/);
    if (backgroundMatch) {
      return backgroundMatch[1].trim();
    }
    
    // Fallback: take first paragraph
    const firstParagraph = content.split('\n\n')[0];
    return firstParagraph || 'A mysterious courier with hidden depths.';
  }
  
  /**
   * Get characters available for recruitment based on story progress
   */
  static async getAvailableForRecruitment(
    storyProgress: string[], 
    unlockedCharacters: string[],
    currentLevel: number
  ): Promise<ContentPartner[]> {
    const allCharacters = await this.loadAllContentCharacters();
    
    return allCharacters.filter(character => {
      // Skip if already unlocked
      if (unlockedCharacters.includes(character.contentId)) {
        return false;
      }
      
      // Check unlock conditions
      if (character.unlockCondition) {
        return this.checkUnlockCondition(character.unlockCondition, storyProgress, currentLevel);
      }
      
      // Default: available for recruitment
      return true;
    });
  }
  
  /**
   * Check if unlock condition is met
   */
  private static checkUnlockCondition(
    condition: string, 
    storyProgress: string[], 
    currentLevel: number
  ): boolean {
    // Parse condition strings like "level >= 5" or "chapter >= chapter-2"
    if (condition.includes('level')) {
      const levelMatch = condition.match(/level\s*>=?\s*(\d+)/);
      if (levelMatch) {
        return currentLevel >= parseInt(levelMatch[1]);
      }
    }
    
    if (condition.includes('chapter')) {
      const chapterMatch = condition.match(/chapter\s*>=?\s*(chapter-\d+)/);
      if (chapterMatch) {
        return storyProgress.includes(chapterMatch[1]);
      }
    }
    
    // Default: condition not met
    return false;
  }
  
  /**
   * Get character pool for gacha system with rarity weights
   */
  static async getGachaPool(): Promise<{
    characters: ContentPartner[];
    rarityWeights: Record<string, number>;
  }> {
    const characters = await this.loadAllContentCharacters();
    
    // Calculate rarity distribution
    const rarityWeights = {
      common: 60,
      rare: 25,
      epic: 12,
      legendary: 3
    };
    
    return { characters, rarityWeights };
  }
  
  /**
   * Convert ContentPartner to StoredPartner format for partner store
   */
  static convertToStoredPartner(contentPartner: ContentPartner): GeneratedPartner & {
    contentId?: string;
    isContentBased?: boolean;
    unlockCondition?: string;
    voiceStyle?: string;
    relationships?: Record<string, number>;
    backstory?: string;
  } {
    return {
      ...contentPartner,
      contentId: contentPartner.contentId,
      isContentBased: true,
      unlockCondition: contentPartner.unlockCondition,
      voiceStyle: contentPartner.voiceStyle,
      relationships: contentPartner.relationships,
      backstory: contentPartner.backstory
    };
  }
}