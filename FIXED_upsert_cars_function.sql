-- =====================================================
-- FIXED Car Upsert Function - Corrects Column Rotation Issue
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the data mapping issue
-- Go to: https://supabase.com/dashboard → SQL Editor → New Query
-- =====================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.upsert_car_data(jsonb);

-- Create the CORRECTED upsert function
CREATE OR REPLACE FUNCTION public.upsert_car_data(car_data jsonb)
RETURNS TABLE(
  action TEXT,
  car_id UUID,
  brand TEXT,
  model TEXT,
  variant TEXT,
  message TEXT
) AS $$
DECLARE
  existing_car_id UUID;
  new_car_id UUID;
  car_brand TEXT;
  car_model TEXT;
  car_variant TEXT;
BEGIN
  -- Extract key fields for duplicate checking
  car_brand := car_data->>'brand';
  car_model := car_data->>'model';
  car_variant := car_data->>'variant';

  -- Check if car already exists based on brand, model, and variant
  SELECT id INTO existing_car_id
  FROM public.cars
  WHERE
    LOWER(TRIM(cars.brand)) = LOWER(TRIM(car_brand))
    AND LOWER(TRIM(cars.model)) = LOWER(TRIM(car_model))
    AND (
      (car_variant IS NULL AND cars.variant IS NULL)
      OR (LOWER(TRIM(cars.variant)) = LOWER(TRIM(car_variant)))
    )
  LIMIT 1;

  -- If car exists, skip insertion
  IF existing_car_id IS NOT NULL THEN
    RETURN QUERY SELECT
      'SKIPPED'::TEXT,
      existing_car_id,
      car_brand,
      car_model,
      car_variant,
      'Car already exists in database'::TEXT;
    RETURN;
  END IF;

  -- Insert new car with EXPLICIT column names and matching values
  INSERT INTO public.cars (
    external_id,
    brand,
    model,
    variant,
    price_min,
    price_max,
    fuel_type,
    transmission,
    engine_capacity,
    mileage,
    body_type,
    seating_capacity,
    images,
    specifications,
    features,
    status,
    api_source
  ) VALUES (
    car_data->>'external_id',                        -- external_id
    car_brand,                                        -- brand
    car_model,                                        -- model
    car_variant,                                      -- variant
    (car_data->>'price_min')::INTEGER,               -- price_min (number)
    (car_data->>'price_max')::INTEGER,               -- price_max (number)
    car_data->>'fuel_type',                          -- fuel_type (Petrol/Diesel/CNG)
    car_data->>'transmission',                       -- transmission (Manual/Automatic)
    car_data->>'engine_capacity',                    -- engine_capacity (1199 cc, 1497 cc)
    car_data->>'mileage',                            -- mileage (18.2 kmpl, 22 kmpl)
    COALESCE(car_data->>'body_type', 'Car'),        -- body_type
    (car_data->>'seating_capacity')::INTEGER,        -- seating_capacity
    COALESCE(car_data->'images', '[]'::jsonb),      -- images
    COALESCE(car_data->'specifications', '{}'::jsonb), -- specifications
    COALESCE(car_data->'features', '[]'::jsonb),    -- features
    COALESCE(car_data->>'status', 'active'),        -- status
    car_data->>'api_source'                          -- api_source
  )
  RETURNING id INTO new_car_id;

  -- Return success
  RETURN QUERY SELECT
    'INSERTED'::TEXT,
    new_car_id,
    car_brand,
    car_model,
    car_variant,
    'Car successfully added to database'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Bulk Insert Function
-- =====================================================

DROP FUNCTION IF EXISTS public.bulk_upsert_cars(jsonb);

CREATE OR REPLACE FUNCTION public.bulk_upsert_cars(cars_data jsonb)
RETURNS TABLE(
  total_processed INTEGER,
  inserted_count INTEGER,
  skipped_count INTEGER,
  error_count INTEGER,
  details jsonb
) AS $$
DECLARE
  car_record jsonb;
  result_record RECORD;
  total INTEGER := 0;
  inserted INTEGER := 0;
  skipped INTEGER := 0;
  errors INTEGER := 0;
  results jsonb := '[]'::jsonb;
BEGIN
  -- Process each car in the array
  FOR car_record IN SELECT * FROM jsonb_array_elements(cars_data)
  LOOP
    total := total + 1;

    BEGIN
      -- Try to insert/update the car
      FOR result_record IN SELECT * FROM public.upsert_car_data(car_record)
      LOOP
        -- Count the result
        IF result_record.action = 'INSERTED' THEN
          inserted := inserted + 1;
        ELSIF result_record.action = 'SKIPPED' THEN
          skipped := skipped + 1;
        END IF;

        -- Add to results array
        results := results || jsonb_build_object(
          'action', result_record.action,
          'car_id', result_record.car_id,
          'brand', result_record.brand,
          'model', result_record.model,
          'variant', result_record.variant,
          'message', result_record.message
        );
      END LOOP;

    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      results := results || jsonb_build_object(
        'action', 'ERROR',
        'car_id', NULL,
        'brand', car_record->>'brand',
        'model', car_record->>'model',
        'variant', car_record->>'variant',
        'message', SQLERRM
      );
    END;
  END LOOP;

  -- Return statistics
  RETURN QUERY SELECT
    total,
    inserted,
    skipped,
    errors,
    results;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TEST QUERY - Run this after deploying to verify
-- =====================================================
-- SELECT * FROM public.upsert_car_data(
--   '{
--     "brand": "Test Brand",
--     "model": "Test Model",
--     "variant": "Test Variant",
--     "price_min": 1000000,
--     "price_max": 1200000,
--     "fuel_type": "Petrol",
--     "transmission": "Manual",
--     "engine_capacity": "1199 cc",
--     "mileage": "18.2 kmpl",
--     "body_type": "Car",
--     "seating_capacity": 5,
--     "status": "active",
--     "api_source": "test"
--   }'::jsonb
-- );
