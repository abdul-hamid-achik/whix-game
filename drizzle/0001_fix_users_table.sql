-- Fix users table to match the schema.ts definition
-- First, drop the old table
DROP TABLE IF EXISTS "users" CASCADE;

-- Create the correct users table structure
CREATE TYPE "public"."user_role" AS ENUM('admin', 'free', 'paid');

CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL, -- Using text for nanoid
	"email" text,
	"name" text,
	"password" text,
	"role" "user_role" DEFAULT 'free' NOT NULL,
	"guest_id" text,
	"email_verified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);