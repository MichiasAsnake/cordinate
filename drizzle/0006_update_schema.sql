-- Add images column to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "images" jsonb;

-- Add priority column to orders table if it doesn't exist
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "priority" varchar(50) NOT NULL DEFAULT 'medium';

-- Add customer_id column to orders table if it doesn't exist
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_id" integer REFERENCES customers(id) ON DELETE SET NULL;

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS "tags" (
    "id" serial PRIMARY KEY,
    "code" varchar(10) NOT NULL UNIQUE,
    "name" varchar(100) NOT NULL,
    "color" varchar(20) NOT NULL,
    "organization_id" integer REFERENCES organizations(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create order_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS "order_tags" (
    "id" serial PRIMARY KEY,
    "order_id" integer REFERENCES orders(id) ON DELETE CASCADE,
    "tag_id" integer REFERENCES tags(id) ON DELETE CASCADE,
    "quantity" integer NOT NULL DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_tags_organization_id" ON "tags"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_order_tags_order_id" ON "order_tags"("order_id");
CREATE INDEX IF NOT EXISTS "idx_order_tags_tag_id" ON "order_tags"("tag_id"); 