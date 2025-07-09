import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { seed, reset } from 'drizzle-seed';
import * as schema from './schema';
import { config } from 'dotenv';
import { 
  loadAllCharacters, 
  loadAllChapters, 
  loadAllItems, 
  loadAllLevels, 
  loadAllMaps, 
  loadAllTraits 
} from '../cms/content-loader';
import type { CharacterMetadata, ItemMetadata, ChapterMetadata } from '../cms/flexible-content-schemas';
import { normalizeForDatabase, rarityMap, itemTypeMap, classMap, traitMap } from '../cms/flexible-content-schemas';

// Load environment variables
config({ path: '.env.local' });

// Use local database for seeding
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5478/whixgame';

// Create pool for local development
const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

async function seedDatabase() {
  console.log('🌱 Starting database seeding with real game content...');
  
  try {
    // Load all content from markdown files
    console.log('📚 Loading content from markdown files...');
    const characters = await loadAllCharacters();
    const chapters = await loadAllChapters();
    const items = await loadAllItems();
    const levels = await loadAllLevels();
    const maps = await loadAllMaps();
    const traits = await loadAllTraits();
    
    console.log(`📊 Loaded: ${characters.length} characters, ${chapters.length} chapters, ${items.length} items, ${levels.length} levels, ${maps.length} maps, ${traits.length} traits`);

    // Filter characters by role
    const partnerCharacters = characters.filter(char => {
      const role = char.metadata.role?.toLowerCase();
      return role === 'partner' || 
             role === 'ally' ||
             (!char.metadata.role && char.metadata.class) // Characters with class but no role are likely partners
    });
    const enemyCharacters = characters.filter(char => {
      const role = char.metadata.role?.toLowerCase();
      return role === 'enemy' || 
             role === 'antagonist' ||
             role === 'boss' ||
             (char.metadata.name && char.metadata.name.toLowerCase().includes('boss'))
    });
    
    // Clear existing data - comment out if you want to keep existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(schema.achievements);
    await db.delete(schema.gameSettings);
    await db.delete(schema.storyProgress);
    await db.delete(schema.gachaPityCounters);
    await db.delete(schema.playerInventory);
    await db.delete(schema.playerMissions);
    await db.delete(schema.playerCombatHistory);
    await db.delete(schema.partners);
    await db.delete(schema.players);
    await db.delete(schema.users);
    await db.delete(schema.missions);
    await db.delete(schema.items);
    await db.delete(schema.combatEncounters);
    
    // Seed with realistic game data
    console.log('📊 Seeding game data...');
    
    // First, manually insert items from content
    console.log('🎮 Creating items from content...');
    const itemRecords = [];
    for (const item of items) {
      const metadata = item.metadata as ItemMetadata;
      const itemData = {
        id: crypto.randomUUID(),
        name: metadata.name || metadata.title,
        description: metadata.description,
        type: normalizeForDatabase(metadata.category, itemTypeMap) as any,
        rarity: normalizeForDatabase(metadata.rarity || 'common', rarityMap) as any,
        stats: metadata.stats || {},
        effects: metadata.effects ? [metadata.effects.passive, metadata.effects.active].flat().filter(Boolean) : [],
        value: metadata.value || 100,
        stackable: metadata.stackable !== false,
      };
      const result = await db.insert(schema.items).values(itemData).returning();
      itemRecords.push(result[0]);
    }
    console.log(`✅ Created ${itemRecords.length} items`);
    
    // Create missions from chapters
    console.log('📜 Creating missions from chapters...');
    const missionRecords = [];
    for (const chapter of chapters) {
      const metadata = chapter.metadata as ChapterMetadata;
      const missionData = {
        id: crypto.randomUUID(),
        title: metadata.title,
        description: metadata.description,
        type: 'story',
        status: 'available' as const,
        requiredLevel: metadata.unlockLevel || 1,
        rewards: metadata.rewards || { experience: 100, credits: 500, items: [], resonancePoints: 10 },
        objectives: metadata.objectives || [],
        dialogues: []
      };
      const result = await db.insert(schema.missions).values(missionData).returning();
      missionRecords.push(result[0]);
    }
    console.log(`✅ Created ${missionRecords.length} story missions`);
    
    // Create combat encounters from enemy characters
    console.log('⚔️ Creating combat encounters...');
    const encounterRecords = [];
    for (const enemy of enemyCharacters) {
      const metadata = enemy.metadata;
      const encounterData = {
        id: crypto.randomUUID(),
        name: `Encounter: ${metadata.name}`,
        description: metadata.description,
        difficulty: metadata.level || 5,
        enemies: [{
          id: enemy.slug,
          name: metadata.name,
          type: metadata.class || 'enemy',
          stats: metadata.stats || { health: 100, attack: 50, defense: 30 }
        }],
        rewards: { experience: 150, credits: 750, items: [] }
      };
      const result = await db.insert(schema.combatEncounters).values(encounterData).returning();
      encounterRecords.push(result[0]);
    }
    console.log(`✅ Created ${encounterRecords.length} combat encounters`);
    
    // Create users manually to avoid cyclic dependency issues
    console.log('👤 Creating users...');
    const userRecords = [];
    
    // Create test users
    const testUsers = [
      { email: 'test@whix.game', name: 'Test User', role: 'free' as const },
      { email: 'player1@whix.game', name: 'Player One', role: 'free' as const },
      { email: 'player2@whix.game', name: 'Player Two', role: 'paid' as const },
      { email: 'demo@whix.game', name: 'Demo User', role: 'free' as const },
      { email: 'admin@whix.game', name: 'Admin User', role: 'admin' as const },
    ];
    
    for (const userData of testUsers) {
      const user = await db.insert(schema.users).values({
        id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: userData.email,
        name: userData.name,
        password: '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.gOMxlIIHy', // "password123"
        role: userData.role,
        guestId: null,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      userRecords.push(user[0]);
    }
    
    // Create guest users
    for (let i = 0; i < 3; i++) {
      const guestId = `guest_${Math.random().toString(36).substring(2, 12)}`;
      const guest = await db.insert(schema.users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: `Courier_${Math.random().toString(36).substring(2, 7)}`,
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      userRecords.push(guest[0]);
    }
    
    console.log(`✅ Created ${userRecords.length} users`);
    
    // Create players for non-guest users
    console.log('🎮 Creating players...');
    const playerRecords = [];
    
    for (const user of userRecords.filter(u => !u.guestId)) {
      const player = await db.insert(schema.players).values({
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.name,
        level: Math.floor(Math.random() * 15) + 5,
        experience: Math.floor(Math.random() * 3000),
        credits: Math.floor(Math.random() * 20000) + 5000,
        resonancePoints: Math.floor(Math.random() * 300) + 100,
        currentTips: Math.floor(Math.random() * 3000) + 1000,
        totalTipsEarned: Math.floor(Math.random() * 30000) + 5000,
        companyStars: Math.floor(Math.random() * 3),
        tipCutPercentage: 50 + Math.floor(Math.random() * 25),
        humanityIndex: 50 + Math.floor(Math.random() * 50),
        storyProgress: {},
        unlockedChapters: [1, 2],
        stats: {
          missionsCompleted: Math.floor(Math.random() * 50),
          partnersRecruited: Math.floor(Math.random() * 10),
          traitsmastered: Math.floor(Math.random() * 5),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      playerRecords.push(player[0]);
    }
    
    console.log(`✅ Created ${playerRecords.length} players`);
    
    // Now use drizzle-seed for related data (only non-cyclic tables)
    const seedableTables = {
      storyProgress: schema.storyProgress,
      gameSettings: schema.gameSettings,
      achievements: schema.achievements,
      gachaPityCounters: schema.gachaPityCounters,
    };
    
    await seed(db, seedableTables, { seed: 42 }).refine((f) => ({
      // Create story progress for players
      storyProgress: {
        count: playerRecords.length * 2, // 2 chapters per player
        columns: {
          playerId: f.valuesFromArray({
            values: playerRecords.flatMap(p => [p.id, p.id])
          }),
          chapterId: f.valuesFromArray({
            values: playerRecords.flatMap(() => chapters.slice(0, 2).map(ch => ch.slug))
          }),
          isCompleted: f.weightedRandom([
            { weight: 0.3, value: f.default({ defaultValue: true }) },
            { weight: 0.7, value: f.default({ defaultValue: false }) }
          ]),
          currentDialogueId: f.default({ defaultValue: 'intro' }),
          choices: f.default({ defaultValue: [] }),
          completedAt: f.default({ defaultValue: null })
        }
      },
      
      // Create game settings for players
      gameSettings: {
        count: playerRecords.length,
        columns: {
          playerId: f.valuesFromArray({
            values: playerRecords.map(p => p.id)
          }),
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
      
      // Create achievements for players
      achievements: {
        count: playerRecords.length * 5, // 5 achievements per player
        columns: {
          playerId: f.valuesFromArray({
            values: playerRecords.flatMap(p => Array(5).fill(p.id))
          }),
          achievementId: f.valuesFromArray({
            values: [
              'first-mission', 'first-partner', 'tip-collector', 
              'master-courier', 'data-analyst'
            ]
          }),
          title: f.valuesFromArray({
            values: [
              'First Mission', 'First Partner', 'Tip Collector',
              'Master Courier', 'Data Analyst'
            ]
          }),
          description: f.loremIpsum({ sentencesCount: 1 }),
          isUnlocked: f.weightedRandom([
            { weight: 0.4, value: f.default({ defaultValue: true }) },
            { weight: 0.6, value: f.default({ defaultValue: false }) }
          ]),
          progress: f.int({ minValue: 0, maxValue: 100 }),
          maxProgress: f.default({ defaultValue: 100 }),
          rewards: f.default({ defaultValue: {
            experience: 200,
            tips: 1000,
            badge: 'achievement-badge'
          }}),
          unlockedAt: f.default({ defaultValue: null })
        }
      },
      
      // Create gacha pity counters for players
      gachaPityCounters: {
        count: playerRecords.length,
        columns: {
          playerId: f.valuesFromArray({
            values: playerRecords.map(p => p.id)
          }),
          pullsSinceEpic: f.int({ minValue: 0, maxValue: 20 }),
          pullsSinceLegendary: f.int({ minValue: 0, maxValue: 50 }),
          totalPulls: f.int({ minValue: 0, maxValue: 100 }),
          guaranteedRareCounter: f.int({ minValue: 0, maxValue: 10 })
        }
      }
    }));
    
    // Now add partners from actual content
    console.log('👥 Adding partners from content...');
    
    for (const player of playerRecords) {
      // Give each player 2-4 partners from the content
      const numPartners = Math.floor(Math.random() * 3) + 2;
      const selectedPartners = partnerCharacters
        .sort(() => Math.random() - 0.5)
        .slice(0, numPartners);
      
      for (let i = 0; i < selectedPartners.length; i++) {
        const character = selectedPartners[i];
        const metadata = character.metadata as CharacterMetadata;
        
        const partnerData = {
          playerId: player.id,
          name: metadata.name,
          class: normalizeForDatabase(metadata.class || 'courier', classMap) as any,
          primaryTrait: normalizeForDatabase(metadata.traits?.[0], traitMap) as any,
          secondaryTrait: metadata.traits?.[1] ? normalizeForDatabase(metadata.traits[1], traitMap) as any : null,
          level: Math.floor(Math.random() * 15) + 5,
          experience: Math.floor(Math.random() * 3000),
          bondLevel: Math.floor(Math.random() * 8),
          rarity: determineRarity(i === 0 ? 'guaranteed' : 'random'),
          isActive: i === 0, // First partner is active
          stats: metadata.stats || {
            focus: 50,
            perception: 50,
            social: 50,
            logic: 50,
            stamina: 50
          },
          currentEnergy: Math.floor(Math.random() * 50) + 50,
          maxEnergy: 100,
          traitMastery: {},
          abilities: [],
          equipment: {
            weapon: null,
            armor: null,
            accessory: null
          },
          personality: {
            traits: metadata.personalityTraits || ['determined'],
            likes: ['efficiency', 'fairness'],
            dislikes: ['exploitation', 'surveillance'],
            backstory: character.content.split('\n')[0] || 'A skilled partner in the WHIX network.'
          }
        };
        
        await db.insert(schema.partners).values(partnerData);
      }
    }
    
    // Add some items to player inventories
    console.log('🎒 Adding items to inventories...');
    for (const player of playerRecords) {
      // Give each player 3-6 items
      const numItems = Math.floor(Math.random() * 4) + 3;
      const selectedItems = itemRecords
        .sort(() => Math.random() - 0.5)
        .slice(0, numItems);
      
      for (const item of selectedItems) {
        await db.insert(schema.playerInventory).values({
          playerId: player.id,
          itemId: item.id,
          quantity: item.stackable ? Math.floor(Math.random() * 5) + 1 : 1
        });
      }
    }
    
    // Assign some missions to players
    console.log('📋 Assigning missions to players...');
    for (const player of playerRecords) {
      // Give each player 1-3 active missions
      const numMissions = Math.floor(Math.random() * 3) + 1;
      const selectedMissions = missionRecords
        .sort(() => Math.random() - 0.5)
        .slice(0, numMissions);
      
      for (const mission of selectedMissions) {
        await db.insert(schema.playerMissions).values({
          playerId: player.id,
          missionId: mission.id,
          status: 'active',
          progress: { currentStep: 0, totalSteps: 3 }
        });
      }
    }
    
    console.log('✅ Database seeding completed successfully!');
    
    // Log seeding summary
    const userCount = await db.$count(schema.users);
    const playerCount = await db.$count(schema.players);
    const partnerCount = await db.$count(schema.partners);
    const missionCount = await db.$count(schema.missions);
    const itemCount = await db.$count(schema.items);
    
    console.log('\n📈 Seeding Summary:');
    console.log(`- Users: ${userCount} (including ${userCount - 5} guests)`);
    console.log(`- Players: ${playerCount}`);
    console.log(`- Partners: ${partnerCount} (from ${partnerCharacters.length} available)`);
    console.log(`- Missions: ${missionCount}`);
    console.log(`- Items: ${itemCount}`);
    console.log(`- Combat Encounters: ${encounterRecords.length}`);
    
    console.log('\n✨ Sample login credentials:');
    console.log('- Email: test@whix.game');
    console.log('- Password: password123');
    
    console.log('\n🎮 Game content loaded from:');
    console.log('- Characters: /content/characters/');
    console.log('- Items: /content/items/');
    console.log('- Chapters: /content/chapters/');
    console.log('- Maps & Levels: /content/maps/ & /content/levels/');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Helper functions

function determineRarity(mode: 'guaranteed' | 'random'): 'common' | 'rare' | 'epic' | 'legendary' {
  if (mode === 'guaranteed') {
    return 'rare'; // First partner is always at least rare
  }
  
  const roll = Math.random();
  if (roll < 0.5) return 'common';
  if (roll < 0.8) return 'rare';
  if (roll < 0.95) return 'epic';
  return 'legendary';
}

// Execute seeding if run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };