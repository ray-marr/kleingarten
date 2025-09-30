ALTER TABLE "ads" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "slugUrlSafeCheck" CHECK ("ads"."slug" ~ '^[A-Za-z0-9]{1,8}$');