-- Migration: Add color_variant_images column to cars table
-- Purpose: Store images organized by color variant
-- Structure: { "Color Name": { "color_code": "#hex", "images": { "angle": "url", ... } } }

-- Add the color_variant_images column
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS color_variant_images JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for efficient querying of color variant images
CREATE INDEX IF NOT EXISTS idx_cars_color_variant_images
ON cars USING GIN (color_variant_images);

-- Add a comment explaining the column structure
COMMENT ON COLUMN cars.color_variant_images IS
'Stores images organized by color variant. Structure:
{
  "Color Name": {
    "color_code": "#hexcode",
    "images": {
      "front_3_4": "s3-url",
      "front_view": "s3-url",
      "left_side": "s3-url",
      "right_side": "s3-url",
      "rear_view": "s3-url",
      "interior_dash": "s3-url",
      "interior_cabin": "s3-url",
      "interior_steering": "s3-url"
    }
  }
}';

-- Create a function to update the updated_at timestamp when color_variant_images changes
CREATE OR REPLACE FUNCTION update_color_variant_images_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.color_variant_images IS DISTINCT FROM OLD.color_variant_images THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp
DROP TRIGGER IF EXISTS trigger_update_color_variant_images_timestamp ON cars;
CREATE TRIGGER trigger_update_color_variant_images_timestamp
    BEFORE UPDATE ON cars
    FOR EACH ROW
    EXECUTE FUNCTION update_color_variant_images_timestamp();
