ALTER TABLE "orders" ADD COLUMN "images" jsonb;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "high_res_base_url";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "high_res_sas_token";