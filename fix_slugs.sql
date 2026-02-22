-- Copy and run this SQL in your Supabase SQL Editor to fix category slugs

-- 1. Create a function to generate slugs
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION generate_slug(value TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        unaccent(value), 
        '[^a-zA-Z0-9\s-]', '', 'g' -- Remove special chars
      ),
      '\s+', '-', 'g' -- Replace spaces with hyphens
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Update existing categories with new pure slugs based on name
UPDATE categories
SET slug = generate_slug(name);

-- 3. Verify
SELECT name, slug FROM categories;
