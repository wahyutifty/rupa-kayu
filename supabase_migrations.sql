-- Add template_type and landing_content to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'standard';
ALTER TABLE products ADD COLUMN IF NOT EXISTS landing_content JSONB DEFAULT '{}';

-- Create a bucket for landing page assets if needed (though 'products' bucket usually suffices)
-- but let's keep it simple and use existing 'products' bucket.
