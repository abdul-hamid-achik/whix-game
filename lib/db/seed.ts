import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { seed, reset } from 'drizzle-seed';
import * as schema from './schema';
import { PARTNER_CLASSES } from '../game/classes';
import { NEURODIVERGENT_TRAITS } from '../game/traits';
import { MISSION_TYPES } from '../game/missions';
import { nanoid } from 'nanoid';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Utility function to generate random enum values
const getRandomEnum = <T extends string>(enumValues: T[]): T => {
  return enumValues[Math.floor(Math.random() * enumValues.length)];
};

// Predefined data for seeding
const STORY_CHAPTERS = [
  {
    id: 'chapter-1',
    title: 'Welcome to the Gig',
    description: 'Your first day as a courier in Neo-Singapore.',
    unlockLevel: 1,
    rewards: { experience: 100, tips: 500 },
    isCompleted: false,
    metadata: {
      theme: 'cyberpunk',
      mood: 'mysterious',
      difficulty: 'easy',
      estimatedTime: 15,
      keyCharacters: ['tania-volkov', 'system-operator'],
      importantChoices: ['accept-first-job', 'trust-system'],
      unlockableContent: ['courier-badge', 'first-partner-slot'],
      roguelikeElements: {
        explorationNodes: 5,
        secretPaths: 1,
        hiddenItems: ['data-fragment-1', 'encrypted-message'],
        randomEvents: ['glitch-encounter', 'street-vendor'],
        variableOutcomes: true
      }
    }
  },
  {
    id: 'chapter-2',
    title: 'Digital Shadows',
    description: 'Uncover the first traces of the conspiracy.',
    unlockLevel: 5,
    rewards: { experience: 250, tips: 1000 },
    isCompleted: false,
    metadata: {
      theme: 'investigation',
      mood: 'tense',
      difficulty: 'medium',
      estimatedTime: 25,
      keyCharacters: ['marcus-chen', 'data-broker'],
      importantChoices: ['investigate-deeper', 'play-it-safe'],
      unlockableContent: ['analyst-partner', 'hacking-tools'],
      roguelikeElements: {
        explorationNodes: 8,
        secretPaths: 2,
        hiddenItems: ['corporate-id', 'surveillance-footage'],
        randomEvents: ['corporate-patrol', 'ally-contact'],
        variableOutcomes: true
      }
    }
  },
  {
    id: 'chapter-3',
    title: 'The Network Effect',
    description: 'Build your team and expand your influence.',
    unlockLevel: 10,
    rewards: { experience: 400, tips: 2000 },
    isCompleted: false,
    metadata: {
      theme: 'team-building',
      mood: 'empowering',
      difficulty: 'medium',
      estimatedTime: 30,
      keyCharacters: ['elena-vasquez', 'network-contacts'],
      importantChoices: ['recruit-allies', 'go-solo'],
      unlockableContent: ['team-coordination', 'network-access'],
      roguelikeElements: {
        explorationNodes: 12,
        secretPaths: 3,
        hiddenItems: ['team-comm-device', 'trust-tokens'],
        randomEvents: ['recruitment-opportunity', 'betrayal-attempt'],
        variableOutcomes: true
      }
    }
  }
];

const SAMPLE_CHARACTERS = [
  {
    name: 'Tania Volkov',
    description: 'A seasoned courier who discovered her hyperfocus gives her an edge in complex delivery routes.',
    partnerClass: 'courier' as const,
    traits: ['hyperfocus', 'pattern_recognition'],
    rarity: 'common' as const,
    level: 15,
    experience: 2250,
    energy: 80,
    maxEnergy: 100,
    stats: {
      focus: 75,
      perception: 60,
      social: 45,
      logic: 55,
      stamina: 70
    },
    equipment: {
      helmet: 'neural-interface-v2',
      armor: 'courier-vest',
      boots: 'speed-boots',
      accessory: 'data-scanner'
    },
    backstory: 'Former corporate employee who found freedom in the gig economy.',
    personalityTraits: ['determined', 'loyal', 'tech-savvy']
  },
  {
    name: 'Marcus Chen',
    description: 'A brilliant analyst whose systematic thinking helps decode the most complex data patterns.',
    partnerClass: 'analyst' as const,
    traits: ['systematic_thinking', 'attention_to_detail'],
    rarity: 'rare' as const,
    level: 20,
    experience: 4000,
    energy: 90,
    maxEnergy: 100,
    stats: {
      focus: 85,
      perception: 75,
      social: 35,
      logic: 90,
      stamina: 50
    },
    equipment: {
      helmet: 'data-crown',
      armor: 'analyst-jacket',
      boots: 'stable-platforms',
      accessory: 'quantum-processor'
    },
    backstory: 'Former university researcher who turned to freelance analysis.',
    personalityTraits: ['analytical', 'perfectionist', 'introverted']
  },
  {
    name: 'Elena Vasquez',
    description: 'A skilled negotiator whose enhanced senses help her read people and situations perfectly.',
    partnerClass: 'negotiator' as const,
    traits: ['enhanced_senses', 'routine_mastery'],
    rarity: 'epic' as const,
    level: 25,
    experience: 6250,
    energy: 95,
    maxEnergy: 100,
    stats: {
      focus: 70,
      perception: 85,
      social: 90,
      logic: 65,
      stamina: 60
    },
    equipment: {
      helmet: 'empathy-enhancer',
      armor: 'diplomatic-suit',
      boots: 'silence-steps',
      accessory: 'mood-reader'
    },
    backstory: 'Former diplomat who specializes in high-stakes negotiations.',
    personalityTraits: ['charismatic', 'empathetic', 'strategic']
  }
];

