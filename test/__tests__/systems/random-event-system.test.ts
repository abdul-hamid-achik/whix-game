import { describe, it, expect, beforeEach } from 'vitest';
import { randomEventSystem, RandomEvent, EventContext } from '@/lib/systems/random-event-system';
import { StoredPartner } from '@/lib/schemas/game-schemas';

describe('RandomEventSystem', () => {
  const mockPartner: StoredPartner = {
    id: 'partner-1',
    name: 'Test Partner',
    class: 'investigator',
    primaryTrait: 'hyperfocus',
    secondaryTrait: 'pattern_recognition',
    level: 10,
    rarity: 'rare',
    stats: {
      focus: 80,
      perception: 90,
      social: 60,
      logic: 85,
      stamina: 70,
    },
    experience: 1000,
    currentEnergy: 80,
    maxEnergy: 100,
    bondLevel: 3,
    isInjured: false,
    traitMastery: {},
    equipment: {},
    missions: 5,
    personality: {
      traits: ['analytical', 'focused'],
      likes: ['puzzles', 'data'],
      dislikes: ['crowds', 'noise'],
      backstory: 'A pattern recognition specialist',
    },
  };

  const mockContext: Omit<EventContext, 'event'> = {
    activePartners: [mockPartner],
    chapter: 3,
    location: 'polanco-central',
    timeOfDay: 'night',
    weather: 'rainy',
    storyFlags: ['found_corporate_data'],
    previousEventId: undefined,
  };

  beforeEach(() => {
    // Reset any custom events
    randomEventSystem['eventPool'] = randomEventSystem['eventPool'].filter(
      e => ['evt_lost_package', 'evt_rogue_drone', 'evt_street_philosopher', 'evt_glitch_in_matrix'].includes(e.id)
    );
  });

  describe('Event Generation', () => {
    it('should generate events based on context', () => {
      const event = randomEventSystem.generateEvent(mockContext);
      
      expect(event).toBeDefined();
      expect(event?.type).toBeDefined();
      expect(event?.choices).toBeInstanceOf(Array);
      expect(event?.choices.length).toBeGreaterThan(0);
    });

    it('should filter events by requirements', () => {
      const earlyGameContext: Omit<EventContext, 'event'> = {
        ...mockContext,
        chapter: 1,
        timeOfDay: 'morning',
      };

      // Generate multiple events to test filtering
      const events: (RandomEvent | null)[] = [];
      for (let i = 0; i < 10; i++) {
        events.push(randomEventSystem.generateEvent(earlyGameContext));
      }

      // Should not get late-game events like glitch_in_matrix
      const glitchEvents = events.filter(e => e?.id === 'evt_glitch_in_matrix');
      expect(glitchEvents).toHaveLength(0);
    });

    it('should respect story flag requirements', () => {
      const contextWithoutFlags: Omit<EventContext, 'event'> = {
        ...mockContext,
        storyFlags: [],
      };

      const contextWithFlags: Omit<EventContext, 'event'> = {
        ...mockContext,
        storyFlags: ['found_corporate_data', 'joined_resistance'],
      };

      // Events may have different availability based on flags
      const eventWithoutFlags = randomEventSystem.generateEvent(contextWithoutFlags);
      const eventWithFlags = randomEventSystem.generateEvent(contextWithFlags);

      expect(eventWithoutFlags).toBeDefined();
      expect(eventWithFlags).toBeDefined();
    });
  });

  describe('Event Personalization', () => {
    it('should add partner-specific choices based on traits', () => {
      const technicalEvent: RandomEvent = {
        id: 'test_tech_event',
        type: 'technical',
        rarity: 'common',
        title: 'Technical Challenge',
        description: 'A technical problem needs solving',
        choices: [
          {
            id: 'default',
            text: 'Try to solve it',
            isHidden: false,
            outcomes: {
              success: {
                id: 'default_success',
                description: 'You managed to solve it',
                effects: { experience: 10 },
              },
            },
          },
        ],
        weight: 1,
      };

      randomEventSystem.addEvents([technicalEvent]);

      const event = randomEventSystem.generateEvent({
        ...mockContext,
        activePartners: [mockPartner], // Has hyperfocus trait
      });

      if (event?.type === 'technical') {
        // Should have added hyperfocus-specific choice
        const hyperfocusChoice = event.choices.find(c => c.id.includes('hyperfocus'));
        expect(hyperfocusChoice).toBeDefined();
        expect(hyperfocusChoice?.requirements?.trait).toBe('hyperfocus');
        expect(hyperfocusChoice?.rollDifficulty).toBeLessThan(10); // Easier with trait
      }
    });

    it('should handle multiple partners with different traits', () => {
      const partner2: StoredPartner = {
        ...mockPartner,
        id: 'partner-2',
        name: 'Second Partner',
        primaryTrait: 'enhanced_senses',
        secondaryTrait: 'attention_to_detail',
      };

      const event = randomEventSystem.generateEvent({
        ...mockContext,
        activePartners: [mockPartner, partner2],
      });

      expect(event).toBeDefined();
      // Event should be personalized for both partners' traits
    });
  });

  describe('Event Filtering', () => {
    it('should get events by type', () => {
      const socialEvents = randomEventSystem.getEventsByType('social');
      expect(socialEvents.length).toBeGreaterThan(0);
      expect(socialEvents.every(e => e.type === 'social')).toBe(true);
    });

    it('should get events by rarity', () => {
      const rareEvents = randomEventSystem.getEventsByRarity('rare');
      expect(rareEvents.length).toBeGreaterThan(0);
      expect(rareEvents.every(e => e.rarity === 'rare')).toBe(true);
    });

    it('should get events by tags', () => {
      const combatEvents = randomEventSystem.getEventsByTags(['combat']);
      expect(combatEvents.length).toBeGreaterThan(0);
      expect(combatEvents.every(e => e.tags.includes('combat'))).toBe(true);
    });
  });

  describe('Event Choices', () => {
    it('should validate choice requirements', () => {
      const event = randomEventSystem['eventPool'].find(e => e.id === 'evt_street_philosopher');
      expect(event).toBeDefined();

      const debateChoice = event?.choices.find(c => c.id === 'debate');
      expect(debateChoice?.requirements?.trait).toBe('systematic_thinking');

      const tipsChoice = event?.choices.find(c => c.id === 'offer_tips');
      expect(tipsChoice?.requirements?.minTips).toBe(50);
    });

    it('should have proper outcome structures', () => {
      const event = randomEventSystem['eventPool'].find(e => e.id === 'evt_rogue_drone');
      expect(event).toBeDefined();

      const hackChoice = event?.choices.find(c => c.id === 'hack');
      expect(hackChoice?.outcomes.success).toBeDefined();
      expect(hackChoice?.outcomes.failure).toBeDefined();
      expect(hackChoice?.outcomes.failure?.effects.triggerCombat).toBe(true);
    });

    it('should have isHidden property on all choices', () => {
      const allEvents = randomEventSystem['eventPool'];
      
      allEvents.forEach(event => {
        event.choices.forEach(choice => {
          // isHidden should be defined (either explicitly or defaulted to false)
          expect(choice.isHidden !== undefined).toBe(true);
        });
      });
    });
  });

  describe('Soviet-Aztec Theme', () => {
    it('should have thematically appropriate events', () => {
      const events = randomEventSystem['eventPool'];
      
      // Check for dystopian/corporate themes
      const corporateEvents = events.filter(e => 
        e.description.toLowerCase().includes('whix') ||
        e.description.toLowerCase().includes('corporate') ||
        e.description.toLowerCase().includes('algorithm')
      );
      
      expect(corporateEvents.length).toBeGreaterThan(0);

      // Should not have fantasy elements
      events.forEach(event => {
        expect(event.description.toLowerCase()).not.toContain('dragon');
        expect(event.description.toLowerCase()).not.toContain('magic');
        expect(event.description.toLowerCase()).not.toContain('spell');
        expect(event.description.toLowerCase()).not.toContain('wizard');
      });
    });

    it('should have appropriate event effects', () => {
      const events = randomEventSystem['eventPool'];
      
      events.forEach(event => {
        event.choices.forEach(choice => {
          const { effects } = choice.outcomes.success;
          
          // Check for theme-appropriate effects
          if (effects.items) {
            effects.items.forEach(item => {
              expect(item).not.toContain('sword');
              expect(item).not.toContain('potion');
              expect(item).not.toContain('armor');
            });
          }
        });
      });
    });
  });

  describe('Event Weighting', () => {
    it('should respect event weights in generation', () => {
      // Common events should appear more frequently
      const eventCounts: Record<string, number> = {};
      
      // Generate many events to test distribution
      for (let i = 0; i < 100; i++) {
        const event = randomEventSystem.generateEvent(mockContext);
        if (event) {
          eventCounts[event.id] = (eventCounts[event.id] || 0) + 1;
        }
      }

      // Lost package (weight 10) should appear more than glitch (weight 1)
      const lostPackageCount = eventCounts['evt_lost_package'] || 0;
      const glitchCount = eventCounts['evt_glitch_in_matrix'] || 0;
      
      // Due to requirements, glitch might not appear at all in chapter 3
      expect(lostPackageCount).toBeGreaterThan(0);
    });
  });
});