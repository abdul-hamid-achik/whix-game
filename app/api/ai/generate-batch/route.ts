import { NextRequest, NextResponse } from 'next/server';
import { imageGenerator } from '@/lib/ai/image-generator';
import { z } from 'zod';

const generateBatchSchema = z.object({
  type: z.enum(['character-pack', 'level-assets', 'ui-elements']),
  data: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = generateBatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { type, data } = validation.data;

    switch (type) {
      case 'character-pack':
        const { characterName, partnerClass, traits } = data;
        if (!characterName || !partnerClass || !Array.isArray(traits)) {
          return NextResponse.json(
            { error: 'Missing required fields for character pack' },
            { status: 400 }
          );
        }

        const characterPack = await imageGenerator.generateCharacterAssetPack(
          characterName,
          partnerClass,
          traits
        );

        return NextResponse.json({
          success: true,
          data: characterPack,
        });

      case 'level-assets':
        const { levelName, environment, difficulty, assetTypes } = data;
        if (!levelName || !environment || !assetTypes) {
          return NextResponse.json(
            { error: 'Missing required fields for level assets' },
            { status: 400 }
          );
        }

        const levelAssets = await Promise.all(
          assetTypes.map(async (assetType: string) => {
            switch (assetType) {
              case 'background':
                return imageGenerator.generateLevelBackground(levelName, environment, difficulty);
              case 'tile':
                return imageGenerator.generateBattlefieldTile('grass', environment);
              default:
                return imageGenerator.generateImage({
                  prompt: `${levelName} ${assetType}, ${environment} environment`,
                  style: 'pixel-art' as const,
                });
            }
          })
        );

        return NextResponse.json({
          success: true,
          data: levelAssets,
        });

      case 'ui-elements':
        const { elements, theme } = data;
        if (!Array.isArray(elements) || !theme) {
          return NextResponse.json(
            { error: 'Missing required fields for UI elements' },
            { status: 400 }
          );
        }

        const uiElements = await Promise.all(
          elements.map((element: string) => 
            imageGenerator.generateUIElement(element, theme)
          )
        );

        return NextResponse.json({
          success: true,
          data: uiElements,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid batch type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error generating batch images:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate batch images', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}