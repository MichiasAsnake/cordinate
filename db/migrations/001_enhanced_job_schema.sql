-- Enhanced Job Schema Migration
-- Adds support for enhanced customer contact, order line items, and communication features
-- This migration extends the existing schema without breaking current functionality

-- Add enhanced customer contact fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_emails TEXT[];
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phones TEXT[];
ALTER TABLE orders ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_value DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Enhance customers table with additional contact preferences
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'USA';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(20) DEFAULT 'email';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_notes TEXT;

-- Enhance order_items table with additional fields
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS specifications JSONB;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enhance job_files table with additional metadata
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id);
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create job timeline table for tracking job history and events
CREATE TABLE IF NOT EXISTS job_timeline (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job comments table for internal communication
CREATE TABLE IF NOT EXISTS job_comments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  parent_comment_id INTEGER REFERENCES job_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment files table for file attachments to comments
CREATE TABLE IF NOT EXISTS comment_files (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES job_comments(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment mentions table for @mentions functionality
CREATE TABLE IF NOT EXISTS comment_mentions (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES job_comments(id) ON DELETE CASCADE,
  mentioned_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance tags table with additional fields
ALTER TABLE tags ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS estimated_time INTEGER; -- in minutes
ALTER TABLE tags ADD COLUMN IF NOT EXISTS description TEXT;

-- Enhance order_tags table with status and assignment
ALTER TABLE order_tags ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE order_tags ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id);
ALTER TABLE order_tags ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE order_tags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_timeline_order_id ON job_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_job_timeline_event_type ON job_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_job_timeline_created_at ON job_timeline(created_at);

CREATE INDEX IF NOT EXISTS idx_job_comments_order_id ON job_comments(order_id);
CREATE INDEX IF NOT EXISTS idx_job_comments_user_id ON job_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_job_comments_created_at ON job_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_job_comments_is_pinned ON job_comments(is_pinned);

CREATE INDEX IF NOT EXISTS idx_comment_mentions_user_id ON comment_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_is_read ON comment_mentions(is_read);

CREATE INDEX IF NOT EXISTS idx_orders_customer_emails ON orders USING GIN(customer_emails);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);
CREATE INDEX IF NOT EXISTS idx_orders_total_value ON orders(total_value);

CREATE INDEX IF NOT EXISTS idx_job_files_order_id ON job_files(order_id);
CREATE INDEX IF NOT EXISTS idx_job_files_category ON job_files(category);
CREATE INDEX IF NOT EXISTS idx_job_files_is_active ON job_files(is_active);

-- Create trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_comments_updated_at ON job_comments;
CREATE TRIGGER update_job_comments_updated_at 
    BEFORE UPDATE ON job_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_files_updated_at ON job_files;
CREATE TRIGGER update_job_files_updated_at 
    BEFORE UPDATE ON job_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_tags_updated_at ON order_tags;
CREATE TRIGGER update_order_tags_updated_at 
    BEFORE UPDATE ON order_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial timeline entries for existing orders
INSERT INTO job_timeline (order_id, event_type, description, user_name)
SELECT 
    id,
    'created',
    'Job imported from scraper data',
    'System'
FROM orders 
WHERE NOT EXISTS (
    SELECT 1 FROM job_timeline WHERE order_id = orders.id AND event_type = 'created'
);

-- Migrate existing job_descriptions to timeline entries
INSERT INTO job_timeline (order_id, event_type, description, user_name, created_at)
SELECT 
    o.id,
    'comment',
    jd.value->>'text',
    COALESCE(jd.value->>'author', 'Unknown'),
    CASE 
        WHEN jd.value->>'timestamp' ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}' 
        THEN (jd.value->>'timestamp')::TIMESTAMP WITH TIME ZONE
        ELSE NOW()
    END
FROM orders o,
     LATERAL jsonb_array_elements(COALESCE(o.job_descriptions, '[]'::jsonb)) AS jd(value)
WHERE NOT EXISTS (
    SELECT 1 FROM job_timeline 
    WHERE order_id = o.id 
    AND description = jd.value->>'text'
    AND event_type = 'comment'
);

-- Add helpful comments
COMMENT ON TABLE job_timeline IS 'Timeline of events and history for each job/order';
COMMENT ON TABLE job_comments IS 'Internal team comments and communication for jobs';
COMMENT ON TABLE comment_files IS 'File attachments associated with job comments';
COMMENT ON TABLE comment_mentions IS 'User mentions within job comments for notifications';

COMMENT ON COLUMN orders.customer_emails IS 'Array of customer email addresses';
COMMENT ON COLUMN orders.customer_phones IS 'Array of customer phone numbers';
COMMENT ON COLUMN orders.due_date IS 'Date when the job is due to be completed';
COMMENT ON COLUMN orders.total_value IS 'Total monetary value of the order';

COMMENT ON COLUMN job_files.category IS 'File category: design, proof, reference, shipping, other';
COMMENT ON COLUMN job_files.is_active IS 'Whether this file version is currently active';
COMMENT ON COLUMN job_files.version IS 'Version number for file versioning';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON job_timeline TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON job_comments TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON comment_files TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON comment_mentions TO your_app_user; 