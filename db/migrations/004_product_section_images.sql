ALTER TABLE products ADD COLUMN IF NOT EXISTS section_images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE products ADD CONSTRAINT products_section_images_array CHECK (jsonb_typeof(section_images) = 'array');
