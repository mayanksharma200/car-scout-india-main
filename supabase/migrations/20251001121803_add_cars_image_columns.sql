-- Add missing columns to cars table
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS imagin_images JSONB,
ADD COLUMN IF NOT EXISTS image_last_updated TIMESTAMP WITH TIME ZONE;
