import { z } from 'zod';
import { NEURODIVERGENT_TRAITS } from '@/lib/game/traits';
import type { StoredPartner as _StoredPartner } from '@/lib/schemas/game-schemas';

// Event type schema
export const EventTypeSchema = z.enum([
  'encounter',      // Meeting someone or something
  'discovery',      // Finding items or information
  'crisis',         // Urgent situations requiring quick decisions
  'opportunity',    // Chance for rewards with risk
  'story',          // Narrative-focused events
  'environmental',  // Weather, obstacles, etc.
  'corporate',      // WHIX-related events
  'social',         // Interaction with NPCs
  'technical',      // Tech/hacking challenges
  'moral',          // Ethical dilemmas
]);

export type EventType = z.infer<typeof EventTypeSchema>;

// Event rarity schema
export const EventRaritySchema = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']);
export type EventRarity = z.infer<typeof EventRaritySchema>;

// Event outcome schema
export const EventOutcomeSchema = z.object({
  id: z.string(),
  description: z.string(),
  effects: z.object({
    tips: z.number().optional(),
    experience: z.number().optional(),
    energy: z.number().optional(),
    humanityIndex: z.number().optional(),
    items: z.array(z.string()).optional(),
    partnerMorale: z.record(z.string(), z.number()).optional(),
    unlockStoryFlag: z.string().optional(),
    triggerCombat: z.boolean().optional(),
    triggerNextEvent: z.string().optional(),
  }),
  animation: z.enum(['success', 'failure', 'neutral', 'dramatic']).optional(),
});

export type EventOutcome = z.infer<typeof EventOutcomeSchema>;

// Event choice schema
export const EventChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  requirements: z.object({
    trait: z.string().optional(),
    class: z.string().optional(),
    minLevel: z.number().optional(),
    minTips: z.number().optional(),
    hasItem: z.string().optional(),
    storyFlag: z.string().optional(),
  }).optional(),
  rollDifficulty: z.number().min(1).max(20).optional(), // DC for dice roll
  outcomes: z.object({
    success: EventOutcomeSchema,
    failure: EventOutcomeSchema.optional(),
  }),
  isHidden: z.boolean().optional().default(false), // Hidden unless requirements met
});

export type EventChoice = z.infer<typeof EventChoiceSchema>;

// Random event schema
export const RandomEventSchema = z.object({
  id: z.string(),
  type: EventTypeSchema,
  rarity: EventRaritySchema,
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  ambientSound: z.string().optional(),
  choices: z.array(EventChoiceSchema),
  weight: z.number().default(1), // For weighted random selection
  requirements: z.object({
    minChapter: z.number().optional(),
    maxChapter: z.number().optional(),
    location: z.string().optional(),
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
    weather: z.string().optional(),
    hasPartnerClass: z.string().optional(),
    hasPartnerTrait: z.string().optional(),
    storyFlags: z.array(z.string()).optional(),
    excludeStoryFlags: z.array(z.string()).optional(),
  }).optional(),
  tags: z.array(z.string()).default([]), // For filtering and categorization
});

export type RandomEvent = z.infer<typeof RandomEventSchema>;

