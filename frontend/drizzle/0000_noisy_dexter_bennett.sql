CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" varchar(500) NOT NULL,
	"user_id" integer,
	"coordinates" geography(Point,4326),
	"address" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"ads_id" integer,
	"image_name" varchar(50),
	"url" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text,
	"telephone" text,
	"email" text
);
--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_ads_id_ads_id_fk" FOREIGN KEY ("ads_id") REFERENCES "public"."ads"("id") ON DELETE no action ON UPDATE no action;