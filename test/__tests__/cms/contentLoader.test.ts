import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import matter from 'gray-matter';

// Mock modules at the top
vi.mock('fs');
vi.mock('gray-matter');

import {
  loadCharacter,
  loadAllCharacters,
  loadLevel,
  loadAllLevels,
  loadItem,
  loadAllItems,
  loadChapter,
  loadAllChapters,
  loadTrait,
  loadAllTraits,
  loadDialogue,
  loadAllDialogues
} from '@/lib/cms/content-loader';
import { 
  characterMetadataSchema,
  levelMetadataSchema,
  itemMetadataSchema,
  mapMetadataSchema,
  chapterMetadataSchema,
  traitMetadataSchema,
  dialogMetadataSchema
} from '@/lib/cms/content-schemas';

describe('ContentLoader - Polanco Theme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(fs.promises).readdir = vi.fn();
    vi.mocked(fs.promises).readFile = vi.fn();
    vi.mocked(fs.promises).access = vi.fn();
    vi.mocked(fs.promises).stat = vi.fn();
    vi.mocked(fs).existsSync = vi.fn().mockReturnValue(true);
    vi.mocked(fs).readFileSync = vi.fn().mockReturnValue('[]');
    vi.mocked(fs).readdirSync = vi.fn().mockReturnValue([]);
    vi.mocked(fs).statSync = vi.fn().mockReturnValue({ isDirectory: () => false } as any);
  });

  describe('Character Loading with Zod Validation', () => {
    it('should load and validate Polanco courier character', async () => {
      const mockCharacterContent = {
        data: {
          id: 'miguel-courier',
          type: 'character',
          title: 'Miguel Rodriguez - WHIX Courier',
          description: 'Veteran WHIX courier navigating Polanco dystopia',
          name: 'Miguel Rodriguez',
          role: 'protagonist',
          class: 'courier',
          traits: ['hyperfocus', 'pattern_recognition'],
          backStory: 'Former tech worker forced into gig economy after algorithmic layoffs',
          stats: {
            level: 1,
            health: 100,
            speed: 60,
            efficiency: 75,
            humanity: 50
          },
          relationships: {},
          published: true
        },
        content: 'Character story content...'
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['miguel-courier.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock file content'));
      vi.mocked(matter).mockReturnValue(mockCharacterContent as any);

      const character = await loadCharacter('miguel-courier');

      expect(character).toBeDefined();
      expect(character?.name).toBe('Miguel Rodriguez');
      expect(character?.class).toBe('courier');
      expect(character?.traits).toContain('hyperfocus');
      
      // Verify Zod schema validation was applied
      expect(() => characterMetadataSchema.parse(character)).not.toThrow();
    });

    it('should reject character with invalid medieval theme', async () => {
      const mockInvalidCharacter = {
        data: {
          id: 'invalid-knight',
          type: 'character',
          title: 'Sir Lancelot',
          description: 'Medieval knight - wrong theme!',
          name: 'Sir Lancelot', // Wrong theme!
          role: 'protagonist',
          class: 'knight', // Invalid class
          traits: ['swordsmanship'], // Invalid trait
          stats: {
            level: 1,
            health: 100,
            speed: 50,
            efficiency: 50,
            humanity: 50
          },
          published: true
        },
        content: 'Medieval content...'
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['invalid-knight.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock file content'));
      vi.mocked(matter).mockReturnValue(mockInvalidCharacter as any);

      const character = await loadCharacter('invalid-knight');
      
      // Should return null due to validation failure
      expect(character).toBeNull();
    });
  });

  describe('Level Loading with Zod Validation', () => {
    it('should load and validate Polanco district level', async () => {
      const mockLevelContent = {
        data: {
          id: 'polanco-central',
          type: 'level',
          title: 'Polanco Central District',
          description: 'Heart of the gig economy dystopia',
          difficulty: 'normal',
          missionType: 'standard_delivery',
          zone: 'downtown',
          rewards: {
            tips: 500,
            experience: 100,
            items: ['enhanced-scanner']
          },
          hazards: ['surveillance_drones', 'corporate_security'],
          requirements: {
            level: 5
          },
          published: true
        },
        content: 'Level narrative...'
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['polanco-central.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock file content'));
      vi.mocked(matter).mockReturnValue(mockLevelContent as any);

      const level = await loadLevel('polanco-central');

      expect(level).toBeDefined();
      expect(level?.name).toBe('Polanco Central District');
      expect(level?.enemies).toContain('corporate-enforcer');
      expect(level?.enemies).toContain('aggressive-neighbor');
      expect(level?.enemies).not.toContain('goblin'); // No fantasy enemies
      
      // Verify Zod schema validation
      expect(() => levelMetadataSchema.parse(level)).not.toThrow();
    });
  });

  describe('Item Loading with Zod Validation', () => {
    it('should load and validate WHIX delivery equipment', async () => {
      const mockItemContent = {
        data: {
          id: 'enhanced-scanner',
          type: 'item',
          title: 'Enhanced Delivery Scanner',
          description: 'Modified WHIX scanner with resistance hacks',
          category: 'equipment',
          rarity: 'rare',
          value: 150,
          stackable: false,
          effects: {
            statBoosts: {
              efficiency: 10,
              speed: 5
            }
          },
          published: true
        },
        content: 'Item lore...'
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['enhanced-scanner.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock file content'));
      vi.mocked(matter).mockReturnValue(mockItemContent as any);

      const item = await loadItem('enhanced-scanner');

      expect(item).toBeDefined();
      expect(item?.name).toBe('Enhanced Delivery Scanner');
      expect(item?.itemType).toBe('equipment');
      expect(item?.usableBy).toContain('courier');
      
      // Should not have medieval items
      expect(item?.name).not.toContain('sword');
      expect(item?.name).not.toContain('armor');
      expect(item?.name).not.toContain('potion');
      
      // Verify Zod schema validation
      expect(() => itemMetadataSchema.parse(item)).not.toThrow();
    });
  });

  describe('Chapter Loading with Zod Validation', () => {
    it('should load and validate dystopian story chapter', async () => {
      const mockChapterContent = {
        data: {
          id: 'chapter-1-first-day',
          type: 'chapter',
          title: 'Chapter 1: First Day on the Job',
          description: 'Your introduction to the gig economy dystopia of Polanco',
          chapterNumber: 1,
          act: 1,
          setting: 'WHIX Distribution Center - Onboarding Facility',
          requiredLevel: 1,
          characters: ['miguel', 'whix_ai', 'kai'],
          choices: [
            {
              id: 'accept_terms',
              text: 'Accept WHIX terms without reading',
              consequence: {
                humanityChange: -5,
                relationshipChanges: { whix_ai: 10 }
              }
            }
          ],
          published: true
        },
        content: 'Chapter narrative...'
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['chapter-1-first-day.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock file content'));
      vi.mocked(matter).mockReturnValue(mockChapterContent as any);

      const chapter = await loadChapter('chapter-1-first-day');

      expect(chapter).toBeDefined();
      expect(chapter?.title).toContain('First Day on the Job');
      expect(chapter?.setting).toContain('WHIX');
      expect(chapter?.mainCharacters).toContain('whix_ai');
      
      // Verify Zod schema validation
      expect(() => chapterMetadataSchema.parse(chapter)).not.toThrow();
    });
  });

  describe('Trait Loading with Zod Validation', () => {
    it('should load and validate neurodivergent traits', async () => {
      const mockTraitContent = {
        data: {
          id: 'hyperfocus',
          type: 'trait',
          title: 'Hyperfocus',
          description: 'Intense concentration that turns the chaotic world into manageable data streams',
          category: 'cognitive',
          gameplayEffects: {
            statBoosts: { efficiency: 20, speed: 10 },
            specialAbilities: ['time_dilation', 'pattern_surge'],
            synergyWith: ['pattern_recognition', 'systematic_thinking']
          },
          narrativeImpact: 'Changes dialog options and story paths',
          published: true
        },
        content: 'Trait details...'
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['hyperfocus.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock file content'));
      vi.mocked(matter).mockReturnValue(mockTraitContent as any);

      const trait = await loadTrait('hyperfocus');

      expect(trait).toBeDefined();
      expect(trait?.name).toBe('Hyperfocus');
      expect(trait?.traitType).toBe('primary');
      expect(trait?.gameplayEffects.statModifiers.focus).toBe(20);
      
      // Verify it's not a fantasy trait
      expect(trait?.description).not.toContain('magic');
      expect(trait?.description).not.toContain('spell');
      
      // Verify Zod schema validation
      expect(() => traitMetadataSchema.parse(trait)).not.toThrow();
    });
  });

  describe('Dialog Loading with Zod Validation', () => {
    it('should load and validate Polanco citizen dialog', async () => {
      const mockDialogContent = {
        data: {
          id: 'neighbor-complaint',
          type: 'dialog',
          title: 'Angry Neighbor Complaint',
          description: 'Confrontation with stressed Polanco resident',
          speaker: 'Angry Neighbor',
          location: 'polanco-residential',
          context: 'delivery-disruption',
          lines: [
            {
              id: 'complaint-1',
              text: 'You couriers are always making noise! Some of us work from home!',
              emotion: 'angry',
              conditions: {},
              responses: [
                {
                  id: 'apologize',
                  text: 'Sorry, just trying to make my delivery quota',
                  requirements: {},
                  effects: { relationshipChanges: { neighbors: -5 } }
                },
                {
                  id: 'retort',
                  text: 'And some of us work in the streets. Deal with it.',
                  requirements: { trait: 'assertive' },
                  effects: { humanityChange: -5 }
                }
              ]
            }
          ],
          triggerConditions: { location: 'residential', time: 'day' },
          priority: 5,
          repeatable: true,
          published: true
        },
        content: 'Dialog context...'
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['neighbor-complaint.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock file content'));
      vi.mocked(matter).mockReturnValue(mockDialogContent as any);

      const dialog = await loadDialogue('neighbor-complaint');

      expect(dialog).toBeDefined();
      expect(dialog?.speaker).toBe('Angry Neighbor');
      expect(dialog?.location).toBe('polanco-residential');
      expect(dialog?.lines[0].text).toContain('couriers');
      expect(dialog?.lines[0].text).not.toContain('adventurer'); // No fantasy dialog
      
      // Verify Zod schema validation
      expect(() => dialogMetadataSchema.parse(dialog)).not.toThrow();
    });
  });

  describe('Batch Loading with Theme Verification', () => {
    it('should load all content and verify Polanco theme consistency', async () => {
      // Mock multiple files
      vi.mocked(fs.promises.readdir).mockImplementation(async (dir) => {
        if (dir.includes('characters')) {
          return ['miguel.md', 'kai.md'] as any;
        }
        if (dir.includes('levels')) {
          return ['polanco-central.md', 'underground-market.md'] as any;
        }
        return [] as any;
      });

      // Mock character files
      const characters = [
        {
          data: {
            id: 'miguel',
            type: 'character',
            name: 'Miguel',
            role: 'protagonist',
            class: 'courier',
            traits: ['hyperfocus'],
            stats: { focus: 80, perception: 75, social: 60, logic: 70, stamina: 65 },
            published: true
          },
          content: ''
        },
        {
          data: {
            id: 'kai',
            type: 'character', 
            name: 'Kai Chen',
            role: 'partner',
            class: 'analyst',
            traits: ['pattern_recognition'],
            stats: { focus: 85, perception: 90, social: 50, logic: 95, stamina: 55 },
            published: true
          },
          content: ''
        }
      ];

      let fileIndex = 0;
      vi.mocked(fs.promises.readFile).mockImplementation(async () => Buffer.from('mock content'));
      vi.mocked(matter).mockImplementation(() => {
        return characters[fileIndex++ % characters.length] as any;
      });

      const allCharacters = await loadAllCharacters();

      expect(allCharacters.length).toBe(2);
      
      // Verify all characters fit the Polanco theme
      allCharacters.forEach(char => {
        expect(['courier', 'analyst', 'negotiator', 'specialist', 'investigator']).toContain(char.class);
        expect(char.name).not.toMatch(/Sir|Lord|Lady|Knight/); // No medieval titles
        expect(char.traits.every(t => 
          ['hyperfocus', 'pattern_recognition', 'enhanced_senses', 'systematic_thinking', 
           'attention_to_detail', 'routine_mastery', 'sensory_processing'].includes(t)
        )).toBe(true);
      });
    });
  });

  describe('Error Handling with Zod Validation', () => {
    it('should handle invalid content gracefully', async () => {
      const mockInvalidContent = {
        data: {
          id: 'broken-character',
          type: 'character',
          name: 'Broken',
          // Missing required fields like role, class, stats
        },
        content: ''
      };

      vi.mocked(fs.promises.readdir).mockResolvedValue(['broken-character.md'] as any);
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock content'));
      vi.mocked(matter).mockReturnValue(mockInvalidContent as any);

      const character = await loadCharacter('broken-character');
      
      // Should return null when validation fails
      expect(character).toBeNull();
    });

    it('should handle file read errors', async () => {
      vi.mocked(fs.promises.readdir).mockRejectedValue(new Error('Permission denied'));

      const characters = await loadAllCharacters();
      
      // Should return empty array on error
      expect(characters).toEqual([]);
    });
  });
});