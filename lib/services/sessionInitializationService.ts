import { db } from '@/lib/db';
import { players, partners } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePartner } from '@/lib/game/partnerGenerator';
import { Rarity } from '@/lib/game/classes';
import { getImageGenerationService } from './imageGenerationService';

interface SessionInitResult {
  playerId: string;
  charactersGenerated: number;
  imagesGenerated: number;
  skinsGenerated: number;
}

export class SessionInitializationService {
  private imageService = getImageGenerationService();
  
  // Minimum pool sizes per rarity
  private readonly MIN_POOL_SIZES: Record<Rarity, number> = {
    common: 10,
    rare: 5,
    epic: 3,
    legendary: 2
  };
  
  // Initial characters for new players
  private readonly STARTER_CHARACTERS = 3;
  
  async initializeSession(userId: string): Promise<SessionInitResult> {
    const result: SessionInitResult = {
      playerId: '',
      charactersGenerated: 0,
      imagesGenerated: 0,
      skinsGenerated: 0
    };
    
    // Check if player exists
    const existingPlayer = await db.select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);
    
    if (existingPlayer.length === 0) {
      // Create new player
      const newPlayer = await this.createNewPlayer(userId);
      result.playerId = newPlayer.id;
      
      // Generate starter characters
      result.charactersGenerated = await this.generateStarterCharacters(newPlayer.id);
    } else {
      result.playerId = existingPlayer[0].id.toString();
    }
    
    // Check image pools and generate if needed
    const imageGeneration = await this.ensureImagePools();
    result.imagesGenerated = imageGeneration;
    
    // Generate starter skins
    result.skinsGenerated = await this.generateStarterSkins(result.playerId);
    
    return result;
  }
  
  private async createNewPlayer(userId: string) {
    const [newPlayer] = await db.insert(players).values({
      userId,
      level: 1,
      experience: 0,
      credits: 1000,
      resonancePoints: 0,
      currentTips: 1000,
      totalTipsEarned: 0,
      companyStars: 0,
      tipCutPercentage: 75,
      storyProgress: {},
      unlockedChapters: [1],
      stats: {
        missionsCompleted: 0,
        partnersRecruited: 0,
        traitsmastered: 0,
      }
    }).returning();
    
    return newPlayer;
  }
  
  private async generateStarterCharacters(playerId: string): Promise<number> {
    const characters = [];
    
    // Generate one guaranteed rare character
    const rareCharacter = generatePartner('rare');
    characters.push({
      ...rareCharacter,
      playerId,
      isStarter: true,
      level: 1,
      experience: 0,
      bondLevel: 0,
      bondExperience: 0,
      missions: 0,
      isActive: characters.length === 0, // First character is active
      slot: characters.length < 3 ? characters.length : null,
      stats: {
        stamina: 50 + Math.floor(Math.random() * 20),
        focus: 50 + Math.floor(Math.random() * 20),
        perception: 50 + Math.floor(Math.random() * 20),
        logic: 50 + Math.floor(Math.random() * 20),
        stress: 0
      }
    });
    
    // Generate two common characters
    for (let i = 0; i < 2; i++) {
      const character = generatePartner('common');
      characters.push({
        ...character,
        playerId,
        isStarter: true,
        level: 1,
        experience: 0,
        bondLevel: 0,
        bondExperience: 0,
        missions: 0,
        isActive: false,
        slot: characters.length < 3 ? characters.length : null,
        stats: {
          stamina: 40 + Math.floor(Math.random() * 20),
          focus: 40 + Math.floor(Math.random() * 20),
          perception: 40 + Math.floor(Math.random() * 20),
          logic: 40 + Math.floor(Math.random() * 20),
          stress: 0
        }
      });
    }
    
    // Insert characters
    await db.insert(partners).values(characters);
    
    return characters.length;
  }
  
  private async ensureImagePools(): Promise<number> {
    const totalGenerated = 0;
    
    // This would check the image pool store and generate if needed
    // For now, we'll skip actual generation to avoid API costs
    // In production, this would:
    // 1. Check current pool sizes
    // 2. Generate images for rarities below minimum
    // 3. Return total generated
    
    return totalGenerated;
  }
  
  private async generateStarterSkins(_playerId: string): Promise<number> {
    // For now, return 0 since we haven't implemented the skin system yet
    // TODO: Implement starter skin generation when skin system is ready
    return 0;
  }
  
  // Convert guest to registered user
  async convertGuestToRegistered(
    _guestId: string,
    _email: string,
    _password: string,
    _name: string
  ): Promise<boolean> {
    try {
      // This would be called from the auth system
      // Updates the user record and preserves all game data
      return true;
    } catch (error) {
      console.error('Error converting guest:', error);
      return false;
    }
  }
}

// Singleton instance
let sessionService: SessionInitializationService | null = null;

export function getSessionInitializationService(): SessionInitializationService {
  if (!sessionService) {
    sessionService = new SessionInitializationService();
  }
  return sessionService;
}