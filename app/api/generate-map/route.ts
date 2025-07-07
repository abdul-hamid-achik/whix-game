import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMapGenerationService } from '@/lib/services/mapGenerationService';
import { put } from '@vercel/blob';

const MapRequestSchema = z.object({
  type: z.enum(['map', 'background']),
  params: z.union([
    z.object({
      theme: z.string(),
      timeOfDay: z.string(),
      weather: z.string(),
      gridSize: z.object({
        width: z.number(),
        height: z.number()
      }),
      style: z.enum(['pixel_art', 'illustrated'])
    }),
    z.object({
      type: z.string(),
      theme: z.string(),
      timeOfDay: z.string(),
      weather: z.string(),
      details: z.array(z.string()).optional()
    })
  ])
});

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
    
    if (type === 'map' && 'gridSize' in params) {
      imageUrl = await mapService.generateMapImage(params as any);
    } else if (type === 'background' && 'type' in params) {
      imageUrl = await mapService.generateBackgroundImage(params as any);
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