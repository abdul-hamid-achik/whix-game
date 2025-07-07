'use client';

import { useState, useEffect } from 'react';
import { ContentMetadata } from './content-types';
import { ContentFile } from './content-loader';

interface UseContentOptions {
  type: ContentMetadata['type'];
  slug?: string;
  query?: string;
  limit?: number;
}

interface UseContentResult<T extends ContentMetadata> {
  content: ContentFile<T>[] | ContentFile<T> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useContent<T extends ContentMetadata>({
  type,
  slug,
  query,
  limit,
}: UseContentOptions): UseContentResult<T> {
  const [content, setContent] = useState<ContentFile<T>[] | ContentFile<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (slug) params.append('slug', slug);
      if (query) params.append('q', query);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/content/${type}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      
      if (slug) {
        setContent(data as ContentFile<T>);
      } else {
        setContent(data.results as ContentFile<T>[]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [type, slug, query, limit]);

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
  };
}

// Type-specific hooks for better DX
export function useCharacter(slug: string) {
  return useContent({ type: 'character', slug });
}

export function useCharacters(query?: string, limit?: number) {
  return useContent({ type: 'character', query, limit });
}

export function useLevel(slug: string) {
  return useContent({ type: 'level', slug });
}

export function useLevels(query?: string, limit?: number) {
  return useContent({ type: 'level', query, limit });
}

export function useChapter(slug: string) {
  return useContent({ type: 'chapter', slug });
}

export function useChapters(query?: string, limit?: number) {
  return useContent({ type: 'chapter', query, limit });
}

export function useMap(slug: string) {
  return useContent({ type: 'map', slug });
}

export function useMaps(query?: string, limit?: number) {
  return useContent({ type: 'map', query, limit });
}

export function useItem(slug: string) {
  return useContent({ type: 'item', slug });
}

export function useItems(query?: string, limit?: number) {
  return useContent({ type: 'item', query, limit });
}

export function useTrait(slug: string) {
  return useContent({ type: 'trait', slug });
}

export function useTraits(query?: string, limit?: number) {
  return useContent({ type: 'trait', query, limit });
}

export function useDialogue(slug: string) {
  return useContent({ type: 'dialogue', slug });
}

export function useDialogues(query?: string, limit?: number) {
  return useContent({ type: 'dialogue', query, limit });
}