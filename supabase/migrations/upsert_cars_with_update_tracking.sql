-- =====================================================
-- Enhanced Car Upsert Function with Update Tracking
-- =====================================================
-- This function intelligently inserts or updates car data
-- It checks for duplicates based on brand, model, and variant
-- If a car exists and fields have changed, it UPDATES the record
-- Returns detailed information about what changed
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.upsert_car_data_with_tracking(jsonb);

-- Create the enhanced upsert function with change tracking
CREATE OR REPLACE FUNCTION public.upsert_car_data_with_tracking(car_data jsonb)
RETURNS TABLE(
  action TEXT,
  car_id UUID,
  brand TEXT,
  model TEXT,
  variant TEXT,
  message TEXT,
  changed_fields jsonb
) AS $$
DECLARE
  existing_car_id UUID;
  existing_car RECORD;
  new_car_id UUID;
  car_brand TEXT;
  car_model TEXT;
  car_variant TEXT;
  changes jsonb := '[]'::jsonb;
  has_changes BOOLEAN := FALSE;
  field_name TEXT;
  old_value TEXT;
  new_value TEXT;
BEGIN
  -- Extract key fields for duplicate checking
  car_brand := car_data->>'brand';
  car_model := car_data->>'model';
  car_variant := car_data->>'variant';

  -- Check if car already exists based on brand, model, and variant
  SELECT * INTO existing_car
  FROM public.cars
  WHERE
    LOWER(TRIM(cars.brand)) = LOWER(TRIM(car_brand))
    AND LOWER(TRIM(cars.model)) = LOWER(TRIM(car_model))
    AND (
      (car_variant IS NULL AND cars.variant IS NULL)
      OR (LOWER(TRIM(cars.variant)) = LOWER(TRIM(car_variant)))
    )
  LIMIT 1;

  existing_car_id := existing_car.id;

  -- If car exists, check for changes
  IF existing_car_id IS NOT NULL THEN
    -- Compare each field and track changes

    -- Price fields
    IF COALESCE((car_data->>'price_min')::INTEGER, 0) != COALESCE(existing_car.price_min, 0) AND (car_data->>'price_min') IS NOT NULL THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'price_min',
        'old_value', COALESCE(existing_car.price_min::TEXT, 'null'),
        'new_value', car_data->>'price_min'
      );
    END IF;

    IF COALESCE((car_data->>'price_max')::INTEGER, 0) != COALESCE(existing_car.price_max, 0) AND (car_data->>'price_max') IS NOT NULL THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'price_max',
        'old_value', COALESCE(existing_car.price_max::TEXT, 'null'),
        'new_value', car_data->>'price_max'
      );
    END IF;

    -- Exact price
    IF COALESCE(car_data->>'exact_price', '') != COALESCE(existing_car.exact_price, '') AND (car_data->>'exact_price') IS NOT NULL AND (car_data->>'exact_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'exact_price',
        'old_value', COALESCE(existing_car.exact_price, 'null'),
        'new_value', car_data->>'exact_price'
      );
    END IF;

    -- Fuel type
    IF COALESCE(car_data->>'fuel_type', '') != COALESCE(existing_car.fuel_type, '') AND (car_data->>'fuel_type') IS NOT NULL AND (car_data->>'fuel_type') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'fuel_type',
        'old_value', COALESCE(existing_car.fuel_type, 'null'),
        'new_value', car_data->>'fuel_type'
      );
    END IF;

    -- Transmission
    IF COALESCE(car_data->>'transmission', '') != COALESCE(existing_car.transmission, '') AND (car_data->>'transmission') IS NOT NULL AND (car_data->>'transmission') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'transmission',
        'old_value', COALESCE(existing_car.transmission, 'null'),
        'new_value', car_data->>'transmission'
      );
    END IF;

    -- Engine capacity
    IF COALESCE(car_data->>'engine_capacity', '') != COALESCE(existing_car.engine_capacity, '') AND (car_data->>'engine_capacity') IS NOT NULL AND (car_data->>'engine_capacity') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'engine_capacity',
        'old_value', COALESCE(existing_car.engine_capacity, 'null'),
        'new_value', car_data->>'engine_capacity'
      );
    END IF;

    -- Mileage
    IF COALESCE(car_data->>'mileage', '') != COALESCE(existing_car.mileage, '') AND (car_data->>'mileage') IS NOT NULL AND (car_data->>'mileage') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'mileage',
        'old_value', COALESCE(existing_car.mileage, 'null'),
        'new_value', car_data->>'mileage'
      );
    END IF;

    -- Seating capacity
    IF COALESCE((car_data->>'seating_capacity')::INTEGER, 0) != COALESCE(existing_car.seating_capacity, 0) AND (car_data->>'seating_capacity') IS NOT NULL THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object(
        'field', 'seating_capacity',
        'old_value', COALESCE(existing_car.seating_capacity::TEXT, 'null'),
        'new_value', car_data->>'seating_capacity'
      );
    END IF;

    -- City prices
    IF COALESCE(car_data->>'mumbai_price', '') != COALESCE(existing_car.mumbai_price, '') AND (car_data->>'mumbai_price') IS NOT NULL AND (car_data->>'mumbai_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'mumbai_price', 'old_value', COALESCE(existing_car.mumbai_price, 'null'), 'new_value', car_data->>'mumbai_price');
    END IF;

    IF COALESCE(car_data->>'bangalore_price', '') != COALESCE(existing_car.bangalore_price, '') AND (car_data->>'bangalore_price') IS NOT NULL AND (car_data->>'bangalore_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'bangalore_price', 'old_value', COALESCE(existing_car.bangalore_price, 'null'), 'new_value', car_data->>'bangalore_price');
    END IF;

    IF COALESCE(car_data->>'delhi_price', '') != COALESCE(existing_car.delhi_price, '') AND (car_data->>'delhi_price') IS NOT NULL AND (car_data->>'delhi_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'delhi_price', 'old_value', COALESCE(existing_car.delhi_price, 'null'), 'new_value', car_data->>'delhi_price');
    END IF;

    IF COALESCE(car_data->>'pune_price', '') != COALESCE(existing_car.pune_price, '') AND (car_data->>'pune_price') IS NOT NULL AND (car_data->>'pune_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'pune_price', 'old_value', COALESCE(existing_car.pune_price, 'null'), 'new_value', car_data->>'pune_price');
    END IF;

    IF COALESCE(car_data->>'hyderabad_price', '') != COALESCE(existing_car.hyderabad_price, '') AND (car_data->>'hyderabad_price') IS NOT NULL AND (car_data->>'hyderabad_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'hyderabad_price', 'old_value', COALESCE(existing_car.hyderabad_price, 'null'), 'new_value', car_data->>'hyderabad_price');
    END IF;

    IF COALESCE(car_data->>'chennai_price', '') != COALESCE(existing_car.chennai_price, '') AND (car_data->>'chennai_price') IS NOT NULL AND (car_data->>'chennai_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'chennai_price', 'old_value', COALESCE(existing_car.chennai_price, 'null'), 'new_value', car_data->>'chennai_price');
    END IF;

    IF COALESCE(car_data->>'kolkata_price', '') != COALESCE(existing_car.kolkata_price, '') AND (car_data->>'kolkata_price') IS NOT NULL AND (car_data->>'kolkata_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'kolkata_price', 'old_value', COALESCE(existing_car.kolkata_price, 'null'), 'new_value', car_data->>'kolkata_price');
    END IF;

    IF COALESCE(car_data->>'ahmedabad_price', '') != COALESCE(existing_car.ahmedabad_price, '') AND (car_data->>'ahmedabad_price') IS NOT NULL AND (car_data->>'ahmedabad_price') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'ahmedabad_price', 'old_value', COALESCE(existing_car.ahmedabad_price, 'null'), 'new_value', car_data->>'ahmedabad_price');
    END IF;

    -- Colors
    IF COALESCE(car_data->>'colors', '') != COALESCE(existing_car.colors, '') AND (car_data->>'colors') IS NOT NULL AND (car_data->>'colors') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'colors', 'old_value', COALESCE(existing_car.colors, 'null'), 'new_value', car_data->>'colors');
    END IF;

    -- Airbags
    IF COALESCE(car_data->>'airbags', '') != COALESCE(existing_car.airbags, '') AND (car_data->>'airbags') IS NOT NULL AND (car_data->>'airbags') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'airbags', 'old_value', COALESCE(existing_car.airbags, 'null'), 'new_value', car_data->>'airbags');
    END IF;

    -- Safety ratings
    IF COALESCE(car_data->>'ncap_rating', '') != COALESCE(existing_car.ncap_rating, '') AND (car_data->>'ncap_rating') IS NOT NULL AND (car_data->>'ncap_rating') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'ncap_rating', 'old_value', COALESCE(existing_car.ncap_rating, 'null'), 'new_value', car_data->>'ncap_rating');
    END IF;

    -- Comfort features
    IF COALESCE(car_data->>'sunroof', '') != COALESCE(existing_car.sunroof, '') AND (car_data->>'sunroof') IS NOT NULL AND (car_data->>'sunroof') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'sunroof', 'old_value', COALESCE(existing_car.sunroof, 'null'), 'new_value', car_data->>'sunroof');
    END IF;

    -- Description
    IF COALESCE(car_data->>'description', '') != COALESCE(existing_car.description, '') AND (car_data->>'description') IS NOT NULL AND (car_data->>'description') != '' THEN
      has_changes := TRUE;
      changes := changes || jsonb_build_object('field', 'description', 'old_value', COALESCE(existing_car.description, 'null'), 'new_value', car_data->>'description');
    END IF;

    -- If no changes detected, return SKIPPED
    IF NOT has_changes THEN
      RETURN QUERY SELECT
        'SKIPPED'::TEXT,
        existing_car_id,
        car_brand,
        car_model,
        car_variant,
        'Car already exists with identical data'::TEXT,
        '[]'::jsonb;
      RETURN;
    END IF;

    -- Update the existing car with new values
    UPDATE public.cars
    SET
      price_min = COALESCE((car_data->>'price_min')::INTEGER, price_min),
      price_max = COALESCE((car_data->>'price_max')::INTEGER, price_max),
      exact_price = COALESCE(NULLIF(car_data->>'exact_price', ''), exact_price),
      fuel_type = COALESCE(NULLIF(car_data->>'fuel_type', ''), fuel_type),
      transmission = COALESCE(NULLIF(car_data->>'transmission', ''), transmission),
      engine_capacity = COALESCE(NULLIF(car_data->>'engine_capacity', ''), engine_capacity),
      mileage = COALESCE(NULLIF(car_data->>'mileage', ''), mileage),
      seating_capacity = COALESCE((car_data->>'seating_capacity')::INTEGER, seating_capacity),
      mumbai_price = COALESCE(NULLIF(car_data->>'mumbai_price', ''), mumbai_price),
      bangalore_price = COALESCE(NULLIF(car_data->>'bangalore_price', ''), bangalore_price),
      delhi_price = COALESCE(NULLIF(car_data->>'delhi_price', ''), delhi_price),
      pune_price = COALESCE(NULLIF(car_data->>'pune_price', ''), pune_price),
      hyderabad_price = COALESCE(NULLIF(car_data->>'hyderabad_price', ''), hyderabad_price),
      chennai_price = COALESCE(NULLIF(car_data->>'chennai_price', ''), chennai_price),
      kolkata_price = COALESCE(NULLIF(car_data->>'kolkata_price', ''), kolkata_price),
      ahmedabad_price = COALESCE(NULLIF(car_data->>'ahmedabad_price', ''), ahmedabad_price),
      colors = COALESCE(NULLIF(car_data->>'colors', ''), colors),
      color_codes = COALESCE(NULLIF(car_data->>'color_codes', ''), color_codes),
      warranty_years = COALESCE((car_data->>'warranty_years')::INTEGER, warranty_years),
      warranty_km = COALESCE((car_data->>'warranty_km')::INTEGER, warranty_km),
      battery_warranty_years = COALESCE((car_data->>'battery_warranty_years')::INTEGER, battery_warranty_years),
      battery_warranty_km = COALESCE((car_data->>'battery_warranty_km')::INTEGER, battery_warranty_km),
      ex_showroom_price = COALESCE(NULLIF(car_data->>'ex_showroom_price', ''), ex_showroom_price),
      rto_charges = COALESCE(NULLIF(car_data->>'rto_charges', ''), rto_charges),
      insurance_cost = COALESCE(NULLIF(car_data->>'insurance_cost', ''), insurance_cost),
      airbags = COALESCE(NULLIF(car_data->>'airbags', ''), airbags),
      ncap_rating = COALESCE(NULLIF(car_data->>'ncap_rating', ''), ncap_rating),
      abs = COALESCE((car_data->>'abs')::BOOLEAN, abs),
      esc = COALESCE((car_data->>'esc')::BOOLEAN, esc),
      sunroof = COALESCE(NULLIF(car_data->>'sunroof', ''), sunroof),
      ac_type = COALESCE(NULLIF(car_data->>'ac_type', ''), ac_type),
      cruise_control = COALESCE((car_data->>'cruise_control')::BOOLEAN, cruise_control),
      engine_type = COALESCE(NULLIF(car_data->>'engine_type', ''), engine_type),
      max_power = COALESCE(NULLIF(car_data->>'max_power', ''), max_power),
      max_torque = COALESCE(NULLIF(car_data->>'max_torque', ''), max_torque),
      top_speed = COALESCE(NULLIF(car_data->>'top_speed', ''), top_speed),
      acceleration = COALESCE(NULLIF(car_data->>'acceleration', ''), acceleration),
      length_mm = COALESCE(NULLIF(car_data->>'length_mm', ''), length_mm),
      width_mm = COALESCE(NULLIF(car_data->>'width_mm', ''), width_mm),
      height_mm = COALESCE(NULLIF(car_data->>'height_mm', ''), height_mm),
      wheelbase_mm = COALESCE(NULLIF(car_data->>'wheelbase_mm', ''), wheelbase_mm),
      ground_clearance_mm = COALESCE(NULLIF(car_data->>'ground_clearance_mm', ''), ground_clearance_mm),
      bootspace_litres = COALESCE(NULLIF(car_data->>'bootspace_litres', ''), bootspace_litres),
      description = COALESCE(NULLIF(car_data->>'description', ''), description),
      specifications = COALESCE(car_data->'specifications', specifications),
      updated_at = NOW()
    WHERE id = existing_car_id;

    -- Return UPDATE action with changes
    RETURN QUERY SELECT
      'UPDATED'::TEXT,
      existing_car_id,
      car_brand,
      car_model,
      car_variant,
      format('Car updated - %s field(s) changed', jsonb_array_length(changes))::TEXT,
      changes;
    RETURN;
  END IF;

  -- Insert new car (same as before)
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
    exact_price,
    mumbai_price,
    bangalore_price,
    delhi_price,
    pune_price,
    hyderabad_price,
    chennai_price,
    kolkata_price,
    ahmedabad_price,
    colors,
    color_codes,
    warranty_years,
    warranty_km,
    battery_warranty_years,
    battery_warranty_km,
    ex_showroom_price,
    rto_charges,
    insurance_cost,
    airbags,
    ncap_rating,
    abs,
    esc,
    sunroof,
    ac_type,
    cruise_control,
    engine_type,
    max_power,
    max_torque,
    top_speed,
    acceleration,
    length_mm,
    width_mm,
    height_mm,
    wheelbase_mm,
    ground_clearance_mm,
    bootspace_litres,
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
    car_data->>'exact_price',
    car_data->>'mumbai_price',
    car_data->>'bangalore_price',
    car_data->>'delhi_price',
    car_data->>'pune_price',
    car_data->>'hyderabad_price',
    car_data->>'chennai_price',
    car_data->>'kolkata_price',
    car_data->>'ahmedabad_price',
    car_data->>'colors',
    car_data->>'color_codes',
    (car_data->>'warranty_years')::INTEGER,
    (car_data->>'warranty_km')::INTEGER,
    (car_data->>'battery_warranty_years')::INTEGER,
    (car_data->>'battery_warranty_km')::INTEGER,
    car_data->>'ex_showroom_price',
    car_data->>'rto_charges',
    car_data->>'insurance_cost',
    car_data->>'airbags',
    car_data->>'ncap_rating',
    (car_data->>'abs')::BOOLEAN,
    (car_data->>'esc')::BOOLEAN,
    car_data->>'sunroof',
    car_data->>'ac_type',
    (car_data->>'cruise_control')::BOOLEAN,
    car_data->>'engine_type',
    car_data->>'max_power',
    car_data->>'max_torque',
    car_data->>'top_speed',
    car_data->>'acceleration',
    car_data->>'length_mm',
    car_data->>'width_mm',
    car_data->>'height_mm',
    car_data->>'wheelbase_mm',
    car_data->>'ground_clearance_mm',
    car_data->>'bootspace_litres',
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
    'Car successfully added to database'::TEXT,
    '[]'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Enhanced Bulk Insert Function with Update Statistics
-- =====================================================

DROP FUNCTION IF EXISTS public.bulk_upsert_cars_with_tracking(jsonb);

CREATE OR REPLACE FUNCTION public.bulk_upsert_cars_with_tracking(cars_data jsonb)
RETURNS TABLE(
  total_processed INTEGER,
  inserted_count INTEGER,
  updated_count INTEGER,
  skipped_count INTEGER,
  error_count INTEGER,
  details jsonb
) AS $$
DECLARE
  car_record jsonb;
  result_record RECORD;
  total INTEGER := 0;
  inserted INTEGER := 0;
  updated INTEGER := 0;
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
      FOR result_record IN SELECT * FROM public.upsert_car_data_with_tracking(car_record)
      LOOP
        -- Count the result
        IF result_record.action = 'INSERTED' THEN
          inserted := inserted + 1;
        ELSIF result_record.action = 'UPDATED' THEN
          updated := updated + 1;
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
          'message', result_record.message,
          'changed_fields', result_record.changed_fields
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
        'message', SQLERRM,
        'changed_fields', '[]'::jsonb
      );
    END;
  END LOOP;

  -- Return statistics
  RETURN QUERY SELECT
    total,
    inserted,
    updated,
    skipped,
    errors,
    results;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Example Usage
-- =====================================================
-- Single car upsert with tracking:
-- SELECT * FROM public.upsert_car_data_with_tracking(
--   '{
--     "brand": "BMW",
--     "model": "3 Series",
--     "variant": "330i Sport",
--     "price_min": 4500000,
--     "exact_price": "₹ 45 Lakh",
--     "fuel_type": "Petrol",
--     "transmission": "Automatic"
--   }'::jsonb
-- );

-- Bulk upsert with tracking:
-- SELECT * FROM public.bulk_upsert_cars_with_tracking(
--   '[
--     {"brand": "BMW", "model": "3 Series", "variant": "330i Sport", "price_min": 4500000, ...},
--     {"brand": "BMW", "model": "3 Series", "variant": "320d Sport", "price_min": 4200000, ...}
--   ]'::jsonb
-- );
