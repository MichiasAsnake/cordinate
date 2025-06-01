-- Add color column to tags
ALTER TABLE "tags" ADD COLUMN "color" varchar(20) NOT NULL DEFAULT '#3b82f6';

-- Remove color column from order_tags
ALTER TABLE "order_tags" DROP COLUMN IF EXISTS "color"; 