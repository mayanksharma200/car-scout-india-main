# Deploy SQL Functions - Quick Guide

## You Need to Deploy SQL Functions Before Using Bulk Import

The bulk car insertion UI requires two PostgreSQL functions to be deployed to your Supabase database.

## Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/uioyehbpjxcykvfnmcuk/sql/new
2. You'll see a blank SQL query editor

## Step 2: Copy and Paste the SQL

Open this file in your project:
```
supabase/migrations/upsert_cars_function.sql
```

Copy the ENTIRE contents of that file and paste it into the SQL Editor.

## Step 3: Execute the SQL

Click the green **"RUN"** button (or press `Ctrl+Enter` on Windows/Linux or `Cmd+Enter` on Mac)

You should see a success message like:
```
Success. No rows returned
```

## Step 4: Verify Functions Are Created

Run this query in the SQL Editor to verify:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('upsert_car_data', 'bulk_upsert_cars');
```

You should see:
```
routine_name        | routine_type
--------------------|-------------
upsert_car_data     | FUNCTION
bulk_upsert_cars    | FUNCTION
```

## Step 5: Test the Functions (Optional)

Test single car insert:
```sql
SELECT * FROM public.upsert_car_data(
  '{
    "brand": "Test Brand",
    "model": "Test Model",
    "variant": "Test Variant",
    "price_min": 1000000,
    "fuel_type": "Petrol",
    "status": "active"
  }'::jsonb
);
```

## That's It!

Once the functions are deployed, go back to your admin panel:
1. Navigate to **Admin > Manage Cars**
2. Scroll down to see the **Bulk Car Insertion** section
3. Paste your JSON array of cars
4. Click **Import Cars**

---

## Quick Copy-Paste SQL (Alternative)

If you can't open the file, here's the quick version - just paste this directly:

\`\`\`sql
-- Drop existing functions
DROP FUNCTION IF EXISTS public.upsert_car_data(jsonb);
DROP FUNCTION IF EXISTS public.bulk_upsert_cars(jsonb);

-- Create single car upsert function
CREATE OR REPLACE FUNCTION public.upsert_car_data(car_data jsonb)
RETURNS TABLE(action TEXT, car_id UUID, brand TEXT, model TEXT, variant TEXT, message TEXT) AS $$
DECLARE
  existing_car_id UUID;
  new_car_id UUID;
  car_brand TEXT;
  car_model TEXT;
  car_variant TEXT;
BEGIN
  car_brand := car_data->>'brand';
  car_model := car_data->>'model';
  car_variant := car_data->>'variant';

  SELECT id INTO existing_car_id FROM public.cars
  WHERE LOWER(TRIM(cars.brand)) = LOWER(TRIM(car_brand))
    AND LOWER(TRIM(cars.model)) = LOWER(TRIM(car_model))
    AND ((car_variant IS NULL AND cars.variant IS NULL)
      OR (LOWER(TRIM(cars.variant)) = LOWER(TRIM(car_variant))))
  LIMIT 1;

  IF existing_car_id IS NOT NULL THEN
    RETURN QUERY SELECT 'SKIPPED'::TEXT, existing_car_id, car_brand, car_model, car_variant, 'Car already exists'::TEXT;
    RETURN;
  END IF;

  INSERT INTO public.cars (external_id, brand, model, variant, price_min, price_max, fuel_type, transmission, engine_capacity, mileage, body_type, seating_capacity, images, specifications, features, status, api_source)
  VALUES (
    car_data->>'external_id', car_brand, car_model, car_variant,
    (car_data->>'price_min')::INTEGER, (car_data->>'price_max')::INTEGER,
    car_data->>'fuel_type', car_data->>'transmission', car_data->>'engine_capacity', car_data->>'mileage',
    car_data->>'body_type', (car_data->>'seating_capacity')::INTEGER,
    COALESCE(car_data->'images', '[]'::jsonb), COALESCE(car_data->'specifications', '{}'::jsonb),
    COALESCE(car_data->'features', '[]'::jsonb), COALESCE(car_data->>'status', 'active'), car_data->>'api_source'
  ) RETURNING id INTO new_car_id;

  RETURN QUERY SELECT 'INSERTED'::TEXT, new_car_id, car_brand, car_model, car_variant, 'Successfully added'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Create bulk upsert function
CREATE OR REPLACE FUNCTION public.bulk_upsert_cars(cars_data jsonb)
RETURNS TABLE(total_processed INTEGER, inserted_count INTEGER, skipped_count INTEGER, error_count INTEGER, details jsonb) AS $$
DECLARE
  car_record jsonb;
  result_record RECORD;
  total INTEGER := 0;
  inserted INTEGER := 0;
  skipped INTEGER := 0;
  errors INTEGER := 0;
  results jsonb := '[]'::jsonb;
BEGIN
  FOR car_record IN SELECT * FROM jsonb_array_elements(cars_data) LOOP
    total := total + 1;
    BEGIN
      FOR result_record IN SELECT * FROM public.upsert_car_data(car_record) LOOP
        IF result_record.action = 'INSERTED' THEN inserted := inserted + 1;
        ELSIF result_record.action = 'SKIPPED' THEN skipped := skipped + 1;
        END IF;
        results := results || jsonb_build_object('action', result_record.action, 'car_id', result_record.car_id, 'brand', result_record.brand, 'model', result_record.model, 'variant', result_record.variant, 'message', result_record.message);
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      results := results || jsonb_build_object('action', 'ERROR', 'brand', car_record->>'brand', 'model', car_record->>'model', 'variant', car_record->>'variant', 'message', SQLERRM);
    END;
  END LOOP;
  RETURN QUERY SELECT total, inserted, skipped, errors, results;
END;
$$ LANGUAGE plpgsql;
\`\`\`

Copy everything from `-- Drop existing functions` to the end and paste it in the SQL Editor, then click RUN.
