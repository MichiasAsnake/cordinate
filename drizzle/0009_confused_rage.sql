CREATE TABLE "comment_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comment_mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer,
	"user_id" integer,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_number" varchar(50) NOT NULL,
	"user_id" integer,
	"content" text NOT NULL,
	"content_type" varchar(20) DEFAULT 'text',
	"reply_to_id" integer,
	"is_pinned" boolean DEFAULT false,
	"is_internal" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_number" varchar(50) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_description" text NOT NULL,
	"event_data" jsonb,
	"user_name" varchar(100),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "emails" jsonb;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "phones" jsonb;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "address_line1" varchar(255);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "address_line2" varchar(255);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "country" varchar(100) DEFAULT 'USA';--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "contact_preferences" jsonb;--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "filename" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "category" varchar(50) DEFAULT 'other';--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "uploaded_by" integer;--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "job_files" ADD COLUMN "uploaded_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "asset_tag" varchar(100);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "specifications" jsonb;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "order_tags" ADD COLUMN "status" varchar(50) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "order_tags" ADD COLUMN "assigned_to" integer;--> statement-breakpoint
ALTER TABLE "order_tags" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order_tags" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order_tags" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "order_tags" ADD COLUMN "estimated_hours" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "order_tags" ADD COLUMN "actual_hours" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_value" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_emails" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_phones" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_info" jsonb;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "priority" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "estimated_time_hours" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "comment_files" ADD CONSTRAINT "comment_files_comment_id_job_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."job_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_mentions" ADD CONSTRAINT "comment_mentions_comment_id_job_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."job_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_mentions" ADD CONSTRAINT "comment_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_comments" ADD CONSTRAINT "job_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_files_comment_id_idx" ON "comment_files" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_mentions_comment_id_idx" ON "comment_mentions" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_mentions_user_id_idx" ON "comment_mentions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_mentions_read_idx" ON "comment_mentions" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "job_comments_job_number_idx" ON "job_comments" USING btree ("job_number");--> statement-breakpoint
CREATE INDEX "job_comments_user_id_idx" ON "job_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_comments_pinned_idx" ON "job_comments" USING btree ("is_pinned");--> statement-breakpoint
CREATE INDEX "job_comments_created_at_idx" ON "job_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_timeline_job_number_idx" ON "job_timeline" USING btree ("job_number");--> statement-breakpoint
CREATE INDEX "job_timeline_event_type_idx" ON "job_timeline" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "job_timeline_created_at_idx" ON "job_timeline" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "job_files" ADD CONSTRAINT "job_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_tags" ADD CONSTRAINT "order_tags_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_files_order_id_idx" ON "job_files" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "job_files_category_idx" ON "job_files" USING btree ("category");--> statement-breakpoint
CREATE INDEX "job_files_active_idx" ON "job_files" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_asset_sku_idx" ON "order_items" USING btree ("asset_sku");--> statement-breakpoint
CREATE INDEX "order_items_status_idx" ON "order_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_tags_order_id_idx" ON "order_tags" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_tags_tag_id_idx" ON "order_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "order_tags_status_idx" ON "order_tags" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_job_number_idx" ON "orders" USING btree ("job_number");--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_due_date_idx" ON "orders" USING btree ("due_date");