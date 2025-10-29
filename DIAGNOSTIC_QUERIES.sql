-- =====================================================
-- DIAGNOSTIC QUERIES TO FIND THE ROOT CAUSE
-- Run these in your Supabase SQL Editor
-- =====================================================

-- Query 1: Check the PHYSICAL column order in the cars table
SELECT
  column_name,
  ordinal_position,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cars'
ORDER BY ordinal_position;

-- Query 2: Check the current upsert_car_data function definition
SELECT pg_get_functiondef('public.upsert_car_data'::regproc);

-- Query 3: Test insert with explicit values to see what goes where
-- This will insert a test car and show us the exact mapping
INSERT INTO public.cars (
  brand,
  model,
  variant,
  fuel_type,
  transmission,
  engine_capacity,
  mileage
) VALUES (
  'TEST_BRAND',
  'TEST_MODEL',
  'TEST_VARIANT',
  'TEST_FUEL_TYPE_VALUE',
  'TEST_TRANSMISSION_VALUE',
  'TEST_ENGINE_VALUE',
  'TEST_MILEAGE_VALUE'
) RETURNING *;

-- Query 4: Check what's actually in the database for a specific row
SELECT
  id,
  brand,
  model,
  fuel_type,
  transmission,
  engine_capacity,
  mileage,
  price_min
FROM public.cars
WHERE brand = 'TEST_BRAND'
LIMIT 1;

-- Query 5: Delete the test row
DELETE FROM public.cars WHERE brand = 'TEST_BRAND';

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Run Query 1 to see the exact column order
-- 2. Run Query 2 to see the SQL function definition
-- 3. Run Query 3 to insert a test row with known values
-- 4. Run Query 4 to see where those values ended up
-- 5. Compare: Did TEST_FUEL_TYPE_VALUE go into fuel_type column?
--            Or did it end up in a different column?
-- 6. Run Query 5 to clean up the test row
-- =====================================================
