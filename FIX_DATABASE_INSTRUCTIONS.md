# Fix Database Column Rotation Issue - Step by Step

## Problem
When uploading Excel files, the data is being rotated in the database:
- `fuel_type` contains transmission values ("Manual", "Automatic")
- `transmission` contains engine capacity ("1497 cc", "1995 cc")
- `engine_capacity` contains mileage ("21.1 kmpl", "22.69 kmpl")
- `mileage` contains price ("₹ 12.09 Lakh")

## Root Cause
The PostgreSQL function `upsert_car_data` in your Supabase database has the VALUES in the wrong order, causing data to be inserted into the wrong columns.

## Solution - Follow These Steps EXACTLY:

### Step 1: Backup Your Data (Optional but Recommended)
1. Go to your Supabase Dashboard
2. Navigate to Table Editor → cars table
3. Click "Export" to download a backup

### Step 2: Deploy the Fixed SQL Function

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/uioyehbpjxcykvfnmcuk/sql
   - Click "New Query"

2. **Copy the Fixed SQL**
   - Open the file: `FIXED_upsert_cars_function.sql` (in this directory)
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

3. **Paste and Execute**
   - Paste into the Supabase SQL Editor
   - Click "Run" button (or press F5)
   - Wait for success message: "Success. No rows returned"

4. **Verify the Function Was Updated**
   - You should see: "DROP FUNCTION" and "CREATE FUNCTION" executed successfully

### Step 3: Delete All Existing (Incorrect) Car Data

**IMPORTANT:** The existing data in your database has wrong values in wrong columns. You MUST delete it before re-uploading.

1. Go to Table Editor → cars table
2. Select all rows (click checkbox at top)
3. Click "Delete" button
4. Confirm deletion

**Alternative using SQL:**
```sql
DELETE FROM public.cars;
```

### Step 4: Refresh Your Admin Panel

1. Go to your admin panel in the browser
2. Press Ctrl+Shift+R (hard refresh) to clear cache and reload the JavaScript
3. This ensures the updated frontend code is loaded

### Step 5: Re-Upload Your Excel File

1. Go to the Bulk Upload section
2. Select your Excel file
3. Click "Import Cars"
4. **Check the browser console** (F12 → Console tab) for debug logs:
   - Look for: `🔍 Row X - FINAL carData object being sent to DB:`
   - Verify it shows:
     - `fuel_type (should be Petrol/Diesel)`: "Petrol" or "Diesel"
     - `transmission (should be Manual/Automatic)`: "Manual" or "Automatic"
     - `engine_capacity (should be 1199 cc)`: "1199 cc" or "1497 cc"
     - `mileage (should be 18.2 kmpl)`: "18.2 kmpl" or "22 kmpl"

### Step 6: Verify the Data is Correct

1. Go to Supabase Dashboard → Table Editor → cars table
2. Check the first few rows:
   - `fuel_type` should show: "Petrol", "Diesel", "CNG", "Petrol+CNG"
   - `transmission` should show: "Manual", "Automatic", "Automatic (AMT)"
   - `engine_capacity` should show: "1199 cc", "1497 cc", "1995 cc"
   - `mileage` should show: "18.2 kmpl", "22 kmpl", "23.97 kmpl"

3. Check your Compare page:
   - Fuel Type should show Petrol/Diesel
   - Transmission should show Manual/Automatic
   - Engine should show cc values
   - Mileage should show kmpl values

## What Changed?

The fixed SQL function now explicitly maps each field:

**OLD (WRONG) - Implicit ordering might cause rotation:**
```sql
INSERT INTO cars (...columns...) VALUES (...values...)
```

**NEW (CORRECT) - Explicit column-to-value mapping:**
```sql
INSERT INTO public.cars (
  fuel_type,           -- Column 1
  transmission,        -- Column 2
  engine_capacity,     -- Column 3
  mileage             -- Column 4
) VALUES (
  car_data->>'fuel_type',        -- Maps to Column 1 ✓
  car_data->>'transmission',     -- Maps to Column 2 ✓
  car_data->>'engine_capacity',  -- Maps to Column 3 ✓
  car_data->>'mileage'           -- Maps to Column 4 ✓
);
```

## Troubleshooting

### If data is still rotated after following all steps:

1. **Check SQL function deployment:**
   ```sql
   -- Run this in Supabase SQL Editor to see the function definition:
   SELECT pg_get_functiondef('public.upsert_car_data'::regproc);
   ```
   - Verify it shows the NEW function definition

2. **Check browser console logs:**
   - Look for the debug output showing what values are being sent
   - Share the console output if issues persist

3. **Check if function exists:**
   ```sql
   SELECT routine_name
   FROM information_schema.routines
   WHERE routine_name IN ('upsert_car_data', 'bulk_upsert_cars');
   ```
   - Should show both functions

## Need Help?

If the issue persists after following ALL steps above:
1. Share a screenshot of the browser console logs during upload
2. Share a screenshot of the database table after re-upload
3. Share the result of the "Check SQL function deployment" query above
