import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import {
  ContentMetadata,
  CharacterMetadata,
  TraitMetadata,
  LevelMetadata,
  ItemMetadata,
  MapMetadata,
  ChapterMetadata
} from './content-types';
import {
  gameDataSchema,
  characterMetadataSchema,
  levelMetadataSchema,
  itemMetadataSchema,
  mapMetadataSchema,
  chapterMetadataSchema,
  traitMetadataSchema,
  dialogMetadataSchema
} from './content-schemas';
import { z } from 'zod';

export class ContentManager {
  private contentDir: string;
  private cache: Map<string, any> = new Map();

  constructor(contentDir: string = 'content') {
    this.contentDir = path.join(process.cwd(), contentDir);
  }

  /**
   * Get all content of a specific type
   */
  async getContentByType<T extends ContentMetadata>(type: string): Promise<T[]> {
    const cacheKey = `type:${type}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const typeDir = path.join(this.contentDir, type);
      const files = await fs.readdir(typeDir);
      const markdownFiles = files.filter(file => file.endsWith('.md'));

      const content = await Promise.all(
        markdownFiles.map(async (file) => {
          const filePath = path.join(typeDir, file);
          const fileContent = await fs.readFile(filePath, 'utf8');
          const { data, content: markdownContent } = matter(fileContent);
          
          // Convert markdown to HTML for rich content
          const processedContent = await remark()
            .use(html)
            .process(markdownContent);
          
          // Parse based on content type
          const parsed = this.parseContentByType(type, {
            ...data,
            content: processedContent.toString(),
            slug: file.replace('.md', ''),
            filePath: filePath
          });
          return parsed as T;
        })
      );

      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      console.error(`Error loading content type ${type}:`, error);
      return [];
    }
  }

  /**
   * Get specific content by ID and type
   */
  async getContent<T extends ContentMetadata>(type: string, id: string): Promise<T | null> {
    const cacheKey = `content:${type}:${id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const filePath = path.join(this.contentDir, type, `${id}.md`);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data, content: markdownContent } = matter(fileContent);
      
      const processedContent = await remark()
        .use(html)
        .process(markdownContent);
      
      const parsed = this.parseContentByType(type, {
        ...data,
        content: processedContent.toString(),
        slug: id,
        filePath: filePath
      });
      const content = parsed as T;

      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      console.error(`Error loading content ${type}/${id}:`, error);
      return null;
    }
  }

  /**
   * Get all characters
   */
  async getAllCharacters(): Promise<CharacterMetadata[]> {
    return this.getContentByType<CharacterMetadata>('characters');
  }

  /**
   * Get all traits
   */
  async getAllTraits(): Promise<TraitMetadata[]> {
    return this.getContentByType<TraitMetadata>('traits');
  }

  /**
   * Get all levels
   */
  async getAllLevels(): Promise<LevelMetadata[]> {
    return this.getContentByType<LevelMetadata>('levels');
  }

  /**
   * Get all items
   */
  async getAllItems(): Promise<ItemMetadata[]> {
    return this.getContentByType<ItemMetadata>('items');
  }

  /**
   * Get all maps
   */
  async getAllMaps(): Promise<MapMetadata[]> {
    return this.getContentByType<MapMetadata>('maps');
  }

  /**
   * Get all chapters
   */
  async getAllChapters(): Promise<ChapterMetadata[]> {
    return this.getContentByType<ChapterMetadata>('chapters');
  }

  /**
   * Get traits by category
   */
  async getTraitsByCategory(category: string): Promise<TraitMetadata[]> {
    const traits = await this.getAllTraits();
    return traits.filter(trait => trait.category === category);
  }

  /**
   * Get characters by class
   */
  async getCharactersByClass(characterClass: string): Promise<CharacterMetadata[]> {
    const characters = await this.getAllCharacters();
    return characters.filter(char => char.class === characterClass);
  }

  /**
   * Get levels by difficulty
   */
  async getLevelsByDifficulty(difficulty: string): Promise<LevelMetadata[]> {
    const levels = await this.getAllLevels();
    return levels.filter(level => level.difficulty === difficulty);
  }

  /**
   * Get items by rarity
   */
  async getItemsByRarity(rarity: string): Promise<ItemMetadata[]> {
    const items = await this.getAllItems();
    return items.filter(item => item.rarity === rarity);
  }

  /**
   * Search content across all types
   */
  async searchContent(query: string, types?: string[]): Promise<ContentMetadata[]> {
    const searchTypes = types || ['characters', 'traits', 'levels', 'items', 'maps', 'chapters'];
    const results: ContentMetadata[] = [];

    for (const type of searchTypes) {
      const content = await this.getContentByType(type);
      const matches = content.filter(item =>
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        ('name' in item && item.name?.toLowerCase().includes(query.toLowerCase()))
      );
      results.push(...matches);
    }

    return results;
  }

  /**
   * Get content metadata for game integration
   */
  async getGameData() {
    const [characters, traits, levels, items, maps, chapters] = await Promise.all([
      this.getAllCharacters(),
      this.getAllTraits(),
      this.getAllLevels(),
      this.getAllItems(),
      this.getAllMaps(),
      this.getAllChapters()
    ]);

    const gameData = {
      characters: characters.map(char => ({
        id: char.id,
        name: char.name,
        class: char.class,
        rarity: char.stats?.level ? this.getLevelBasedRarity(char.stats.level) : 'common',
        traits: char.traits || [],
        level: char.stats?.level || 1,
        stats: char.stats || {},
        abilities: char.abilities || []
      })),
      traits: traits.map(trait => ({
        id: trait.id,
        name: trait.name,
        category: trait.category,
        rarity: trait.rarity,
        statBonus: trait.statBonus || {},
        abilityUnlocks: trait.abilityUnlocks || []
      })),
      levels: levels.map(level => ({
        id: level.id,
        name: level.title,
        difficulty: level.difficulty,
        unlockLevel: level.requirements?.level || 1,
        rewards: level.rewards || { tips: 0, experience: 0 },
        hazards: level.hazards || [],
        opportunities: [],
        roguelikeElements: level.roguelikeElements || {}
      })),
      items: items.map(item => ({
        id: item.id,
        name: item.title,
        category: item.category,
        rarity: item.rarity,
        value: item.value,
        stats: {},
        effects: item.effects || [],
        traitSynergies: []
      })),
      maps: maps.map(map => ({
        id: map.id,
        name: map.title,
        regions: [],
        scale: 1,
        landmarks: [],
        hiddenLocations: []
      })),
      chapters: chapters.map(chapter => ({
        id: chapter.id,
        name: chapter.title,
        unlockLevel: 1,
        difficulty: 'normal',
        rewards: [],
        roguelikeElements: []
      }))
    };

    // Validate the game data structure with Zod
    try {
      return gameDataSchema.parse(gameData);
    } catch (error) {
      console.error('Game data validation error:', error);
      return gameData;
    }
  }

  private getLevelBasedRarity(level: number): string {
    if (level >= 20) return 'legendary';
    if (level >= 15) return 'epic';
    if (level >= 10) return 'rare';
    return 'common';
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get content statistics
   */
  async getContentStats() {
    const [characters, traits, levels, items, maps, chapters] = await Promise.all([
      this.getAllCharacters(),
      this.getAllTraits(),
      this.getAllLevels(),
      this.getAllItems(),
      this.getAllMaps(),
      this.getAllChapters()
    ]);

    return {
      totalContent: characters.length + traits.length + levels.length + items.length + maps.length + chapters.length,
      byType: {
        characters: characters.length,
        traits: traits.length,
        levels: levels.length,
        items: items.length,
        maps: maps.length,
        chapters: chapters.length
      },
      charactersByClass: this.groupBy(characters, 'class'),
      traitsByCategory: this.groupBy(traits, 'category'),
      levelsByDifficulty: this.groupBy(levels, 'difficulty'),
      itemsByRarity: this.groupBy(items, 'rarity')
    };
  }

  /**
   * Validate content structure
   */
  async validateContent(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const gameData = await this.getGameData();
      
      // Check for duplicate IDs
      const allIds = [
        ...gameData.characters.map(c => c.id),
        ...gameData.traits.map(t => t.id),
        ...gameData.levels.map(l => l.id),
        ...gameData.items.map(i => i.id),
        ...gameData.maps.map(m => m.id),
        ...gameData.chapters.map(c => c.id)
      ];
      
      const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`);
      }

      // Validate trait references in characters
      const traitIds = new Set(gameData.traits.map(t => t.id));
      for (const character of gameData.characters) {
        if (character.traits) {
          for (const traitId of character.traits) {
            if (!traitIds.has(traitId)) {
              errors.push(`Character ${character.id} references unknown trait: ${traitId}`);
            }
          }
        }
      }

      // Validate class references
      const validClasses = ['courier', 'analyst', 'negotiator', 'specialist', 'investigator'];
      for (const character of gameData.characters) {
        if (character.class && !validClasses.includes(character.class)) {
          errors.push(`Character ${character.id} has invalid class: ${character.class}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Parse content based on type using Zod schemas
   */
  private parseContentByType(type: string, data: any) {
    const schemaMap: Record<string, z.ZodSchema> = {
      'characters': characterMetadataSchema,
      'levels': levelMetadataSchema,
      'items': itemMetadataSchema,
      'maps': mapMetadataSchema,
      'chapters': chapterMetadataSchema,
      'traits': traitMetadataSchema,
      'dialogues': dialogMetadataSchema,
      'dialogue': dialogMetadataSchema,
    };

    const schema = schemaMap[type];
    if (!schema) {
      console.warn(`No schema found for content type: ${type}`);
      return data;
    }

    try {
      // Parse only the metadata part, keep content/slug/filePath as is
      const { content, slug, filePath, ...metadata } = data;
      const parsedMetadata = schema.parse({ ...metadata, type: type.replace(/s$/, '') });
      
      return {
        ...parsedMetadata,
        content,
        slug,
        filePath
      };
    } catch (error) {
      console.error(`Error parsing ${type} content:`, error);
      // Return original data if parsing fails
      return data;
    }
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Export singleton instance
export const contentManager = new ContentManager();

// Export utility functions for Next.js API routes
export async function getStaticContentData() {
  return contentManager.getGameData();
}

export async function getContentByType<T extends ContentMetadata>(type: string): Promise<T[]> {
  return contentManager.getContentByType<T>(type);
}

export async function getContentById<T extends ContentMetadata>(type: string, id: string): Promise<T | null> {
  return contentManager.getContent<T>(type, id);
}