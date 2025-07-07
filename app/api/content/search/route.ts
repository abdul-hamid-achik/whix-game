import { NextRequest, NextResponse } from 'next/server';
import { contentManager } from '@/lib/cms/manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type');
    
    let types: string[] | undefined;
    if (type && type !== 'all') {
      types = [type];
    }

    const results = await contentManager.searchContent(query, types);
    
    return NextResponse.json({
      query,
      type,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching content:', error);
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    );
  }
}