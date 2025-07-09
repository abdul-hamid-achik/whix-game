CREATE TYPE "public"."skin_category" AS ENUM('delivery_uniform', 'street_wear', 'corporate', 'tech_gear', 'courier_bike', 'data_pad', 'neural_interface', 'city_backdrop');--> statement-breakpoint
CREATE TYPE "public"."skin_type" AS ENUM('outfit', 'accessory', 'vehicle', 'device', 'background');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'free', 'paid');--> statement-breakpoint
CREATE TABLE "player_skins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"skin_id" uuid NOT NULL,
	"partner_id" uuid,
	"generated_image_url" text,
	"generated_at" timestamp,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"acquisition_method" text DEFAULT 'gacha' NOT NULL,
	"obtained_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skin_gacha_pulls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"skin_id" uuid NOT NULL,
	"tip_cost" integer NOT NULL,
	"rarity" "rarity" NOT NULL,
	"was_generated" boolean DEFAULT false NOT NULL,
	"pulled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"rarity" "rarity" NOT NULL,
	"skin_type" "skin_type" NOT NULL,
	"skin_category" "skin_category" NOT NULL,
	"image_prompt" text NOT NULL,
	"style_modifiers" json DEFAULT '{}'::json NOT NULL,
	"partner_class_compatible" json DEFAULT '["courier","analyst","negotiator","specialist","investigator"]'::json NOT NULL,
	"trait_synergies" json DEFAULT '[]'::json NOT NULL,
	"tip_cost" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "username" TO "name";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "guest_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "player_skins" ADD CONSTRAINT "player_skins_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_skins" ADD CONSTRAINT "player_skins_skin_id_skins_id_fk" FOREIGN KEY ("skin_id") REFERENCES "public"."skins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_skins" ADD CONSTRAINT "player_skins_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skin_gacha_pulls" ADD CONSTRAINT "skin_gacha_pulls_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skin_gacha_pulls" ADD CONSTRAINT "skin_gacha_pulls_skin_id_skins_id_fk" FOREIGN KEY ("skin_id") REFERENCES "public"."skins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";