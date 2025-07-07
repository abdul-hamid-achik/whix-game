import { pgTable, text, integer, timestamp, boolean, json, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const partnerClassEnum = pgEnum('partner_class', [
  'courier',
  'analyst',
  'negotiator',
  'specialist',
  'investigator'
]);

export const neurodivergentTraitEnum = pgEnum('neurodivergent_trait', [
  'hyperfocus',
  'pattern_recognition',
  'enhanced_senses',
  'systematic_thinking',
  'attention_to_detail',
  'routine_mastery',
  'sensory_processing'
]);

export const missionStatusEnum = pgEnum('mission_status', [
  'available',
  'active',
  'completed',
  'failed'
]);

export const rarityEnum = pgEnum('rarity', [
  'common',
  'rare',
  'epic',
  'legendary'
]);

// Tables
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const players = pgTable('players', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  level: integer('level').default(1).notNull(),
  experience: integer('experience').default(0).notNull(),
  credits: integer('credits').default(1000).notNull(),
  resonancePoints: integer('resonance_points').default(0).notNull(),
  currentLocationId: uuid('current_location_id'),
  currentTips: integer('current_tips').default(1000).notNull(),
  totalTipsEarned: integer('total_tips_earned').default(0).notNull(),
  companyStars: integer('company_stars').default(0).notNull(),
  tipCutPercentage: integer('tip_cut_percentage').default(75).notNull(),
  storyProgress: json('story_progress').default({}).notNull(),
  unlockedChapters: json('unlocked_chapters').default([1]).notNull(),
  stats: json('stats').default({
    missionsCompleted: 0,
    partnersRecruited: 0,
    traitsmastered: 0,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const partners = pgTable('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  name: text('name').notNull(),
  class: partnerClassEnum('class').notNull(),
  primaryTrait: neurodivergentTraitEnum('primary_trait').notNull(),
  secondaryTrait: neurodivergentTraitEnum('secondary_trait'),
  level: integer('level').default(1).notNull(),
  experience: integer('experience').default(0).notNull(),
  bondLevel: integer('bond_level').default(0).notNull(),
  rarity: rarityEnum('rarity').default('common').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  stats: json('stats').default({
    focus: 50,
    perception: 50,
    social: 50,
    logic: 50,
    stamina: 50
  }).notNull(),
  currentEnergy: integer('current_energy').default(100).notNull(),
  maxEnergy: integer('max_energy').default(100).notNull(),
  traitMastery: json('trait_mastery').default({}).notNull(),
  abilities: json('abilities').default([]).notNull(),
  equipment: json('equipment').default({
    weapon: null,
    armor: null,
    accessory: null
  }).notNull(),
  personality: json('personality').default({
    traits: [],
    likes: [],
    dislikes: [],
    backstory: ''
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const partnerAbilities = pgTable('partner_abilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  class: partnerClassEnum('class').notNull(),
  trait: neurodivergentTraitEnum('trait'),
  unlockLevel: integer('unlock_level').default(1).notNull(),
  cooldown: integer('cooldown').default(0).notNull(),
  energyCost: integer('energy_cost').default(0).notNull(),
  effects: json('effects').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const missions = pgTable('missions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // story, side, daily, special
  status: missionStatusEnum('status').default('available').notNull(),
  locationId: uuid('location_id'),
  requiredLevel: integer('required_level').default(1).notNull(),
  rewards: json('rewards').default({
    experience: 0,
    credits: 0,
    items: [],
    resonancePoints: 0
  }).notNull(),
  objectives: json('objectives').default([]).notNull(),
  dialogues: json('dialogues').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playerMissions = pgTable('player_missions', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  missionId: uuid('mission_id').references(() => missions.id).notNull(),
  status: missionStatusEnum('status').default('active').notNull(),
  progress: json('progress').default({}).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // weapon, armor, accessory, consumable, material
  rarity: rarityEnum('rarity').default('common').notNull(),
  stats: json('stats').default({}).notNull(),
  effects: json('effects').default([]).notNull(),
  value: integer('value').default(0).notNull(),
  stackable: boolean('stackable').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playerInventory = pgTable('player_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  acquiredAt: timestamp('acquired_at').defaultNow().notNull(),
});

export const combatEncounters = pgTable('combat_encounters', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  difficulty: integer('difficulty').default(1).notNull(),
  enemies: json('enemies').default([]).notNull(),
  rewards: json('rewards').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playerCombatHistory = pgTable('player_combat_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  encounterId: uuid('encounter_id').references(() => combatEncounters.id).notNull(),
  partnersUsed: json('partners_used').default([]).notNull(),
  outcome: text('outcome').notNull(), // victory, defeat, retreat
  turnsElapsed: integer('turns_elapsed').default(0).notNull(),
  damageDealt: integer('damage_dealt').default(0).notNull(),
  damageTaken: integer('damage_taken').default(0).notNull(),
  rewardsEarned: json('rewards_earned').default({}).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  player: one(players, {
    fields: [users.id],
    references: [players.userId],
  }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
  partners: many(partners),
  missions: many(playerMissions),
  inventory: many(playerInventory),
  combatHistory: many(playerCombatHistory),
}));

export const partnersRelations = relations(partners, ({ one }) => ({
  player: one(players, {
    fields: [partners.playerId],
    references: [players.id],
  }),
}));

export const playerMissionsRelations = relations(playerMissions, ({ one }) => ({
  player: one(players, {
    fields: [playerMissions.playerId],
    references: [players.id],
  }),
  mission: one(missions, {
    fields: [playerMissions.missionId],
    references: [missions.id],
  }),
}));

export const playerInventoryRelations = relations(playerInventory, ({ one }) => ({
  player: one(players, {
    fields: [playerInventory.playerId],
    references: [players.id],
  }),
  item: one(items, {
    fields: [playerInventory.itemId],
    references: [items.id],
  }),
}));

export const playerCombatHistoryRelations = relations(playerCombatHistory, ({ one }) => ({
  player: one(players, {
    fields: [playerCombatHistory.playerId],
    references: [players.id],
  }),
  encounter: one(combatEncounters, {
    fields: [playerCombatHistory.encounterId],
    references: [combatEncounters.id],
  }),
}));