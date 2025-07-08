import { NextRequest, NextResponse } from 'next/server';
import {
  loadContentByType,
  loadContentBySlug,
  searchContent,
} from '@/lib/cms/content-loader';
import { ContentMetadata } from '@/lib/cms/content-types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const query = searchParams.get('q');
    const limit = searchParams.get('limit');
    const resolvedParams = await params;
    const contentType = resolvedParams.type as ContentMetadata['type'];

    // Validate content type
    const validTypes = ['character', 'level', 'chapter', 'map', 'item', 'trait', 'dialogue', 'ui-content'];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // If searching across all content
    if (query) {
      const results = await searchContent(query, [contentType]);
      return NextResponse.json({
        results: limit ? results.slice(0, parseInt(limit)) : results,
        total: results.length,
      });
    }

    // If requesting specific content by slug
    if (slug) {
      const content = await loadContentBySlug(contentType, slug);
      if (!content) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(content);
    }

    // Return all content of this type
    const allContent = await loadContentByType(contentType);
    return NextResponse.json({
      results: limit ? allContent.slice(0, parseInt(limit)) : allContent,
      total: allContent.length,
    });

  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}