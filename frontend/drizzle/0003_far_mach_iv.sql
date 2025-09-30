ALTER TABLE "ads" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "primary_image" boolean DEFAULT false NOT NULL;