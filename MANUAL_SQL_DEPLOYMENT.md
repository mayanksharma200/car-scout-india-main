# Manual SQL Function Deployment Guide

Since the Supabase client cannot execute DDL (Data Definition Language) statements directly, you need to deploy the SQL functions manually through the Supabase Dashboard.

## Step-by-Step Instructions

### 1. Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `uioyehbpjxcykvfnmcuk`
3. Navigate to **SQL Editor** in the left sidebar
4. Click on **New Query**

### 2. Deploy the Upsert Functions

Copy and paste the entire contents of this file into the SQL Editor:

```
supabase/migrations/upsert_cars_function.sql
```

Then click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

### 3. Verify Deployment

After running the SQL, you should see a success message. The following functions will be created:

- `public.upsert_car_data(jsonb)` - Inserts a single car with duplicate checking
- `public.bulk_upsert_cars(jsonb)` - Bulk inserts multiple cars with statistics

### 4. Test the Functions

You can test the functions directly in the SQL Editor:

#### Test Single Car Insert:

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

#### Test Bulk Insert:

```sql
SELECT * FROM public.bulk_upsert_cars(
  '[
    {"brand": "BMW", "model": "3 Series", "variant": "330i Sport", "price_min": 4230000, "fuel_type": "Petrol"},
    {"brand": "BMW", "model": "3 Series", "variant": "320d Sport", "price_min": 4280000, "fuel_type": "Diesel"}
  ]'::jsonb
);
```

## Alternative: Quick Deploy via Command Line (if Supabase CLI is installed)

If you have the Supabase CLI installed, you can deploy using:

```bash
cd "/Users/mayanksharma/codebase repos/car-scout-india-main"
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@db.uioyehbpjxcykvfnmcuk.supabase.co:5432/postgres" --file supabase/migrations/upsert_cars_function.sql
```

## What These Functions Do

### `upsert_car_data(car_data jsonb)`

- Checks if a car already exists (based on brand, model, variant)
- If it exists: Returns 'SKIPPED' action
- If it doesn't exist: Inserts the car and returns 'INSERTED' action
- Returns detailed information about the operation

### `bulk_upsert_cars(cars_data jsonb)`

- Processes an array of car objects
- For each car, calls `upsert_car_data`
- Collects statistics:
  - Total processed
  - Number inserted
  - Number skipped (duplicates)
  - Number of errors
- Returns detailed results for each car

## Next Steps

After deploying these functions, you can:

1. Use the TypeScript utilities in `src/utils/bulkCarInsertion.ts`
2. Run the example script: `npx tsx scripts/importCarsFromSQL.ts`
3. Import your full car database with automatic duplicate detection
