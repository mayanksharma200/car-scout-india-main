-- Add IMAGIN.studio image columns to cars table
-- Run this in your Supabase SQL Editor

-- Add new columns for IMAGIN.studio integration
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS imagin_images JSONB,
ADD COLUMN IF NOT EXISTS image_last_updated TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_image_last_updated ON cars(image_last_updated);
CREATE INDEX IF NOT EXISTS idx_cars_imagin_images ON cars USING gin(imagin_images);

-- Add comments for documentation
COMMENT ON COLUMN cars.imagin_images IS 'IMAGIN.studio generated images data including URLs and metadata';
COMMENT ON COLUMN cars.image_last_updated IS 'Timestamp when images were last updated';

-- Example of the imagin_images structure:
-- {
--   "primary": "https://s3-eu-west-1.amazonaws.com/images.wheel.ag/s3/c?customer=YOUR_KEY&make=mg&model=hector&angle=21",
--   "angles": [
--     {
--       "angle": "21",
--       "url": "https://s3-eu-west-1.amazonaws.com/images.wheel.ag/s3/c?customer=YOUR_KEY&make=mg&model=hector&angle=21"
--     },
--     {
--       "angle": "01", 
--       "url": "https://s3-eu-west-1.amazonaws.com/images.wheel.ag/s3/c?customer=YOUR_KEY&make=mg&model=hector&angle=01"
--     }
--   ],
--   "last_updated": "2024-01-15T10:30:00Z",
--   "fallback": false,
--   "valid": true
-- }