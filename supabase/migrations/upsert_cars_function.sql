-- =====================================================
-- Car Upsert Function with Duplicate Detection
-- =====================================================
-- This function intelligently inserts or updates car data
-- It checks for duplicates based on brand, model, and variant
-- If a car exists, it skips insertion
-- If it doesn't exist, it adds the new car
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.upsert_car_data(jsonb);

-- Create the upsert function
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

  -- Insert new car
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
    api_source,
    -- Base price
    exact_price,
    -- City-specific pricing
    mumbai_price,
    bangalore_price,
    delhi_price,
    pune_price,
    hyderabad_price,
    chennai_price,
    kolkata_price,
    ahmedabad_price,
    -- Colors
    colors,
    color_codes,
    -- Warranty information
    warranty_years,
    warranty_km,
    battery_warranty_years,
    battery_warranty_km,
    -- Price breakdown
    ex_showroom_price,
    rto_charges,
    insurance_cost,
    -- Safety features
    airbags,
    ncap_rating,
    abs,
    esc,
    -- Comfort features
    sunroof,
    ac_type,
    cruise_control,
    -- Engine details
    engine_type,
    max_power,
    max_torque,
    top_speed,
    acceleration,
    -- Dimensions
    length_mm,
    width_mm,
    height_mm,
    wheelbase_mm,
    ground_clearance_mm,
    bootspace_litres,
    -- Description
    description
  ) VALUES (
    car_data->>'external_id',
    car_brand,
    car_model,
    car_variant,
    (car_data->>'price_min')::INTEGER,
    (car_data->>'price_max')::INTEGER,
    car_data->>'fuel_type',
    car_data->>'transmission',
    car_data->>'engine_capacity',
    car_data->>'mileage',
    car_data->>'body_type',
    (car_data->>'seating_capacity')::INTEGER,
    COALESCE(car_data->'images', '[]'::jsonb),
    COALESCE(car_data->'specifications', '{}'::jsonb),
    COALESCE(car_data->'features', '[]'::jsonb),
    COALESCE(car_data->>'status', 'active'),
    car_data->>'api_source',
    -- Base price
    car_data->>'exact_price',
    -- City-specific pricing
    car_data->>'mumbai_price',
    car_data->>'bangalore_price',
    car_data->>'delhi_price',
    car_data->>'pune_price',
    car_data->>'hyderabad_price',
    car_data->>'chennai_price',
    car_data->>'kolkata_price',
    car_data->>'ahmedabad_price',
    -- Colors
    car_data->>'colors',
    car_data->>'color_codes',
    -- Warranty information
    (car_data->>'warranty_years')::INTEGER,
    (car_data->>'warranty_km')::INTEGER,
    (car_data->>'battery_warranty_years')::INTEGER,
    (car_data->>'battery_warranty_km')::INTEGER,
    -- Price breakdown
    car_data->>'ex_showroom_price',
    car_data->>'rto_charges',
    car_data->>'insurance_cost',
    -- Safety features
    car_data->>'airbags',
    car_data->>'ncap_rating',
    (car_data->>'abs')::BOOLEAN,
    (car_data->>'esc')::BOOLEAN,
    -- Comfort features
    car_data->>'sunroof',
    car_data->>'ac_type',
    (car_data->>'cruise_control')::BOOLEAN,
    -- Engine details
    car_data->>'engine_type',
    car_data->>'max_power',
    car_data->>'max_torque',
    car_data->>'top_speed',
    car_data->>'acceleration',
    -- Dimensions
    car_data->>'length_mm',
    car_data->>'width_mm',
    car_data->>'height_mm',
    car_data->>'wheelbase_mm',
    car_data->>'ground_clearance_mm',
    car_data->>'bootspace_litres',
    -- Description
    car_data->>'description'
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
-- Bulk Insert Function with Statistics
-- =====================================================
-- This function processes multiple cars and returns statistics

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
-- Example Usage
-- =====================================================
-- Single car insert:
-- SELECT * FROM public.upsert_car_data(
--   '{
--     "brand": "BMW",
--     "model": "3 Series",
--     "variant": "330i Sport",
--     "price_min": 4230000,
--     "price_max": 4859555,
--     "fuel_type": "Petrol",
--     "transmission": "Automatic",
--     "engine_capacity": "1998 cc",
--     "mileage": "16.13 kmpl",
--     "body_type": "Sedan",
--     "seating_capacity": 5
--   }'::jsonb
-- );

-- Bulk insert:
-- SELECT * FROM public.bulk_upsert_cars(
--   '[
--     {"brand": "BMW", "model": "3 Series", "variant": "330i Sport", ...},
--     {"brand": "BMW", "model": "3 Series", "variant": "320d Sport", ...}
--   ]'::jsonb
-- );
