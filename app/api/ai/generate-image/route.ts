import { NextRequest, NextResponse } from 'next/server';
import { imageGenerator, ImageGenerationRequest } from '@/lib/ai/image-generator';
import { z } from 'zod';

const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  style: z.enum(['pixel-art', 'cyberpunk-portrait', 'dystopian-background', 'aztec-soviet-style', 'urban-delivery']).optional(),
  size: z.enum(['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024']).optional(),
  count: z.number().min(1).max(4).optional(),
  quality: z.enum(['standard', 'hd']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const imageRequest: ImageGenerationRequest = validation.data;
    const generatedImage = await imageGenerator.generateImage(imageRequest);

    return NextResponse.json({
      success: true,
      data: generatedImage,
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Character portrait generation endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterName, partnerClass, traits, options } = body;

    if (!characterName || !partnerClass || !Array.isArray(traits)) {
      return NextResponse.json(
        { error: 'Missing required fields: characterName, partnerClass, traits' },
        { status: 400 }
      );
    }

    const generatedImage = await imageGenerator.generateCharacterPortrait(
      characterName,
      partnerClass,
      traits,
      options
    );

    return NextResponse.json({
      success: true,
      data: generatedImage,
    });

  } catch (error) {
    console.error('Error generating character portrait:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate character portrait', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}