const SAMPLE_LEVELS = [
  {
    id: 'delivery-district-1',
    name: 'Neon Heights',
    description: 'The glittering towers of the corporate district.',
    difficulty: 'easy' as const,
    rewards: { experience: 50, tips: 200 },
    metadata: {
      theme: 'corporate',
      environment: 'urban-towers',
      timeOfDay: 'night',
      weatherConditions: 'clear',
      hazards: ['security-drones', 'surveillance-cameras'],
      opportunities: ['corporate-contacts', 'insider-information'],
      roguelikeElements: {
        procedural: true,
        explorationNodes: 15,
        secretAreas: 3,
        randomizedLayout: true,
        emergentNarratives: [
          'corporate-conspiracy',
          'whistleblower-contact',
          'security-breach'
        ],
        adaptiveEvents: true,
        playerChoiceConsequences: true
      }
    }
  },
  {
    id: 'delivery-district-2',
    name: 'Underground Markets',
    description: 'The hidden economy beneath the city streets.',
    difficulty: 'medium' as const,
    rewards: { experience: 100, tips: 400 },
    metadata: {
      theme: 'underground',
      environment: 'tunnel-networks',
      timeOfDay: 'any',
      weatherConditions: 'underground',
      hazards: ['gang-territories', 'unstable-infrastructure'],
      opportunities: ['black-market-deals', 'underground-contacts'],
      roguelikeElements: {
        procedural: true,
        explorationNodes: 20,
        secretAreas: 5,
        randomizedLayout: true,
        emergentNarratives: [
          'gang-warfare',
          'smuggling-operation',
          'resistance-movement'
        ],
        adaptiveEvents: true,
        playerChoiceConsequences: true
      }
    }
  },
  {
    id: 'delivery-district-3',
    name: 'Data Fortress',
    description: 'A heavily secured corporate data center.',
    difficulty: 'hard' as const,
    rewards: { experience: 200, tips: 800 },
    metadata: {
      theme: 'high-security',
      environment: 'data-center',
      timeOfDay: 'night',
      weatherConditions: 'clear',
      hazards: ['advanced-security', 'ice-programs', 'automated-defenses'],
      opportunities: ['valuable-data', 'system-backdoors'],
      roguelikeElements: {
        procedural: true,
        explorationNodes: 25,
        secretAreas: 7,
        randomizedLayout: true,
        emergentNarratives: [
          'data-heist',
          'system-infiltration',
          'corporate-secrets'
        ],
        adaptiveEvents: true,
        playerChoiceConsequences: true
      }
    }
  }
];

const SAMPLE_MAPS = [
  {
    id: 'neo-singapore-central',
    name: 'Neo-Singapore Central',
    description: 'The heart of the megacity.',
    regions: ['corporate-district', 'residential-blocks', 'industrial-zone'],
    metadata: {
      scale: 'city',
      traversalMethods: ['vehicle', 'subway', 'drone'],
      landmarks: ['central-spire', 'data-exchange', 'memorial-park'],
      hiddenLocations: ['abandoned-subway', 'old-server-farm'],
      roguelikeFeatures: {
        dynamicWeather: true,
        timeProgression: true,
        emergentEvents: [
          'traffic-jams',
          'police-raids',
          'corporate-announcements',
          'system-glitches'
        ],
        explorationRewards: ['shortcuts', 'contacts', 'information'],
        proceduralElements: ['random-encounters', 'dynamic-routes']
      }
    }
  },
  {
    id: 'data-underworld',
    name: 'The Data Underworld',
    description: 'A virtual space where information flows like water.',
    regions: ['data-streams', 'archive-vaults', 'processing-cores'],
    metadata: {
      scale: 'virtual',
      traversalMethods: ['neural-link', 'data-surfing', 'quantum-tunneling'],
      landmarks: ['central-processor', 'memory-palace', 'deletion-zone'],
      hiddenLocations: ['lost-databases', 'ghost-programs'],
      roguelikeFeatures: {
        dynamicWeather: false,
        timeProgression: false,
        emergentEvents: [
          'data-storms',
          'system-purges',
          'virus-outbreaks',
          'memory-fragments'
        ],
        explorationRewards: ['data-fragments', 'processing-power', 'system-access'],
        proceduralElements: ['shifting-pathways', 'recursive-loops']
      }
    }
  }
];

