CREATE TYPE "public"."mission_status" AS ENUM('available', 'active', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."neurodivergent_trait" AS ENUM('hyperfocus', 'pattern_recognition', 'enhanced_senses', 'systematic_thinking', 'attention_to_detail', 'routine_mastery', 'sensory_processing');--> statement-breakpoint
CREATE TYPE "public"."partner_class" AS ENUM('courier', 'analyst', 'negotiator', 'specialist', 'investigator');--> statement-breakpoint
CREATE TYPE "public"."pull_type" AS ENUM('single', 'multi');--> statement-breakpoint
CREATE TYPE "public"."rarity" AS ENUM('common', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"achievement_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"is_unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp,
	"progress" integer DEFAULT 0 NOT NULL,
	"max_progress" integer DEFAULT 100 NOT NULL,
	"rewards" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_encounters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"enemies" json DEFAULT '[]'::json NOT NULL,
	"rewards" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gacha_pity_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"pulls_since_epic" integer DEFAULT 0 NOT NULL,
	"pulls_since_legendary" integer DEFAULT 0 NOT NULL,
	"total_pulls" integer DEFAULT 0 NOT NULL,
	"guaranteed_rare_counter" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gacha_pity_counters_player_id_unique" UNIQUE("player_id")
);
--> statement-breakpoint
CREATE TABLE "gacha_pulls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"pull_type" "pull_type" NOT NULL,
	"pulled_partner_ids" json DEFAULT '[]'::json NOT NULL,
	"rarities" json DEFAULT '[]'::json NOT NULL,
	"tip_cost" integer NOT NULL,
	"pulled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"theme" text DEFAULT 'neonRebel' NOT NULL,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"music_enabled" boolean DEFAULT true NOT NULL,
	"notifications" json DEFAULT '{"missions":true,"energy":true,"rewards":true}'::json NOT NULL,
	"difficulty" text DEFAULT 'normal' NOT NULL,
	"auto_save" boolean DEFAULT true NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_settings_player_id_unique" UNIQUE("player_id")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"rarity" "rarity" DEFAULT 'common' NOT NULL,
	"stats" json DEFAULT '{}'::json NOT NULL,
	"effects" json DEFAULT '[]'::json NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"stackable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"status" "mission_status" DEFAULT 'available' NOT NULL,
	"location_id" uuid,
	"required_level" integer DEFAULT 1 NOT NULL,
	"rewards" json DEFAULT '{"experience":0,"credits":0,"items":[],"resonancePoints":0}'::json NOT NULL,
	"objectives" json DEFAULT '[]'::json NOT NULL,
	"dialogues" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_abilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"class" "partner_class" NOT NULL,
	"trait" "neurodivergent_trait",
	"unlock_level" integer DEFAULT 1 NOT NULL,
	"cooldown" integer DEFAULT 0 NOT NULL,
	"energy_cost" integer DEFAULT 0 NOT NULL,
	"effects" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"name" text NOT NULL,
	"class" "partner_class" NOT NULL,
	"primary_trait" "neurodivergent_trait" NOT NULL,
	"secondary_trait" "neurodivergent_trait",
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"bond_level" integer DEFAULT 0 NOT NULL,
	"rarity" "rarity" DEFAULT 'common' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"stats" json DEFAULT '{"focus":50,"perception":50,"social":50,"logic":50,"stamina":50}'::json NOT NULL,
	"current_energy" integer DEFAULT 100 NOT NULL,
	"max_energy" integer DEFAULT 100 NOT NULL,
	"trait_mastery" json DEFAULT '{}'::json NOT NULL,
	"abilities" json DEFAULT '[]'::json NOT NULL,
	"equipment" json DEFAULT '{"weapon":null,"armor":null,"accessory":null}'::json NOT NULL,
	"personality" json DEFAULT '{"traits":[],"likes":[],"dislikes":[],"backstory":""}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_combat_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"encounter_id" uuid NOT NULL,
	"partners_used" json DEFAULT '[]'::json NOT NULL,
	"outcome" text NOT NULL,
	"turns_elapsed" integer DEFAULT 0 NOT NULL,
	"damage_dealt" integer DEFAULT 0 NOT NULL,
	"damage_taken" integer DEFAULT 0 NOT NULL,
	"rewards_earned" json DEFAULT '{}'::json NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"acquired_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"mission_id" uuid NOT NULL,
	"status" "mission_status" DEFAULT 'active' NOT NULL,
	"progress" json DEFAULT '{}'::json NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"credits" integer DEFAULT 1000 NOT NULL,
	"resonance_points" integer DEFAULT 0 NOT NULL,
	"current_location_id" uuid,
	"current_tips" integer DEFAULT 1000 NOT NULL,
	"total_tips_earned" integer DEFAULT 0 NOT NULL,
	"company_stars" integer DEFAULT 0 NOT NULL,
	"tip_cut_percentage" integer DEFAULT 75 NOT NULL,
	"story_progress" json DEFAULT '{}'::json NOT NULL,
	"unlocked_chapters" json DEFAULT '[1]'::json NOT NULL,
	"stats" json DEFAULT '{"missionsCompleted":0,"partnersRecruited":0,"traitsmastered":0}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"chapter_id" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"current_dialogue_id" text,
	"choices" json DEFAULT '[]'::json NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "weekly_banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"featured_partner_id" uuid,
	"featured_class" text,
	"featured_trait" text,
	"rate_up_percentage" integer DEFAULT 50 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gacha_pity_counters" ADD CONSTRAINT "gacha_pity_counters_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gacha_pulls" ADD CONSTRAINT "gacha_pulls_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_settings" ADD CONSTRAINT "game_settings_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_combat_history" ADD CONSTRAINT "player_combat_history_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_combat_history" ADD CONSTRAINT "player_combat_history_encounter_id_combat_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."combat_encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_inventory" ADD CONSTRAINT "player_inventory_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_inventory" ADD CONSTRAINT "player_inventory_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_missions" ADD CONSTRAINT "player_missions_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_missions" ADD CONSTRAINT "player_missions_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_progress" ADD CONSTRAINT "story_progress_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;