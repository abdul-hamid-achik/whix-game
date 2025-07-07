import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getImageGenerationService } from '@/lib/services/imageGenerationService';
import { CharacterRarity } from '@/lib/game/gacha';

// Request validation schema
const GenerateImageRequestSchema = z.object({
  characterId: z.string(),
  name: z.string(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']),
  customAttributes: z.object({
    bodyType: z.enum(['slim', 'average', 'stocky', 'athletic']).optional(),
    skinTone: z.enum(['pale', 'light', 'medium', 'tan', 'dark', 'deep']).optional(),
    hairStyle: z.enum([
      'buzz_cut', 'short_messy', 'medium_wavy', 'long_straight', 
      'dreadlocks', 'mohawk', 'bald', 'ponytail', 'braids', 'afro'
    ]).optional(),
    hairColor: z.enum([
      'black', 'brown', 'blonde', 'red', 'gray', 'white', 
      'blue', 'green', 'purple', 'pink'
    ]).optional(),
    uniform: z.enum([
      'basic_whix', 'worn_whix', 'premium_whix', 'indie_courier',
      'resistance', 'corporate', 'night_rider', 'weather_gear'
    ]).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validationResult = GenerateImageRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { characterId, name, rarity, customAttributes } = validationResult.data;
    
    // Get image generation service
    const imageService = getImageGenerationService();
    
    // Generate the image
    const generatedImage = await imageService.generateCharacterImage(
      characterId,
      name,
      rarity as CharacterRarity,
      customAttributes
    );
    
    return NextResponse.json({
      success: true,
      image: generatedImage
    });
    
  } catch (error) {
    console.error('Error in generate-character-image API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Batch generation endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const BatchRequestSchema = z.object({
      count: z.number().min(1).max(10),
      rarityWeights: z.object({
        common: z.number().optional(),
        rare: z.number().optional(),
        epic: z.number().optional(),
        legendary: z.number().optional(),
        mythic: z.number().optional()
      }).optional()
    });
    
    const validationResult = BatchRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { count, rarityWeights } = validationResult.data;
    
    // Get image generation service
    const imageService = getImageGenerationService();
    
    // Generate batch
    const generatedImages = await imageService.batchGenerateCharacters(
      count,
      rarityWeights as Record<CharacterRarity, number> | undefined
    );
    
    return NextResponse.json({
      success: true,
      images: generatedImages,
      count: generatedImages.length
    });
    
  } catch (error) {
    console.error('Error in batch generate API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate batch', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}