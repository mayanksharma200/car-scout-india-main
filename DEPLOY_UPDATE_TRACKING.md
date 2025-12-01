# Deploy Car Import with Update Tracking Feature

This guide will help you deploy the new enhanced car import functionality that automatically updates existing cars when their fields change.

## What's New?

### Before
- Duplicate cars (same Brand + Model + Variant) were **SKIPPED**
- No way to update existing cars from CSV/Excel files
- No visibility into what changed

### After
- Duplicate cars are **COMPARED** field by field
- If any field has changed (price, specifications, city prices, etc.), the car is **UPDATED**
- Detailed report shows exactly which fields were changed for each car
- Three outcomes: INSERTED (new), UPDATED (changed), or SKIPPED (identical)

## Features

✅ **Smart Field Comparison** - Compares all important fields:
- Price fields (price_min, price_max, exact_price)
- Specifications (fuel_type, transmission, engine_capacity, mileage, seating_capacity)
- City-specific pricing (Mumbai, Delhi, Bangalore, Pune, etc.)
- Features (colors, airbags, sunroof, NCAP rating)
- Dimensions and other details

✅ **Detailed Change Tracking** - Shows old vs new values:
```
BMW 3 Series 330i Sport
  price_min: ₹42,30,000 → ₹45,00,000
  fuel_type: Petrol → Hybrid
  mumbai_price: ₹45 Lakh → ₹48 Lakh
```

✅ **Updated UI** - Enhanced admin panel with:
- Statistics showing Inserted, Updated, and Skipped counts
- Expandable sections for each category
- Beautiful change visualization with old → new values

## Deployment Steps

### Step 1: Deploy SQL Functions to Supabase

You need to execute the new SQL functions in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/uioyehbpjxcykvfnmcuk/sql
   ```

2. Open the new SQL file:
   ```
   supabase/migrations/upsert_cars_with_update_tracking.sql
   ```

3. Copy the entire content and paste it into the SQL editor

4. Click "Run" to execute

5. You should see a success message. The following functions will be created:
   - `upsert_car_data_with_tracking(jsonb)` - Single car upsert with change tracking
   - `bulk_upsert_cars_with_tracking(jsonb)` - Bulk upsert with change tracking

**Option B: Using Supabase CLI (Alternative)**

If you have Supabase CLI installed:

```bash
# Make sure you're logged in
npx supabase login

# Link to your project
npx supabase link --project-ref uioyehbpjxcykvfnmcuk

# Run the migration
npx supabase db push
```

### Step 2: Verify Deployment

Test the new functions in Supabase SQL Editor:

```sql
-- Test single car upsert with tracking
SELECT * FROM public.upsert_car_data_with_tracking(
  '{
    "brand": "Test Brand",
    "model": "Test Model",
    "variant": "Test Variant",
    "price_min": 1000000,
    "fuel_type": "Petrol"
  }'::jsonb
);

-- Run again with different price to see update tracking
SELECT * FROM public.upsert_car_data_with_tracking(
  '{
    "brand": "Test Brand",
    "model": "Test Model",
    "variant": "Test Variant",
    "price_min": 1200000,
    "fuel_type": "Petrol"
  }'::jsonb
);

-- Check the result - should show UPDATED with changed_fields
```

Expected output on second run:
```
action: "UPDATED"
car_id: <uuid>
brand: "Test Brand"
model: "Test Model"
variant: "Test Variant"
message: "Car updated - 1 field(s) changed"
changed_fields: [{"field": "price_min", "old_value": "1000000", "new_value": "1200000"}]
```

### Step 3: Rebuild and Deploy Frontend

The TypeScript changes are already in place. You just need to rebuild:

```bash
# Install dependencies (if needed)
npm install

# Build the project
npm run build

# Or start development server to test
npm run dev
```

### Step 4: Test the Feature

1. Go to your admin panel: `/admin/cars`

2. Click on the **Bulk Import** tab

3. Select the **Excel/CSV Upload** option

4. Upload a test Excel/CSV file with some cars

5. After import, you should see:
   - Statistics with counts for Inserted, Updated, and Skipped
   - Expandable sections showing:
     - ✅ Successfully Inserted (new cars)
     - 🔄 Successfully Updated (with changed fields highlighted)
     - ⏭️ Skipped (identical cars)

6. For updated cars, you'll see exactly which fields changed:
   ```
   BMW 3 Series 330i Sport
     price_min: 4230000 → 4500000
     exact_price: ₹ 42.30 Lakh → ₹ 45 Lakh
     mumbai_price: ₹ 45 Lakh → ₹ 48 Lakh
   ```

## Files Changed

### New Files
- `supabase/migrations/upsert_cars_with_update_tracking.sql` - Enhanced SQL functions
- `DEPLOY_UPDATE_TRACKING.md` - This deployment guide

### Modified Files
- `src/utils/bulkCarInsertion.ts` - Added `bulkInsertCarsWithTracking()` function
- `src/components/CSVFileUploader.tsx` - Updated UI to show update results

## Troubleshooting

### TypeScript Error: 'bulk_upsert_cars_with_tracking' is not assignable

This is because the Supabase client types don't know about the new RPC function yet. This is expected and the code will still work at runtime once you deploy the SQL functions.

To fix the TypeScript error, you can:
1. Regenerate Supabase types: `npx supabase gen types typescript --project-id uioyehbpjxcykvfnmcuk > src/types/supabase.ts`
2. Or add a type assertion: `supabase.rpc('bulk_upsert_cars_with_tracking' as any, ...)`

### SQL Error: Function already exists

If you get an error that the function already exists, the SQL file includes `DROP FUNCTION IF EXISTS` statements, so this shouldn't happen. If it does, run:

```sql
DROP FUNCTION IF EXISTS public.upsert_car_data_with_tracking(jsonb);
DROP FUNCTION IF EXISTS public.bulk_upsert_cars_with_tracking(jsonb);
```

Then run the deployment again.

### No changes detected when there should be

Make sure:
1. The fields you're updating are not empty strings in the CSV
2. The new values are actually different from the old values
3. Check the console logs - they show detailed comparison information

## Example Use Cases

### Use Case 1: Price Updates
Your supplier sends you a monthly CSV with updated prices. Simply upload it:
- New cars → Inserted
- Cars with price changes → Updated (you'll see old price → new price)
- Cars with same data → Skipped

### Use Case 2: Specification Corrections
Found errors in your database? Fix them in Excel and re-upload:
- Only the corrected fields will be updated
- You'll get a report of every change made

### Use Case 3: Adding City Prices
Upload a CSV with city-specific pricing:
- Cars without city prices → Updated with new pricing
- Report shows which cities were added for each car

## Rollback

If you need to rollback to the old behavior (skip duplicates instead of updating):

1. In `CSVFileUploader.tsx`, change:
   ```typescript
   import { bulkInsertCarsWithTracking, ... } from '@/utils/bulkCarInsertion';
   ```
   to:
   ```typescript
   import { bulkInsertCars, ... } from '@/utils/bulkCarInsertion';
   ```

2. Change the import call:
   ```typescript
   const importResult = await bulkInsertCars(cars);
   ```

This will use the old `bulk_upsert_cars` function that skips duplicates.

## Support

If you encounter any issues:
1. Check the browser console for detailed logs
2. Check the Supabase logs in the dashboard
3. Verify the SQL functions are deployed correctly
4. Make sure your CSV/Excel has the expected column structure

---

**Deployment Date**: 2025-11-09
**Version**: 2.0 - Smart Update with Change Tracking
