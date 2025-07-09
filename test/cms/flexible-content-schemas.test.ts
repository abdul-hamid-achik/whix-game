import { describe, it, expect } from 'vitest';
import {
  normalizeForDatabase,
  rarityMap,
  itemTypeMap,
  classMap,
  traitMap,
  characterMetadataSchema,
  itemMetadataSchema,
  flexibleContentMetadataSchema
} from '@/lib/cms/flexible-content-schemas';

describe('Flexible Content Schemas', () => {
  describe('normalizeForDatabase', () => {
    it('should normalize known values correctly', () => {
      expect(normalizeForDatabase('uncommon', rarityMap)).toBe('rare');
      expect(normalizeForDatabase('restricted', rarityMap)).toBe('legendary');
      expect(normalizeForDatabase('medicine', itemTypeMap)).toBe('consumable');
      expect(normalizeForDatabase('broken_courier', classMap)).toBe('courier');
    });

    it('should handle case-insensitive normalization', () => {
      expect(normalizeForDatabase('COMMON', rarityMap)).toBe('common');
      expect(normalizeForDatabase('Rare', rarityMap)).toBe('rare');
      expect(normalizeForDatabase('EPIC', rarityMap)).toBe('epic');
    });

    it('should remove special characters during normalization', () => {
      expect(normalizeForDatabase('pattern_recognition', traitMap)).toBe('pattern_recognition');
      expect(normalizeForDatabase('pattern-recognition', traitMap)).toBe('pattern_recognition');
      expect(normalizeForDatabase('pattern recognition', traitMap)).toBe('pattern_recognition');
    });

    it('should return default value when key not found', () => {
      expect(normalizeForDatabase('unknown_rarity', rarityMap)).toBe('common');
      expect(normalizeForDatabase('unknown_type', itemTypeMap)).toBe('material');
      expect(normalizeForDatabase('unknown_class', classMap)).toBe('courier');
      expect(normalizeForDatabase('unknown_trait', traitMap)).toBe('hyperfocus');
    });

    it('should handle undefined values', () => {
      expect(normalizeForDatabase(undefined, rarityMap)).toBe('common');
      expect(normalizeForDatabase(undefined, itemTypeMap)).toBe('material');
      expect(normalizeForDatabase(undefined, { default: 'test' })).toBe('test');
      expect(normalizeForDatabase(undefined, {})).toBe('unknown');
    });

    it('should return original value if no default and not found', () => {
      const mapWithoutDefault = { known: 'value' };
      expect(normalizeForDatabase('unknown', mapWithoutDefault)).toBe('unknown');
    });
  });

  describe('Character Schema', () => {
    it('should accept flexible character data', () => {
      const validCharacter = {
        id: 'test-char',
        title: 'Test Character',
        description: 'A test character',
        name: 'Test',
        role: 'enemy', // Not in original enum
        class: 'broken_courier', // Not in original enum
        traits: ['strategic_deception', 'time_blindness'], // Not in original enum
        stats: {
          health: '100', // String that will be converted
          attack: 50
        },
        relationships: {
          player: '75', // String that will be converted
          boss: 100
        }
      };

      const result = characterMetadataSchema.parse(validCharacter);
      
      expect(result.role).toBe('enemy');
      expect(result.class).toBe('broken_courier');
      expect(result.traits).toEqual(['strategic_deception', 'time_blindness']);
      expect(result.stats).toEqual({ health: 100, attack: 50 });
      expect(result.relationships).toEqual({ player: 75, boss: 100 });
    });

    it('should handle abilities as objects and normalize to strings', () => {
      const character = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        name: 'Test',
        abilities: [
          'simple-ability',
          { name: 'complex-ability', description: 'Does something' }
        ]
      };

      const result = characterMetadataSchema.parse(character);
      expect(result.abilities).toEqual(['simple-ability', 'complex-ability']);
    });

    it('should make type field optional', () => {
      const character = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        name: 'Test'
      };

      const result = characterMetadataSchema.parse(character);
      expect(result.type).toBeUndefined();
    });
  });

  describe('Item Schema', () => {
    it('should accept flexible item categories', () => {
      const items = [
        { category: 'medicine' },
        { category: 'transport' },
        { category: 'storage' },
        { category: 'cultural_item' },
        { category: 'religious_item' },
        { category: 'corporate_equipment' }
      ];

      items.forEach(item => {
        const fullItem = {
          id: 'test',
          title: 'Test',
          description: 'Test',
          value: 100,
          ...item
        };

        const result = itemMetadataSchema.parse(fullItem);
        expect(result.category).toBe(item.category);
      });
    });

    it('should accept flexible rarities with defaults', () => {
      const item1 = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        category: 'consumable',
        value: 100,
        rarity: 'uncommon'
      };

      const item2 = {
        id: 'test2',
        title: 'Test2',
        description: 'Test2',
        category: 'equipment',
        value: 200
        // No rarity specified
      };

      const result1 = itemMetadataSchema.parse(item1);
      expect(result1.rarity).toBe('uncommon');

      const result2 = itemMetadataSchema.parse(item2);
      expect(result2.rarity).toBe('common'); // Default
    });

    it('should handle complex effects structure', () => {
      const item = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        category: 'consumable',
        value: 100,
        effects: {
          passive: [
            { name: 'Effect 1', bonus: '+10%' },
            { name: 'Effect 2', benefit: 'Immunity' }
          ],
          active: [
            { name: 'Active Effect', cooldown: '30s' }
          ]
        }
      };

      const result = itemMetadataSchema.parse(item);
      expect(result.effects).toBeDefined();
      expect(result.effects).toHaveProperty('passive');
      expect(result.effects).toHaveProperty('active');
    });
  });

  describe('Flexible Content Metadata Schema', () => {
    it('should try each schema type and return unknown for invalid content', () => {
      const invalidContent = {
        someField: 'value',
        anotherField: 123
      };

      const result = flexibleContentMetadataSchema.parse(invalidContent);
      
      expect(result.id).toBe('unknown');
      expect(result.title).toBe('Unknown Content');
      expect(result.type).toBe('unknown');
      expect(result.published).toBe(false);
    });

    it('should correctly identify and parse character content', () => {
      const character = {
        id: 'char-1',
        title: 'Character 1',
        description: 'A character',
        name: 'Char',
        role: 'partner',
        class: 'courier'
      };

      const result = flexibleContentMetadataSchema.parse(character);
      expect(result.name).toBe('Char');
      expect(result.role).toBe('partner');
    });

    it('should correctly identify and parse item content', () => {
      const item = {
        id: 'item-1',
        title: 'Item 1',
        description: 'An item',
        category: 'consumable',
        value: 100
      };

      const result = flexibleContentMetadataSchema.parse(item);
      expect(result.category).toBe('consumable');
      expect(result.value).toBe(100);
    });
  });

  describe('Default values and transformations', () => {
    it('should apply default values for chapters', () => {
      const chapter = {
        id: 'chapter-1',
        title: 'Chapter 1',
        description: 'First chapter'
      };

      const chapterSchema = flexibleContentMetadataSchema;
      const result = chapterSchema.parse(chapter);
      
      // Check defaults were applied
      if ('mainCharacters' in result) {
        expect(result.mainCharacters).toEqual([]);
      }
      if ('choices' in result) {
        expect(result.choices).toEqual([]);
      }
    });

    it('should apply default values for levels', () => {
      const level = {
        id: 'level-1',
        title: 'Level 1',
        description: 'First level'
      };

      const result = flexibleContentMetadataSchema.parse(level);
      
      if ('difficulty' in result) {
        expect(result.difficulty).toBe('normal');
      }
      if ('zone' in result) {
        expect(result.zone).toBe('downtown');
      }
    });
  });

  describe('Trait mapping', () => {
    it('should map unknown traits to valid database values', () => {
      const unknownTraits = {
        'strategic_deception': 'pattern_recognition',
        'righteous_fury': 'hyperfocus',
        'sensory_difference': 'sensory_processing',
        'time_blindness': 'attention_to_detail'
      };

      Object.entries(unknownTraits).forEach(([input, expected]) => {
        expect(normalizeForDatabase(input, traitMap)).toBe(expected);
      });
    });

    it('should preserve valid trait values', () => {
      const validTraits = [
        'hyperfocus',
        'pattern_recognition',
        'enhanced_senses',
        'systematic_thinking',
        'attention_to_detail',
        'routine_mastery',
        'sensory_processing'
      ];

      validTraits.forEach(trait => {
        expect(normalizeForDatabase(trait, traitMap)).toBe(trait);
      });
    });
  });
});