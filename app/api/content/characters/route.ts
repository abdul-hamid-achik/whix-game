import { NextResponse } from 'next/server';
import { loadAllCharacters } from '@/lib/cms/content-loader';

export async function GET() {
  try {
    const characters = await loadAllCharacters();
    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error loading characters:', error);
    return NextResponse.json(
      { error: 'Failed to load characters' },
      { status: 500 }
    );
  }
}