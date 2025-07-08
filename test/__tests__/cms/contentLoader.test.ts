import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Mock modules
vi.mock('fs');
vi.mock('gray-matter');
vi.mock('remark', () => ({
  remark: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    process: vi.fn().mockResolvedValue({ toString: () => '<p>Processed HTML</p>' })
  }))
}));

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
  loadAllDialogues,
  ContentFile
} from '@/lib/cms/content-loader';
import { 
  CharacterMetadata,
  LevelMetadata,
  ItemMetadata,
  ChapterMetadata,
  TraitMetadata,
  DialogueMetadata
} from '@/lib/cms/content-types';

describe('ContentLoader - CMS Integration', () => {
  const mockContentDir = '/test/content';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock process.cwd to return a consistent path
    vi.spyOn(process, 'cwd').mockReturnValue('/test');
    
    // Setup default mocks
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('');
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);
  });

  describe('Character Loading', () => {
    it('should load and validate character from content file', async () => {
      const mockCharacterContent = {
        data: {
          id: 'miguel-lopez',
          type: 'character',
          title: 'Miguel Lopez',
          description: 'Anxious but determined delivery partner awakening to resistance consciousness',
          name: 'Miguel Lopez',
          role: 'protagonist' as const,
          class: 'protagonist', // From the actual content file
          traits: ['pattern_recognition', 'hyperfocus', 'social_anxiety', 'protective_instinct'],
          personality: 'Anxious but determined delivery partner awakening to resistance consciousness',
          published: true,
          tags: ['protagonist', 'main_character']
        },
        content: '# Miguel Lopez - The Reluctant Revolutionary\n\nCharacter story content...'
      };

      // Mock file system operations
      const mockFilePath = path.join(mockContentDir, 'characters', 'miguel-lopez.md');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock file content');
      vi.mocked(matter).mockReturnValue(mockCharacterContent as any);

      const character = await loadCharacter('miguel-lopez');

      expect(character).toBeDefined();
      expect(character?.metadata.name).toBe('Miguel Lopez');
      expect(character?.metadata.role).toBe('protagonist');
      expect(character?.metadata.traits).toContain('hyperfocus');
      expect(character?.metadata.traits).toContain('pattern_recognition');
      expect(character?.slug).toBe('miguel-lopez');
      expect(character?.htmlContent).toBe('<p>Processed HTML</p>');
    });

    it('should load character with non-standard class', async () => {
      const mockCharacterWithCustomClass = {
        data: {
          id: 'custom-character',
          type: 'character',
          title: 'Custom Character',
          description: 'Character with custom class',
          name: 'Custom',
          role: 'npc' as const,
          class: 'custom-class', // Non-standard class is allowed
          published: true
        },
        content: 'Custom content...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock file content');
      vi.mocked(matter).mockReturnValue(mockCharacterWithCustomClass as any);

      const character = await loadCharacter('custom-character');
      
      // Should successfully load with custom class
      expect(character).toBeDefined();
      expect(character?.metadata.class).toBe('custom-class');
    });
  });

  describe('Level Loading', () => {
    it('should load and validate mission level', async () => {
      const mockLevelContent = {
        data: {
          id: 'rush-hour-rebellion',
          type: 'level',
          title: 'Rush Hour Rebellion',
          description: 'Deliver critical supplies to striking workers while avoiding corporate enforcers',
          difficulty: 'hard' as const,
          missionType: 'rush_delivery' as const,
          objectives: [
            {
              id: 'deliver_supplies',
              description: 'Deliver food and medical supplies to the strike camp',
              type: 'deliver' as const,
              target: 5,
              optional: false
            }
          ],
          rewards: {
            tips: 2500,
            experience: 500,
            starFragments: 5,
            items: ['encrypted_comm_device'],
            unlocksChapter: 'the-strike-breaks'
          },
          requirements: {
            level: 10,
            completedMissions: ['first-day-jitters', 'corporate-surveillance'],
            humanityIndex: 60
          },
          enemyGroups: ['whix_enforcers_squad', 'surveillance_drones'],
          dialogueNodes: ['strike_leader_intro', 'enforcer_threats', 'courier_solidarity'],
          tags: ['story_critical', 'rebellion', 'high_stakes', 'timed_mission'],
          published: true
        },
        content: '# Rush Hour Rebellion\n\nMission briefing...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock file content');
      vi.mocked(matter).mockReturnValue(mockLevelContent as any);

      const level = await loadLevel('rush-hour-rebellion');

      expect(level).toBeDefined();
      expect(level?.metadata.title).toBe('Rush Hour Rebellion');
      expect(level?.metadata.difficulty).toBe('hard');
      expect(level?.metadata.missionType).toBe('rush_delivery');
      expect(level?.metadata.objectives).toHaveLength(1);
      expect(level?.metadata.rewards.tips).toBe(2500);
      expect(level?.metadata.enemyGroups).toContain('whix_enforcers_squad');
    });
  });

  describe('Item Loading', () => {
    it('should load and validate neural interface item', async () => {
      const mockItemContent = {
        data: {
          id: 'neural-interface-headset',
          type: 'item',
          title: 'Neural Interface Headset',
          name: 'NeuroLink Professional Headset',
          description: 'Advanced neural interface designed specifically for neurodivergent cognitive enhancement',
          category: 'equipment' as const,
          subcategory: 'headgear',
          rarity: 'rare' as const,
          itemLevel: 15,
          value: 2500,
          stackable: false,
          tradeable: true,
          stats: {
            focus: 12,
            perception: 8,
            social: 5
          },
          effects: [
            {
              type: 'boost' as const,
              value: 15,
              target: 'self' as const,
              duration: 300
            }
          ],
          requirements: {
            level: 10,
            trait: 'Any neurodivergent trait'
          },
          published: true,
          tags: ['equipment', 'neurodivergent', 'cognitive_enhancement']
        },
        content: '# NeuroLink Professional Headset\n\nItem description...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock file content');
      vi.mocked(matter).mockReturnValue(mockItemContent as any);

      const item = await loadItem('neural-interface-headset');

      expect(item).toBeDefined();
      expect(item?.metadata.title).toBe('Neural Interface Headset');
      expect(item?.metadata.category).toBe('equipment');
      expect(item?.metadata.rarity).toBe('rare');
      expect(item?.metadata.value).toBe(2500);
      expect(item?.metadata.stackable).toBe(false);
    });
  });

  describe('Chapter Loading', () => {
    it('should load and validate story chapter', async () => {
      const mockChapterContent = {
        data: {
          id: 'chapter-1-first-day',
          type: 'chapter',
          title: 'Chapter 1: First Day on the Job',
          description: 'Your introduction to the gig economy dystopia',
          chapterNumber: 1,
          act: 1,
          setting: 'WHIX Distribution Center - Onboarding Facility',
          timeOfDay: 'morning' as const,
          weather: 'clear' as const,
          mainCharacters: ['miguel', 'whix_ai', 'kai'],
          choices: [
            {
              id: 'accept_terms',
              description: 'Accept WHIX terms without reading',
              consequences: {
                humanityChange: -5,
                relationshipChanges: { whix_ai: 10 }
              }
            }
          ],
          musicTrack: 'corporate_ambience',
          backgroundImage: 'whix_center.jpg',
          published: true,
          tags: ['chapter', 'story', 'act1']
        },
        content: '# Chapter 1\n\nChapter narrative...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock file content');
      vi.mocked(matter).mockReturnValue(mockChapterContent as any);

      const chapter = await loadChapter('chapter-1-first-day');

      expect(chapter).toBeDefined();
      expect(chapter?.metadata.title).toContain('First Day on the Job');
      expect(chapter?.metadata.setting).toContain('WHIX');
      expect(chapter?.metadata.mainCharacters).toContain('miguel');
      expect(chapter?.metadata.chapterNumber).toBe(1);
      expect(chapter?.metadata.timeOfDay).toBe('morning');
    });
  });

  describe('Trait Loading', () => {
    it('should load and validate neurodivergent trait', async () => {
      const mockTraitContent = {
        data: {
          id: 'hyperfocus',
          type: 'trait',
          title: 'Hyperfocus',
          name: 'Hyperfocus',
          description: 'Intense concentration that turns the chaotic world into manageable data streams',
          category: 'neurodivergent' as const,
          rarity: 'common' as const,
          statBonus: {
            focus: 20,
            perception: 10
          },
          personalityTraits: ['determined', 'focused', 'single-minded'],
          strengths: ['Enhanced productivity', 'Deep problem solving'],
          challenges: ['Difficulty switching tasks', 'Time blindness'],
          abilityUnlocks: [
            {
              level: 5,
              ability: 'Time Dilation',
              description: 'Slow perception of time during intense focus'
            }
          ],
          compatibleClasses: ['analyst', 'investigator'],
          positiveRepresentation: {
            description: 'Hyperfocus is portrayed as a powerful cognitive tool',
            examples: ['Deep analysis', 'Pattern detection']
          },
          gameplayMechanics: {
            passiveEffect: 'Increased efficiency during focused tasks',
            activeAbility: 'Enter hyperfocus mode for enhanced performance'
          },
          published: true,
          tags: ['trait', 'neurodivergent', 'cognitive']
        },
        content: '# Hyperfocus\n\nTrait details...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock file content');
      vi.mocked(matter).mockReturnValue(mockTraitContent as any);

      const trait = await loadTrait('hyperfocus');

      expect(trait).toBeDefined();
      expect(trait?.metadata.name).toBe('Hyperfocus');
      expect(trait?.metadata.category).toBe('neurodivergent');
      expect(trait?.metadata.statBonus?.focus).toBe(20);
      expect(trait?.metadata.description).not.toContain('magic');
    });
  });

  describe('Dialogue Loading', () => {
    it('should load and validate character dialogue', async () => {
      const mockDialogueContent = {
        data: {
          id: 'neighbor-complaint',
          type: 'dialogue',
          title: 'Angry Neighbor Complaint',
          description: 'Confrontation with stressed resident',
          characters: ['miguel', 'angry_neighbor'],
          location: 'residential_district',
          trigger: 'interaction' as const,
          priority: 'side' as const,
          repeatable: true,
          conditions: {
            minimumLevel: 3,
            timeOfDay: 'day'
          },
          branches: [
            {
              id: 'apologetic_branch',
              condition: 'humanity > 50',
              nextDialogue: 'neighbor_calmed'
            },
            {
              id: 'defiant_branch',
              condition: 'humanity < 30',
              nextDialogue: 'neighbor_angered'
            }
          ],
          published: true,
          tags: ['dialogue', 'social', 'conflict']
        },
        content: '# Neighbor Complaint\n\nDialogue script...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock file content');
      vi.mocked(matter).mockReturnValue(mockDialogueContent as any);

      const dialogue = await loadDialogue('neighbor-complaint');

      expect(dialogue).toBeDefined();
      expect(dialogue?.metadata.title).toBe('Angry Neighbor Complaint');
      expect(dialogue?.metadata.characters).toContain('angry_neighbor');
      expect(dialogue?.metadata.location).toBe('residential_district');
      expect(dialogue?.metadata.trigger).toBe('interaction');
      expect(dialogue?.metadata.repeatable).toBe(true);
    });
  });

  describe('Batch Loading', () => {
    it('should load all characters with proper structure', async () => {
      // Mock directory structure
      vi.mocked(fs.readdirSync).mockImplementation((dir) => {
        if (dir.includes('characters')) {
          return ['miguel-lopez.md', 'tania-volkov.md'] as any;
        }
        return [] as any;
      });
      
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);

      // Mock character files
      const characters = [
        {
          data: {
            id: 'miguel-lopez',
            type: 'character',
            title: 'Miguel Lopez',
            description: 'Protagonist',
            name: 'Miguel Lopez',
            role: 'protagonist' as const,
            published: true
          },
          content: 'Miguel story...'
        },
        {
          data: {
            id: 'tania-volkov',
            type: 'character', 
            title: 'Tania Volkov',
            description: 'Partner character',
            name: 'Tania Volkov',
            role: 'partner' as const,
            class: 'courier' as const,
            traits: ['hyperfocus', 'enhanced_senses'],
            published: true
          },
          content: 'Tania story...'
        }
      ];

      let fileIndex = 0;
      vi.mocked(fs.readFileSync).mockImplementation(() => 'mock content');
      vi.mocked(matter).mockImplementation(() => {
        return characters[fileIndex++ % characters.length] as any;
      });

      const allCharacters = await loadAllCharacters();

      expect(allCharacters).toHaveLength(2);
      expect(allCharacters[0].metadata.name).toBe('Miguel Lopez');
      expect(allCharacters[1].metadata.name).toBe('Tania Volkov');
      expect(allCharacters[0].htmlContent).toBe('<p>Processed HTML</p>');
      
      // Verify content structure
      allCharacters.forEach(char => {
        expect(char.metadata).toBeDefined();
        expect(char.content).toBeDefined();
        expect(char.htmlContent).toBeDefined();
        expect(char.slug).toBeDefined();
        expect(char.filePath).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid content gracefully', async () => {
      const mockInvalidContent = {
        data: {
          id: 'broken-character',
          type: 'character',
          name: 'Broken',
          // Missing required fields like title, description
        },
        content: ''
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock content');
      vi.mocked(matter).mockReturnValue(mockInvalidContent as any);

      const character = await loadCharacter('broken-character');
      
      // Should return null when validation fails
      expect(character).toBeNull();
    });

    it('should handle file not found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const character = await loadCharacter('non-existent');
      
      // Should return null when file doesn't exist
      expect(character).toBeNull();
    });

    it('should handle directory read errors', async () => {
      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const characters = await loadAllCharacters();
      
      // Should return empty array on error
      expect(characters).toEqual([]);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Content Integration with Game Systems', () => {
    it('should convert CMS character to game partner entity', async () => {
      const mockCharacterContent = {
        data: {
          id: 'tania-volkov',
          type: 'character',
          title: 'Tania Volkov',
          description: 'Elite courier with enhanced sensory abilities',
          name: 'Tania Volkov',
          role: 'partner' as const,
          class: 'courier' as const,
          traits: ['enhanced_senses', 'hyperfocus'],
          stats: {
            focus: 85,
            perception: 95,
            social: 70,
            logic: 75,
            stamina: 80
          },
          published: true
        },
        content: 'Character details...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock content');
      vi.mocked(matter).mockReturnValue(mockCharacterContent as any);

      const characterContent = await loadCharacter('tania-volkov');
      
      // Verify character can be converted to game partner
      expect(characterContent).toBeDefined();
      expect(characterContent?.metadata.role).toBe('partner');
      expect(characterContent?.metadata.class).toBe('courier');
      expect(characterContent?.metadata.traits).toContain('enhanced_senses');
      expect(characterContent?.metadata.stats).toBeDefined();
    });

    it('should convert CMS item to game inventory item', async () => {
      const mockItemContent = {
        data: {
          id: 'stim-pack',
          type: 'item',
          title: 'WHIX Stim Pack',
          description: 'Corporate-issued stimulant for extended shifts',
          category: 'consumable' as const,
          rarity: 'common' as const,
          value: 50,
          stackable: true,
          maxStack: 10,
          effects: [
            {
              type: 'boost' as const,
              value: 25,
              duration: 600,
              target: 'self' as const
            }
          ],
          published: true
        },
        content: 'Item lore...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock content');
      vi.mocked(matter).mockReturnValue(mockItemContent as any);

      const itemContent = await loadItem('stim-pack');
      
      // Verify item can be used in game inventory
      expect(itemContent).toBeDefined();
      expect(itemContent?.metadata.category).toBe('consumable');
      expect(itemContent?.metadata.stackable).toBe(true);
      expect(itemContent?.metadata.effects).toHaveLength(1);
      expect(itemContent?.metadata.effects?.[0].type).toBe('boost');
    });

    it('should load mission level with objectives and rewards', async () => {
      const mockMissionContent = {
        data: {
          id: 'corporate-sabotage',
          type: 'level',
          title: 'Corporate Sabotage',
          description: 'Infiltrate WHIX servers to expose their exploitation',
          difficulty: 'extreme' as const,
          missionType: 'sabotage' as const,
          objectives: [
            {
              id: 'infiltrate',
              description: 'Access the server room undetected',
              type: 'interact' as const,
              target: 'server_terminal',
              optional: false
            },
            {
              id: 'download_data',
              description: 'Download exploitation evidence',
              type: 'collect' as const,
              target: 3,
              optional: false
            },
            {
              id: 'escape',
              description: 'Escape without triggering alarms',
              type: 'survive' as const,
              optional: true
            }
          ],
          rewards: {
            tips: 5000,
            experience: 1000,
            starFragments: 10,
            items: ['encrypted_data_drive', 'resistance_badge'],
            unlocksChapter: 'the-truth-revealed'
          },
          requirements: {
            level: 15,
            completedMissions: ['rush-hour-rebellion', 'underground-network'],
            humanityIndex: 75,
            hasTrait: 'systematic_thinking'
          },
          enemyGroups: ['corporate_security_elite', 'ai_defense_system'],
          published: true
        },
        content: 'Mission briefing...'
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('mock content');
      vi.mocked(matter).mockReturnValue(mockMissionContent as any);

      const missionContent = await loadLevel('corporate-sabotage');
      
      // Verify complex mission structure
      expect(missionContent).toBeDefined();
      expect(missionContent?.metadata.objectives).toHaveLength(3);
      expect(missionContent?.metadata.objectives[0].type).toBe('interact');
      expect(missionContent?.metadata.objectives[2].optional).toBe(true);
      expect(missionContent?.metadata.rewards.tips).toBe(5000);
      expect(missionContent?.metadata.rewards.items).toContain('resistance_badge');
      expect(missionContent?.metadata.requirements?.hasTrait).toBe('systematic_thinking');
    });
  });
});