ALTER TABLE "comment_mentions" DROP CONSTRAINT "comment_mentions_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "comment_mentions_user_id_idx";--> statement-breakpoint
ALTER TABLE "comment_files" ADD COLUMN "filename" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "comment_files" ADD COLUMN "storage_path" text;--> statement-breakpoint
ALTER TABLE "comment_files" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "comment_files" ADD COLUMN "uploaded_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "comment_files" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "comment_files" ADD COLUMN "uploaded_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "comment_mentions" ADD COLUMN "mentioned_user_id" integer;--> statement-breakpoint
ALTER TABLE "comment_mentions" ADD COLUMN "mention_type" varchar(20) DEFAULT 'direct';--> statement-breakpoint
ALTER TABLE "comment_mentions" ADD COLUMN "notification_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "job_comments" ADD COLUMN "order_id" integer;--> statement-breakpoint
ALTER TABLE "job_comments" ADD COLUMN "comment_type" varchar(20) DEFAULT 'comment';--> statement-breakpoint
ALTER TABLE "job_comments" ADD COLUMN "parent_comment_id" integer;--> statement-breakpoint
ALTER TABLE "job_comments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "comment_files" ADD CONSTRAINT "comment_files_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_mentions" ADD CONSTRAINT "comment_mentions_mentioned_user_id_users_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_comments" ADD CONSTRAINT "job_comments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_files_active_idx" ON "comment_files" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "comment_files_uploaded_by_idx" ON "comment_files" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE INDEX "comment_mentions_mentioned_user_idx" ON "comment_mentions" USING btree ("mentioned_user_id");--> statement-breakpoint
CREATE INDEX "comment_mentions_type_idx" ON "comment_mentions" USING btree ("mention_type");--> statement-breakpoint
CREATE INDEX "job_comments_order_id_idx" ON "job_comments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "job_comments_parent_id_idx" ON "job_comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "job_comments_type_idx" ON "job_comments" USING btree ("comment_type");--> statement-breakpoint
CREATE INDEX "job_comments_deleted_at_idx" ON "job_comments" USING btree ("deleted_at");--> statement-breakpoint
ALTER TABLE "comment_mentions" DROP COLUMN "user_id";