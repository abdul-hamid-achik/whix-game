import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getMapGenerationService,
  MapThemeSchema,
  MapTimeOfDaySchema,
  MapWeatherSchema,
  BackgroundTypeSchema
} from '@/lib/services/mapGenerationService';
import { put } from '@vercel/blob';

const MapImageParamsSchema = z.object({
  theme: MapThemeSchema,
  timeOfDay: MapTimeOfDaySchema,
  weather: MapWeatherSchema,
  gridSize: z.object({
    width: z.number(),
    height: z.number()
  }),
  style: z.enum(['pixel_art', 'illustrated'])
});

const BackgroundImageParamsSchema = z.object({
  type: BackgroundTypeSchema,
  theme: MapThemeSchema,
  timeOfDay: MapTimeOfDaySchema,
  weather: MapWeatherSchema,
  details: z.array(z.string()).optional()
});

const MapRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('map'),
    params: MapImageParamsSchema
  }),
  z.object({
    type: z.literal('background'),
    params: BackgroundImageParamsSchema
  })
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = MapRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { type, params } = validationResult.data;
    const mapService = getMapGenerationService();
    
    let imageUrl: string;
    
    if (type === 'map') {
      imageUrl = await mapService.generateMapImage(params);
    } else if (type === 'background') {
      imageUrl = await mapService.generateBackgroundImage(params);
    } else {
      throw new Error('Invalid generation type');
    }
    
    // Store in Vercel Blob
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    
    const { url: blobUrl } = await put(
      `maps/${type}_${Date.now()}.png`,
      imageBlob,
      { access: 'public' }
    );
    
    return NextResponse.json({
      success: true,
      imageUrl: blobUrl,
      originalUrl: imageUrl
    });
    
  } catch (error) {
    console.error('Error in generate-map API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}