// Event context schema (passed to event resolution)
export const EventContextSchema = z.object({
  event: RandomEventSchema,
  activePartners: z.array(z.any()), // StoredPartner array
  chapter: z.number(),
  location: z.string(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
  weather: z.string().optional(),
  storyFlags: z.array(z.string()),
  previousEventId: z.string().optional(),
});

export type EventContext = z.infer<typeof EventContextSchema>;

// Event pool for random generation
const EVENT_POOL: RandomEvent[] = [
  {
    id: 'evt_lost_package',
    type: 'encounter',
    rarity: 'common',
    title: 'Lost Package',
    description: 'You find a damaged WHIX package on the street. The label is partially torn, but you can make out an address in the Neon District.',
    choices: [
      {
        id: 'deliver',
        text: 'Deliver the package to its destination',
        rollDifficulty: 10,
        isHidden: false,
        outcomes: {
          success: {
            id: 'deliver_success',
            description: 'You successfully deliver the package and receive a tip from a grateful customer.',
            effects: {
              tips: 50,
              experience: 20,
              humanityIndex: 1,
            },
            animation: 'success',
          },
          failure: {
            id: 'deliver_fail',
            description: 'You get lost trying to find the address and waste valuable time.',
            effects: {
              energy: -10,
              experience: 5,
            },
            animation: 'failure',
          },
        },
      },
      {
        id: 'investigate',
        text: 'Investigate the package contents',
        requirements: {
          trait: 'attention_to_detail',
        },
        isHidden: false,
        outcomes: {
          success: {
            id: 'investigate_success',
            description: 'You carefully examine the package and discover valuable corporate data inside.',
            effects: {
              tips: 100,
              experience: 30,
              humanityIndex: -1,
              unlockStoryFlag: 'found_corporate_data',
            },
            animation: 'dramatic',
          },
        },
      },
      {
        id: 'ignore',
        text: 'Leave the package and continue',
        isHidden: false,
        outcomes: {
          success: {
            id: 'ignore_outcome',
            description: 'You decide it\'s not worth the risk and continue on your way.',
            effects: {
              experience: 5,
            },
            animation: 'neutral',
          },
        },
      },
    ],
    weight: 10,
    tags: ['delivery', 'moral_choice'],
  },
  {
    id: 'evt_rogue_drone',
    type: 'crisis',
    rarity: 'uncommon',
    title: 'Rogue Security Drone',
    description: 'A malfunctioning WHIX security drone blocks your path, its weapons systems spinning up erratically.',
    choices: [
      {
        id: 'hack',
        text: 'Attempt to hack the drone',
        isHidden: false,
        requirements: {
          class: 'investigator',
        },
        rollDifficulty: 15,
        outcomes: {
          success: {
            id: 'hack_success',
            description: 'You successfully hack the drone and repurpose it for parts.',
            effects: {
              items: ['drone_parts'],
              experience: 40,
            },
            animation: 'success',
          },
          failure: {
            id: 'hack_fail',
            description: 'Your hack attempt fails and triggers combat protocols!',
            effects: {
              triggerCombat: true,
            },
            animation: 'dramatic',
          },
        },
      },
      {
        id: 'distract',
        text: 'Create a distraction',
        isHidden: false,
        requirements: {
          trait: 'hyperfocus',
        },
        rollDifficulty: 12,
        outcomes: {
          success: {
            id: 'distract_success',
            description: 'You create a clever distraction and slip past unnoticed.',
            effects: {
              experience: 25,
              energy: -5,
            },
            animation: 'success',
          },
          failure: {
            id: 'distract_fail',
            description: 'Your distraction backfires, drawing more drones to your location.',
            effects: {
              energy: -15,
              triggerCombat: true,
            },
            animation: 'failure',
          },
        },
      },
      {
        id: 'fight',
        text: 'Engage in combat',
        isHidden: false,
        outcomes: {
          success: {
            id: 'fight_outcome',
            description: 'You prepare for battle against the malfunctioning drone.',
            effects: {
              triggerCombat: true,
            },
            animation: 'dramatic',
          },
        },
      },
    ],
    weight: 5,
    requirements: {
      minChapter: 2,
    },
    tags: ['combat', 'tech', 'crisis'],
  },
  {
    id: 'evt_street_philosopher',
    type: 'social',
    rarity: 'rare',
    title: 'The Street Philosopher',
    description: 'An old courier sits by a flickering neon sign, offering wisdom to those who\'ll listen. "The corps want us to think we\'re broken," they say, "but maybe we\'re just different pieces of the same machine."',
    choices: [
      {
        id: 'listen',
        text: 'Sit and listen to their stories',
        isHidden: false,
        outcomes: {
          success: {
            id: 'listen_outcome',
            description: 'The philosopher shares insights about finding humanity in a corporate world. Your team feels inspired.',
            effects: {
              humanityIndex: 3,
              partnerMorale: { all: 10 },
              experience: 15,
            },
            animation: 'success',
          },
        },
      },
      {
        id: 'debate',
        text: 'Engage in philosophical debate',
        isHidden: false,
        requirements: {
          trait: 'systematic_thinking',
        },
        rollDifficulty: 13,
        outcomes: {
          success: {
            id: 'debate_success',
            description: 'Your thoughtful arguments impress the philosopher. They share a secret about WHIX\'s true nature.',
            effects: {
              experience: 50,
              humanityIndex: 2,
              unlockStoryFlag: 'philosopher_secret',
            },
            animation: 'dramatic',
          },
          failure: {
            id: 'debate_fail',
            description: 'The debate becomes heated. You leave feeling frustrated and questioning your beliefs.',
            effects: {
              humanityIndex: -1,
              partnerMorale: { all: -5 },
            },
            animation: 'failure',
          },
        },
      },
      {
        id: 'offer_tips',
        text: 'Offer them some tips',
        isHidden: false,
        requirements: {
          minTips: 50,
        },
        outcomes: {
          success: {
            id: 'tips_outcome',
            description: 'The philosopher gratefully accepts your donation and blesses your journey.',
            effects: {
              tips: -50,
              humanityIndex: 2,
              experience: 10,
            },
            animation: 'success',
          },
        },
      },
    ],
    weight: 3,
    tags: ['social', 'philosophy', 'humanity'],
  },
  {
    id: 'evt_glitch_in_matrix',
    type: 'technical',
    rarity: 'epic',
    title: 'Glitch in the System',
    description: 'Reality flickers around you. For a moment, you see the city\'s AR overlay malfunction, revealing the stark truth beneath the corporate illusion.',
    choices: [
      {
        id: 'investigate_glitch',
        text: 'Investigate the anomaly',
        isHidden: false,
        requirements: {
          trait: 'pattern_recognition',
        },
        rollDifficulty: 18,
        outcomes: {
          success: {
            id: 'glitch_success',
            description: 'You discover a hidden backdoor in WHIX\'s neural network. This could be valuable to the right people.',
            effects: {
              experience: 100,
              unlockStoryFlag: 'neural_backdoor',
              items: ['encrypted_data'],
            },
            animation: 'dramatic',
          },
          failure: {
            id: 'glitch_fail',
            description: 'The system detects your intrusion. Corporate security is now aware of your location.',
            effects: {
              energy: -20,
              triggerNextEvent: 'evt_corporate_enforcement',
            },
            animation: 'failure',
          },
        },
      },
      {
        id: 'document',
        text: 'Document what you see',
        isHidden: false,
        requirements: {
          trait: 'attention_to_detail',
        },
        outcomes: {
          success: {
            id: 'document_outcome',
            description: 'You carefully record the glitch. This evidence could be useful later.',
            effects: {
              experience: 50,
              items: ['glitch_recording'],
              humanityIndex: 1,
            },
            animation: 'success',
          },
        },
      },
      {
        id: 'flee',
        text: 'Get away quickly',
        isHidden: false,
        outcomes: {
          success: {
            id: 'flee_outcome',
            description: 'You decide discretion is the better part of valor and leave immediately.',
            effects: {
              energy: -10,
              experience: 10,
            },
            animation: 'neutral',
          },
        },
      },
    ],
    weight: 1,
    requirements: {
      minChapter: 3,
      timeOfDay: 'night',
    },
    tags: ['tech', 'mystery', 'corporate'],
  },
];

// Random event generation system
export class RandomEventSystem {
  private static instance: RandomEventSystem;
  private eventPool: RandomEvent[] = EVENT_POOL;
  
  private constructor() {}
  
  static getInstance(): RandomEventSystem {
    if (!this.instance) {
      this.instance = new RandomEventSystem();
    }
    return this.instance;
  }
  
  // Add custom events to the pool
  addEvents(events: RandomEvent[]) {
    this.eventPool.push(...events);
  }
  
  // Generate a random event based on context
  generateEvent(context: Omit<EventContext, 'event'>): RandomEvent | null {
    // Filter events based on requirements
    const eligibleEvents = this.eventPool.filter(event => 
      this.meetsRequirements(event, context)
    );
    
    if (eligibleEvents.length === 0) return null;
    
    // Calculate total weight
    const totalWeight = eligibleEvents.reduce((sum, event) => sum + event.weight, 0);
    
    // Select random event based on weight
    let random = Math.random() * totalWeight;
    for (const event of eligibleEvents) {
      random -= event.weight;
      if (random <= 0) {
        return this.personalizeEvent(event, context);
      }
    }
    
    // Fallback
    return eligibleEvents[0];
  }
  
  // Check if event requirements are met
  private meetsRequirements(
    event: RandomEvent, 
    context: Omit<EventContext, 'event'>
  ): boolean {
    const req = event.requirements;
    if (!req) return true;
    
    // Chapter requirements
    if (req.minChapter && context.chapter < req.minChapter) return false;
    if (req.maxChapter && context.chapter > req.maxChapter) return false;
    
    // Location requirements
    if (req.location && context.location !== req.location) return false;
    
    // Time requirements
    if (req.timeOfDay && context.timeOfDay !== req.timeOfDay) return false;
    
    // Weather requirements
    if (req.weather && context.weather !== req.weather) return false;
    
    // Partner requirements
    if (req.hasPartnerClass) {
      const hasClass = context.activePartners.some(p => p.class === req.hasPartnerClass);
      if (!hasClass) return false;
    }
    
    if (req.hasPartnerTrait) {
      const hasTrait = context.activePartners.some(p => 
        p.primaryTrait === req.hasPartnerTrait ||
        p.secondaryTrait === req.hasPartnerTrait ||
        p.tertiaryTrait === req.hasPartnerTrait
      );
      if (!hasTrait) return false;
    }
    
    // Story flag requirements
    if (req.storyFlags) {
      const hasAllFlags = req.storyFlags.every(flag => 
        context.storyFlags.includes(flag)
      );
      if (!hasAllFlags) return false;
    }
    
    if (req.excludeStoryFlags) {
      const hasExcludedFlag = req.excludeStoryFlags.some(flag => 
        context.storyFlags.includes(flag)
      );
      if (hasExcludedFlag) return false;
    }
    
    return true;
  }
  
  // Personalize event based on active partners
  private personalizeEvent(
    event: RandomEvent, 
    context: Omit<EventContext, 'event'>
  ): RandomEvent {
    // Clone the event to avoid mutating the original
    const personalizedEvent = JSON.parse(JSON.stringify(event)) as RandomEvent;
    
    // Add partner-specific choices based on their traits
    for (const partner of context.activePartners) {
      // Check primary trait for special options
      if (partner.primaryTrait && partner.primaryTrait in NEURODIVERGENT_TRAITS) {
        // Example: Add hyperfocus-specific choice for certain events
        if (partner.primaryTrait === 'hyperfocus' && event.type === 'technical') {
          const hyperfocusChoice: EventChoice = {
            id: `hyperfocus_${partner.id}`,
            text: `[${partner.name}] Use hyperfocus to solve quickly`,
            requirements: {
              trait: 'hyperfocus',
            },
            rollDifficulty: 8, // Easier with trait
            outcomes: {
              success: {
                id: 'hyperfocus_success',
                description: `${partner.name}'s intense focus pays off, solving the problem in record time.`,
                effects: {
                  experience: 60,
                  energy: -15,
                  partnerMorale: { [partner.id]: 15 },
                },
                animation: 'success',
              },
              failure: {
                id: 'hyperfocus_fail',
                description: `${partner.name} becomes too focused and misses important details.`,
                effects: {
                  energy: -20,
                  partnerMorale: { [partner.id]: -10 },
                },
                animation: 'failure',
              },
            },
            isHidden: false,
          };
          
          // Only add if not already present
          if (!personalizedEvent.choices.some(c => c.id === hyperfocusChoice.id)) {
            personalizedEvent.choices.push(hyperfocusChoice);
          }
        }
      }
    }
    
    return personalizedEvent;
  }
  
  // Get events by type
  getEventsByType(type: EventType): RandomEvent[] {
    return this.eventPool.filter(event => event.type === type);
  }
  
  // Get events by rarity
  getEventsByRarity(rarity: EventRarity): RandomEvent[] {
    return this.eventPool.filter(event => event.rarity === rarity);
  }
  
  // Get events by tags
  getEventsByTags(tags: string[]): RandomEvent[] {
    return this.eventPool.filter(event => 
      tags.some(tag => event.tags.includes(tag))
    );
  }
}

// Export singleton instance
export const randomEventSystem = RandomEventSystem.getInstance();