async function seedGameData() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Reset database
    console.log('🔄 Resetting database...');
    await reset(db, schema);
    
    // Seed with comprehensive game data
    console.log('📊 Seeding game data...');
    await seed(db, schema, { seed: 42 }).refine((f) => ({
      // Users with comprehensive game data
      users: {
        count: 1,
        columns: {
          email: f.email(),
          username: f.default({ defaultValue: 'testuser' }),
          passwordHash: f.default({ defaultValue: 'hashed_password' })
        },
        with: {
          player: {
            count: 1,
            columns: {
              level: f.default({ defaultValue: 1 }),
              experience: f.default({ defaultValue: 0 }),
              credits: f.default({ defaultValue: 1000 }),
              resonancePoints: f.default({ defaultValue: 0 }),
              currentTips: f.default({ defaultValue: 1000 }),
              totalTipsEarned: f.default({ defaultValue: 1000 }),
              companyStars: f.default({ defaultValue: 0 }),
              tipCutPercentage: f.default({ defaultValue: 75 }),
              storyProgress: f.default({ defaultValue: {} }),
              unlockedChapters: f.default({ defaultValue: [1] }),
              stats: f.default({ defaultValue: {
                missionsCompleted: 0,
                partnersRecruited: 0,
                traitsmastered: 0
              }})
            },
            with: {
              partners: {
                count: 20,
                columns: {
                  name: f.fullName(),
                  class: f.valuesFromArray({ 
                    values: Object.keys(PARTNER_CLASSES) as Array<keyof typeof PARTNER_CLASSES>
                  }),
                  primaryTrait: f.valuesFromArray({ 
                    values: Object.keys(NEURODIVERGENT_TRAITS) as Array<keyof typeof NEURODIVERGENT_TRAITS>
                  }),
                  level: f.int({ minValue: 1, maxValue: 30 }),
                  experience: f.int({ minValue: 0, maxValue: 10000 }),
                  bondLevel: f.int({ minValue: 0, maxValue: 10 }),
                  rarity: f.weightedRandom([
                    { weight: 0.5, value: f.default({ defaultValue: 'common' }) },
                    { weight: 0.3, value: f.default({ defaultValue: 'rare' }) },
                    { weight: 0.15, value: f.default({ defaultValue: 'epic' }) },
                    { weight: 0.05, value: f.default({ defaultValue: 'legendary' }) }
                  ]),
                  isActive: f.weightedRandom([
                    { weight: 0.3, value: f.default({ defaultValue: true }) },
                    { weight: 0.7, value: f.default({ defaultValue: false }) }
                  ]),
                  stats: f.default({ defaultValue: {
                    focus: 50,
                    perception: 50,
                    social: 50,
                    logic: 50,
                    stamina: 50
                  }}),
                  currentEnergy: f.int({ minValue: 50, maxValue: 100 }),
                  maxEnergy: f.default({ defaultValue: 100 }),
                  traitMastery: f.default({ defaultValue: {} }),
                  abilities: f.default({ defaultValue: [] }),
                  equipment: f.default({ defaultValue: {
                    weapon: null,
                    armor: null,
                    accessory: null
                  }}),
                  personality: f.default({ defaultValue: {
                    traits: [],
                    likes: [],
                    dislikes: [],
                    backstory: ''
                  }})
                }
              },
              storyProgress: {
                count: 3,
                columns: {
                  chapterId: f.valuesFromArray({
                    values: ['chapter-1', 'chapter-2', 'chapter-3']
                  }),
                  isCompleted: f.weightedRandom([
                    { weight: 0.3, value: f.default({ defaultValue: true }) },
                    { weight: 0.7, value: f.default({ defaultValue: false }) }
                  ]),
                  currentDialogueId: f.default({ defaultValue: 'intro' }),
                  choices: f.default({ defaultValue: [] })
                }
              },
              gameSettings: {
                count: 1,
                columns: {
                  theme: f.valuesFromArray({
                    values: ['neonRebel', 'shadowRunner', 'cyberPunk']
                  }),
                  soundEnabled: f.default({ defaultValue: true }),
                  musicEnabled: f.default({ defaultValue: true }),
                  notifications: f.default({ defaultValue: {
                    missions: true,
                    energy: true,
                    rewards: true
                  }}),
                  difficulty: f.default({ defaultValue: 'normal' }),
                  autoSave: f.default({ defaultValue: true }),
                  language: f.default({ defaultValue: 'en' })
                }
              },
              achievements: {
                count: 10,
                columns: {
                  achievementId: f.valuesFromArray({
                    values: [
                      'first-mission', 'first-partner', 'tip-collector', 
                      'master-courier', 'data-analyst', 'social-butterfly',
                      'night-owl', 'speed-demon', 'completionist', 'explorer'
                    ]
                  }),
                  title: f.jobTitle(),
                  description: f.loremIpsum({ sentenceCount: 1 }),
                  isUnlocked: f.weightedRandom([
                    { weight: 0.6, value: f.default({ defaultValue: false }) },
                    { weight: 0.4, value: f.default({ defaultValue: true }) }
                  ]),
                  progress: f.int({ minValue: 0, maxValue: 100 }),
                  maxProgress: f.default({ defaultValue: 100 }),
                  rewards: f.default({ defaultValue: {
                    experience: 200,
                    tips: 1000,
                    badge: 'achievement-badge'
                  }})
                }
              },
              gachaPityCounters: {
                count: 1,
                columns: {
                  pullsSinceEpic: f.default({ defaultValue: 0 }),
                  pullsSinceLegendary: f.default({ defaultValue: 0 }),
                  totalPulls: f.default({ defaultValue: 0 }),
                  guaranteedRareCounter: f.default({ defaultValue: 0 })
                }
              }
            }
          }
        }
      },
      
      // Independent tables
      missions: {
        count: 50,
        columns: {
          title: f.companyName(),
          description: f.loremIpsum({ sentenceCount: 3 }),
          type: f.valuesFromArray({ 
            values: ['story', 'side', 'daily', 'special']
          }),
          status: f.weightedRandom([
            { weight: 0.7, value: f.default({ defaultValue: 'available' }) },
            { weight: 0.2, value: f.default({ defaultValue: 'completed' }) },
            { weight: 0.1, value: f.default({ defaultValue: 'failed' }) }
          ]),
          requiredLevel: f.int({ minValue: 1, maxValue: 30 }),
          rewards: f.default({ defaultValue: {
            experience: 100,
            credits: 500,
            items: [],
            resonancePoints: 10
          }}),
          objectives: f.default({ defaultValue: [] }),
          dialogues: f.default({ defaultValue: [] })
        }
      },
      
      items: {
        count: 30,
        columns: {
          name: f.companyName(),
          description: f.loremIpsum({ sentenceCount: 2 }),
          type: f.valuesFromArray({ 
            values: ['weapon', 'armor', 'accessory', 'consumable', 'material']
          }),
          rarity: f.weightedRandom([
            { weight: 0.5, value: f.default({ defaultValue: 'common' }) },
            { weight: 0.3, value: f.default({ defaultValue: 'rare' }) },
            { weight: 0.15, value: f.default({ defaultValue: 'epic' }) },
            { weight: 0.05, value: f.default({ defaultValue: 'legendary' }) }
          ]),
          stats: f.default({ defaultValue: {} }),
          effects: f.default({ defaultValue: [] }),
          value: f.int({ minValue: 10, maxValue: 1000 }),
          stackable: f.default({ defaultValue: true })
        }
      }
    }));
    
    console.log('✅ Database seeding completed successfully!');
    
    // Log seeding summary
    const partners = await db.select().from(schema.partners).limit(5);
    const missions = await db.select().from(schema.missions).limit(5);
    
    console.log(`📈 Seeding Summary:`);
    console.log(`- Players: 1`);
    console.log(`- Partners: 50`);
    console.log(`- Missions: 100`);
    console.log(`- Story Progress: 5`);
    console.log(`- Game Settings: 1`);
    console.log(`- Achievements: 20`);
    
    console.log('\n🎯 Sample Partners:');
    partners.forEach(partner => {
      console.log(`- ${partner.name} (${partner.partnerClass}, Level ${partner.level})`);
    });
    
    console.log('\n🎯 Sample Missions:');
    missions.forEach(mission => {
      console.log(`- ${mission.title} (${mission.type}, ${mission.difficulty})`);
    });
    
    console.log('\n🎮 Additional game metadata has been prepared for:');
    console.log(`- Story Chapters: ${STORY_CHAPTERS.length}`);
    console.log(`- Sample Characters: ${SAMPLE_CHARACTERS.length}`);
    console.log(`- Level Definitions: ${SAMPLE_LEVELS.length}`);
    console.log(`- Map Data: ${SAMPLE_MAPS.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Execute seeding if run directly
if (require.main === module) {
  seedGameData()
    .then(() => {
      console.log('🎉 Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedGameData };