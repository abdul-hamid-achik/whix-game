import { pgTable, uuid, integer, timestamp, json, pgEnum, text, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { players } from '../schema';
import { rarityEnum } from '../schema';

export const pullTypeEnum = pgEnum('pull_type', ['single', 'multi']);

export const gachaPulls = pgTable('gacha_pulls', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  pullType: pullTypeEnum('pull_type').notNull(),
  pulledPartnerIds: json('pulled_partner_ids').default([]).notNull(),
  rarities: json('rarities').default([]).notNull(),
  tipCost: integer('tip_cost').notNull(),
  pulledAt: timestamp('pulled_at').defaultNow().notNull(),
});

export const gachaPityCounters = pgTable('gacha_pity_counters', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).unique().notNull(),
  pullsSinceEpic: integer('pulls_since_epic').default(0).notNull(),
  pullsSinceLegendary: integer('pulls_since_legendary').default(0).notNull(),
  totalPulls: integer('total_pulls').default(0).notNull(),
  guaranteedRareCounter: integer('guaranteed_rare_counter').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const weeklyBanners = pgTable('weekly_banners', {
  id: uuid('id').defaultRandom().primaryKey(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  featuredPartnerId: uuid('featured_partner_id'),
  featuredClass: text('featured_class'),
  featuredTrait: text('featured_trait'),
  rateUpPercentage: integer('rate_up_percentage').default(50).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const gachaPullsRelations = relations(gachaPulls, ({ one }) => ({
  player: one(players, {
    fields: [gachaPulls.playerId],
    references: [players.id],
  }),
}));

export const gachaPityCountersRelations = relations(gachaPityCounters, ({ one }) => ({
  player: one(players, {
    fields: [gachaPityCounters.playerId],
    references: [players.id],
  }),
}));