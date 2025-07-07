import { NextRequest, NextResponse } from 'next/server';
import { skinGachaSystem } from '@/lib/game/skin-gacha';
import { z } from 'zod';

const equipSkinSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
  playerSkinId: z.string().min(1, 'Player skin ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = equipSkinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { playerId, playerSkinId } = validation.data;
    
    const success = await skinGachaSystem.equipSkin(playerId, playerSkinId);

    return NextResponse.json({
      success,
      data: {
        equipped: success,
        skinId: playerSkinId
      }
    });

  } catch (error) {
    console.error('Error equipping skin:', error);
    return NextResponse.json(
      { 
        error: 'Failed to equip skin', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}