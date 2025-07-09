import { blobStorage } from './blob-storage';
import { 
  CharacterVisualAttributes, 
  generateCharacterVisualAttributes,
  createCharacterImagePrompt,
  generateCharacterSeed
} from '@/lib/game/imageGeneration';
import { Rarity } from '@/lib/game/classes';
import { z } from 'zod';

// Configuration for image generation
const IMAGE_CONFIG = {
  width: 1024, // OpenAI DALL-E 3 supported sizes: 1024x1024, 1024x1792, 1792x1024
  height: 1024,
  model: 'dall-e-3',
  quality: 'standard' as const,
  style: 'natural' as const,
  n: 1
};

// Storage schema for generated images
export const GeneratedCharacterImageSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  url: z.string(),
  thumbnailUrl: z.string().optional(),
  attributes: z.object({
    visual: z.any(), // CharacterVisualAttributesSchema
    rarity: z.string(),
    name: z.string(),
    seed: z.string()
  }),
  metadata: z.object({
    generatedAt: z.string(),
    model: z.string(),
    prompt: z.string(),
    size: z.string()
  }),
  blobUrl: z.string().optional(),
  status: z.enum(['pending', 'generated', 'stored', 'failed'])
});

export type GeneratedCharacterImage = z.infer<typeof GeneratedCharacterImageSchema>;

// Main service class for image generation
export class CharacterImageGenerationService {
  private openaiApiKey: string;
  private blobReadWriteToken: string;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    
    if (!blobToken) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
    }
    
    this.openaiApiKey = apiKey;
    this.blobReadWriteToken = blobToken;
  }
  
  // Generate a new character image
  async generateCharacterImage(
    characterId: string,
    name: string,
    rarity: Rarity,
    customAttributes?: Partial<CharacterVisualAttributes>
  ): Promise<GeneratedCharacterImage> {
    try {
      // Generate visual attributes
      const attributes = {
        ...generateCharacterVisualAttributes(rarity),
        ...customAttributes
      };
      
      const seed = generateCharacterSeed(attributes);
      const prompt = createCharacterImagePrompt(attributes, rarity, name);
      
      // Create initial record
      const imageRecord: GeneratedCharacterImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        characterId,
        url: '', // Will be filled after generation
        attributes: {
          visual: attributes,
          rarity,
          name,
          seed
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          model: IMAGE_CONFIG.model,
          prompt,
          size: `${IMAGE_CONFIG.width}x${IMAGE_CONFIG.height}`
        },
        status: 'pending'
      };
      
      // Generate image with OpenAI
      const imageUrl = await this.generateWithOpenAI(prompt);
      imageRecord.url = imageUrl;
      imageRecord.status = 'generated';
      
      // Store in Vercel Blob
      const blobUrl = await this.storeInBlob(imageUrl, imageRecord.id);
      imageRecord.blobUrl = blobUrl;
      imageRecord.status = 'stored';
      
      // Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(blobUrl);
      imageRecord.thumbnailUrl = thumbnailUrl;
      
      return imageRecord;
      
    } catch (error) {
      console.error('Error generating character image:', error);
      throw new Error(`Failed to generate character image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Generate image using OpenAI DALL-E
  private async generateWithOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: IMAGE_CONFIG.model,
        prompt: `${prompt}. High quality pixel art, clean pixels, retro game aesthetic.`,
        n: IMAGE_CONFIG.n,
        size: `${IMAGE_CONFIG.width}x${IMAGE_CONFIG.height}`,
        quality: IMAGE_CONFIG.quality,
        style: IMAGE_CONFIG.style
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.data[0].url;
  }
  
  // Store image in Vercel Blob storage
  private async storeInBlob(imageUrl: string, imageId: string): Promise<string> {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image');
    }
    
    const imageBlob = await imageResponse.blob();
    
    // Upload to blob storage (Vercel Blob in prod, MinIO in dev)
    const { url } = await blobStorage.put(`characters/${imageId}.png`, imageBlob, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'image/png'
    });
    
    return url;
  }
  
  // Generate a smaller thumbnail version
  private async generateThumbnail(blobUrl: string): Promise<string> {
    // For now, return the same URL
    // In production, you'd use Sharp or similar to create actual thumbnails
    return blobUrl;
  }
  
  // Batch generate multiple characters
  async batchGenerateCharacters(
    count: number,
    rarityWeights?: Record<Rarity, number>
  ): Promise<GeneratedCharacterImage[]> {
    const results: GeneratedCharacterImage[] = [];
    
    // Default rarity weights
    const weights = rarityWeights || {
      common: 50,
      rare: 30,
      epic: 15,
      legendary: 5
    };
    
    // Generate characters
    for (let i = 0; i < count; i++) {
      const rarity = this.selectRarityByWeight(weights);
      const name = this.generateRandomName(rarity);
      
      try {
        const image = await this.generateCharacterImage(
          `char_${Date.now()}_${i}`,
          name,
          rarity
        );
        results.push(image);
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate character ${i}:`, error);
      }
    }
    
    return results;
  }
  
  // Select rarity based on weights
  private selectRarityByWeight(weights: Record<Rarity, number>): Rarity {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return rarity as Rarity;
      }
    }
    
    return 'common';
  }
  
  // Generate random courier names
  private generateRandomName(rarity: Rarity): string {
    const prefixes: Record<Rarity, string[]> = {
      common: ['Rookie', 'Street', 'Quick', 'Swift'],
      rare: ['Elite', 'Pro', 'Express', 'Rapid'],
      epic: ['Master', 'Shadow', 'Ghost', 'Phantom'],
      legendary: ['Legendary', 'Mythical', 'Supreme', 'Ultimate']
    };
    
    const suffixes = [
      'Courier', 'Rider', 'Runner', 'Dasher', 'Sprinter',
      'Wheels', 'Flash', 'Bolt', 'Storm', 'Wind'
    ];
    
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${suffix}`;
  }
}

// Singleton instance
let imageGenerationService: CharacterImageGenerationService | null = null;

export function getImageGenerationService(): CharacterImageGenerationService {
  if (!imageGenerationService) {
    imageGenerationService = new CharacterImageGenerationService();
  }
  return imageGenerationService;
}