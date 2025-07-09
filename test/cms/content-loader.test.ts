import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  loadContentFile, 
  loadContentByType, 
  loadAllCharacters,
  loadAllItems,
  loadAllChapters 
} from '@/lib/cms/content-loader';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

describe('Content Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadContentFile', () => {
    it('should load and parse a valid character markdown file', async () => {
      const mockFilePath = '/content/characters/test-character.md';
      const mockContent = `---
id: "test-character"
title: "Test Character"
description: "A test character"
name: "Test Character"
role: "partner"
class: "courier"
traits: ["hyperfocus", "pattern_recognition"]
---

# Test Character

This is test content.`;

      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(path.basename).mockReturnValue('test-character');

      const result = await loadContentFile(mockFilePath);

      expect(result).not.toBeNull();
      expect(result?.metadata.id).toBe('test-character');
      expect(result?.metadata.name).toBe('Test Character');
      expect(result?.content).toContain('This is test content.');
      expect(result?.slug).toBe('test-character');
    });

    it('should handle flexible schemas for items with non-standard categories', async () => {
      const mockFilePath = '/content/items/medicine-item.md';
      const mockContent = `---
id: "healing-potion"
title: "Healing Potion"
description: "Restores health"
category: "medicine"
rarity: "uncommon"
value: 100
---

# Healing Potion`;

      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(path.basename).mockReturnValue('medicine-item');

      const result = await loadContentFile(mockFilePath);

      expect(result).not.toBeNull();
      expect(result?.metadata.category).toBe('medicine');
      expect(result?.metadata.rarity).toBe('uncommon');
    });

    it('should return null for files without frontmatter', async () => {
      const mockFilePath = '/content/README.md';
      const mockContent = '# README\n\nThis is a readme file without frontmatter.';

      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(path.basename).mockReturnValue('README');

      const result = await loadContentFile(mockFilePath);

      // Should still load but with unknown type
      expect(result?.metadata.type).toBe('unknown');
    });

    it('should handle files with missing required fields gracefully', async () => {
      const mockFilePath = '/content/characters/incomplete.md';
      const mockContent = `---
name: "Incomplete Character"
---

# Content`;

      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(path.basename).mockReturnValue('incomplete');

      const result = await loadContentFile(mockFilePath);

      // Should return with unknown type due to missing required fields
      expect(result?.metadata.type).toBe('unknown');
    });

    it('should handle file read errors', async () => {
      const mockFilePath = '/content/nonexistent.md';
      
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = await loadContentFile(mockFilePath);

      expect(result).toBeNull();
    });
  });

  describe('loadContentByType', () => {
    it('should load all content files of a specific type', async () => {
      // Mock fs.existsSync to return true for the content directory
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      // Mock getAllFiles behavior
      vi.mocked(fs.readdirSync).mockReturnValue(['char1.md', 'char2.md', 'README.md'] as any);
      vi.mocked(fs.statSync).mockImplementation((filePath) => ({
        isDirectory: () => false
      } as any));
      
      // Mock file content for characters
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes('char1.md')) {
          return `---
id: "char1"
title: "Character 1"
description: "First character"
name: "Character 1"
role: "partner"
class: "courier"
---
Content 1`;
        } else if (filePath.toString().includes('char2.md')) {
          return `---
id: "char2"
title: "Character 2"  
description: "Second character"
name: "Character 2"
role: "partner"
class: "analyst"
---
Content 2`;
        } else {
          return '# README';
        }
      });

      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
      vi.mocked(path.basename).mockImplementation((p) => p.toString().split('/').pop()!.replace('.md', ''));

      const results = await loadContentByType('character');

      // Should only return valid character files, not README
      expect(results).toHaveLength(2);
      expect(results[0].metadata.id).toBe('char1');
      expect(results[1].metadata.id).toBe('char2');
    });

    it('should filter out files with unknown content type', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(['valid.md', 'invalid.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);
      
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes('valid.md')) {
          return `---
id: "valid-item"
title: "Valid Item"
description: "A valid item"
category: "consumable"
value: 100
---
Content`;
        } else {
          return 'No frontmatter here';
        }
      });

      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
      vi.mocked(path.basename).mockImplementation((p) => p.toString().split('/').pop()!.replace('.md', ''));

      const results = await loadContentByType('item');

      expect(results).toHaveLength(1);
      expect(results[0].metadata.id).toBe('valid-item');
    });
  });

  describe('Type-specific loaders', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
      vi.mocked(path.basename).mockImplementation((p) => p.toString().split('/').pop()!.replace('.md', ''));
    });

    it('loadAllCharacters should handle various character metadata formats', async () => {
      vi.mocked(fs.readdirSync).mockReturnValue(['tania.md', 'enemy.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);
      
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes('tania.md')) {
          return `---
id: "tania"
title: "Tania"
description: "Partner character"
name: "Tania"
role: "partner"
class: "courier"
traits: ["hyperfocus", "pattern_recognition"]
---
Content`;
        } else {
          return `---
id: "boss"
title: "Boss Enemy"
description: "Enemy character"
name: "Boss"
role: "enemy"
class: "broken_courier"
traits: ["strategic_deception"]
---
Enemy content`;
        }
      });

      const characters = await loadAllCharacters();

      expect(characters).toHaveLength(2);
      expect(characters[0].metadata.traits).toContain('hyperfocus');
      expect(characters[1].metadata.class).toBe('broken_courier'); // Original value preserved
    });

    it('loadAllItems should handle various item categories and rarities', async () => {
      vi.mocked(fs.readdirSync).mockReturnValue(['medicine.md', 'equipment.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);
      
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath.toString().includes('medicine.md')) {
          return `---
id: "healing-herb"
title: "Healing Herb"
description: "Natural medicine"
category: "medicine"
rarity: "uncommon"
value: 50
---
Content`;
        } else {
          return `---
id: "armor"
title: "Combat Armor"
description: "Protective gear"
category: "corporate_equipment"
rarity: "restricted"
value: 500
---
Content`;
        }
      });

      const items = await loadAllItems();

      expect(items).toHaveLength(2);
      expect(items[0].metadata.category).toBe('medicine');
      expect(items[0].metadata.rarity).toBe('uncommon');
      expect(items[1].metadata.category).toBe('corporate_equipment');
      expect(items[1].metadata.rarity).toBe('restricted');
    });

    it('loadAllChapters should handle missing optional fields', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(['chapter1.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);
      
      vi.mocked(fs.readFileSync).mockReturnValue(`---
id: "chapter-1"
title: "Chapter 1"
description: "First chapter"
---
Chapter content`);

      const chapters = await loadAllChapters();

      expect(chapters).toHaveLength(1);
      expect(chapters[0].metadata.id).toBe('chapter-1');
      // Optional fields should have defaults according to schema
      expect(chapters[0].metadata.mainCharacters || []).toEqual([]);
      expect(chapters[0].metadata.choices || []).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should skip hidden files starting with dot', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(['.DS_Store', 'valid.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);
      
      vi.mocked(fs.readFileSync).mockReturnValue(`---
id: "test"
title: "Test"
description: "Test"
category: "consumable"
value: 100
---
Content`);

      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
      vi.mocked(path.basename).mockImplementation((p) => p.toString().split('/').pop()!.replace('.md', ''));

      const results = await loadContentByType('item');

      expect(results).toHaveLength(1);
      expect(results[0].metadata.id).toBe('test');
    });

    it('should handle deeply nested directory structures', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      const mockDirStructure = (dir: string) => {
        if (dir.includes('subdirectory')) {
          return ['item.md'] as any;
        }
        return ['subdirectory'] as any;
      };

      const mockStatSync = (filePath: string) => ({
        isDirectory: () => !filePath.endsWith('.md')
      } as any);

      vi.mocked(fs.readdirSync).mockImplementation(mockDirStructure);
      vi.mocked(fs.statSync).mockImplementation(mockStatSync);
      
      vi.mocked(fs.readFileSync).mockReturnValue(`---
id: "nested-item"
title: "Nested Item"
description: "Item in subdirectory"
category: "consumable"
value: 100
---
Content`);

      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
      vi.mocked(path.basename).mockReturnValue('item');

      const results = await loadContentByType('item');

      expect(results).toHaveLength(1);
      expect(results[0].metadata.id).toBe('nested-item');
    });
  });
});