-- Migration: Add ideogram_images column to cars table
-- Description: Adds a JSONB column to store Ideogram AI generated images data
-- Date: 2025-01-13
-- Author: AI Assistant

-- Add ideogram_images column to store Ideogram AI generated image data
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS ideogram_images JSONB DEFAULT NULL;

-- Add a comment to the column
COMMENT ON COLUMN cars.ideogram_images IS 'Stores Ideogram AI generated images data in JSON format with structure: { car_id, source, primary, angles[], total_images, created, valid, last_updated }';

-- Create an index on the ideogram_images column for faster queries
CREATE INDEX IF NOT EXISTS idx_cars_ideogram_images ON cars USING GIN (ideogram_images);

-- Add a check to ensure ideogram_images is either NULL or a valid JSON object
ALTER TABLE cars
ADD CONSTRAINT check_ideogram_images_format
CHECK (
  ideogram_images IS NULL OR
  (
    ideogram_images ? 'source' AND
    ideogram_images ? 'valid' AND
    ideogram_images ? 'last_updated'
  )
);

-- Example of ideogram_images JSON structure:
-- {
--   "car_id": "uuid-string",
--   "source": "ideogram",
--   "primary": "https://api.ideogram.ai/...",
--   "angles": [
--     {
--       "angle": "front_3_4",
--       "url": "https://...",
--       "resolution": "1920x1080",
--       "is_safe": true,
--       "seed": 12345
--     },
--     ...
--   ],
--   "total_images": 8,
--   "created": "2025-01-13T10:30:00Z",
--   "valid": true,
--   "last_updated": "2025-01-13T10:30:00Z"
-- }

-- Update image_last_updated whenever ideogram_images is modified
CREATE OR REPLACE FUNCTION update_ideogram_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ideogram_images IS DISTINCT FROM OLD.ideogram_images THEN
    NEW.image_last_updated = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_ideogram_timestamp ON cars;
CREATE TRIGGER trigger_update_ideogram_timestamp
BEFORE UPDATE ON cars
FOR EACH ROW
EXECUTE FUNCTION update_ideogram_timestamp();

-- Grant necessary permissions (adjust role names as needed)
-- GRANT SELECT, UPDATE ON cars TO authenticated;
-- GRANT SELECT, UPDATE ON cars TO service_role;
