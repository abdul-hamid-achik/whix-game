import { NextResponse } from 'next/server';
import { contentManager } from '@/lib/cms/manager';

export async function GET() {
  try {
    const validation = await contentManager.validateContent();
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating content:', error);
    return NextResponse.json(
      { error: 'Failed to validate content' },
      { status: 500 }
    );
  }
}