ALTER TABLE "orders" RENAME COLUMN "high_res_url" TO "high_res_base_url";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "high_res_sas_token" text;