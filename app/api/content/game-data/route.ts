import { NextResponse } from 'next/server';
import { contentManager } from '@/lib/cms/manager';

export async function GET() {
  try {
    const gameData = await contentManager.getGameData();
    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Error getting game data:', error);
    return NextResponse.json(
      { error: 'Failed to get game data' },
      { status: 500 }
    );
  }
}