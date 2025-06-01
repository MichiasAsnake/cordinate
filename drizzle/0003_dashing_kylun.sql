ALTER TABLE "orders" ADD COLUMN "priority" varchar(50) DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "thumbnail_url" text;