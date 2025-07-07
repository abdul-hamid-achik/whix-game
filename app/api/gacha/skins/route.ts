import { NextRequest, NextResponse } from 'next/server';
import { skinGachaSystem } from '@/lib/game/skin-gacha';
import { z } from 'zod';

const skinGachaSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
  partnerId: z.string().min(1, 'Partner ID is required'),
  pullType: z.enum(['single', 'multi']).default('single'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = skinGachaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { playerId, partnerId, pullType } = validation.data;
    
    const results = await skinGachaSystem.pullSkinGacha(playerId, partnerId, pullType);

    return NextResponse.json({
      success: true,
      data: {
        results,
        totalCost: pullType === 'single' ? 150 : 1350,
        pullCount: results.length
      }
    });

  } catch (error) {
    console.error('Error pulling skin gacha:', error);
    return NextResponse.json(
      { 
        error: 'Failed to pull skin gacha', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('playerId');
    const partnerId = searchParams.get('partnerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const playerSkins = await skinGachaSystem.getPlayerSkins(playerId, partnerId || undefined);
    const stats = await skinGachaSystem.getSkinGachaStats();

    return NextResponse.json({
      success: true,
      data: {
        playerSkins,
        stats
      }
    });

  } catch (error) {
    console.error('Error getting player skins:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get player skins', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}