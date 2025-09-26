CREATE TYPE "public"."ad_statuses" AS ENUM('OPEN', 'CLOSED', 'HIDDEN');--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "status" "ad_statuses" DEFAULT 'OPEN' NOT NULL;