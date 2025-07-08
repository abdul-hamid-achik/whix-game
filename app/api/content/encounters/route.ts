import { NextRequest, NextResponse } from 'next/server';
import { loadContentBySlug, loadContentByType } from '@/lib/cms/content-loader';
import { EncounterSchema } from '@/lib/schemas/encounter-schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Load specific encounter
      const content = await loadContentBySlug('encounter' as any, id);
      
      if (!content) {
        return NextResponse.json(
          { error: 'Encounter not found' },
          { status: 404 }
        );
      }
      
      // Validate the encounter data
      try {
        const encounter = EncounterSchema.parse(content.metadata);
        return NextResponse.json(encounter);
      } catch (validationError) {
        console.error('Encounter validation error:', validationError);
        return NextResponse.json(
          { error: 'Invalid encounter data', details: validationError },
          { status: 500 }
        );
      }
    }
    
    // Return all encounters
    const allContent = await loadContentByType('encounter' as any);
    const encounters = allContent
      .map(content => {
        try {
          return EncounterSchema.parse(content.metadata);
        } catch (err) {
          console.error(`Failed to parse encounter ${content.slug}:`, err);
          return null;
        }
      })
      .filter(Boolean);
    
    return NextResponse.json({
      results: encounters,
      total: encounters.length,
    });
    
  } catch (error) {
    console.error('Encounters API error:', error);
    return NextResponse.json(
      { error: 'Failed to load encounters' },
      { status: 500 }
    );
  }
}