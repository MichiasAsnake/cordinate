-- Migration: Add job_number field to orders table
-- Date: 2025-06-01
-- Description: Add job_number field to store actual DecoPress job numbers

ALTER TABLE orders ADD COLUMN job_number VARCHAR(50);

-- Update existing records to use order_number as temporary job_number
-- This will be properly populated when the scraper runs with the new field
UPDATE orders SET job_number = order_number WHERE job_number IS NULL;

-- Make the field NOT NULL after populating existing records
ALTER TABLE orders ALTER COLUMN job_number SET NOT NULL;

-- Create index for better query performance
CREATE INDEX idx_orders_job_number ON orders(job_number); 