-- Copy and run this SQL in your Supabase SQL Editor to add the missing column

-- Add product_ids column to promos table
ALTER TABLE promos 
ADD COLUMN product_ids jsonb DEFAULT '[]';

-- Optional: Create an index for better performance if searching by product_ids in the future
CREATE INDEX idx_promos_product_ids ON promos USING gin (product_ids);
