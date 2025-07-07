import { NextResponse } from 'next/server';
import { contentManager } from '@/lib/cms/manager';

export async function GET() {
  try {
    const stats = await contentManager.getContentStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting content stats:', error);
    return NextResponse.json(
      { error: 'Failed to get content statistics' },
      { status: 500 }
    );
  }
}