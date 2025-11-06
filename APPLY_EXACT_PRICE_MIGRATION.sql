-- Run this in Supabase SQL Editor to add exact_price column
-- Step 1: Check if column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cars'
AND column_name = 'exact_price';

-- Step 2: If the above query returns no rows, run this:
ALTER TABLE public.cars ADD COLUMN exact_price TEXT;

-- Step 3: Create index
CREATE INDEX idx_cars_exact_price ON public.cars(exact_price);

-- Step 4: Add comment
COMMENT ON COLUMN public.cars.exact_price IS 'Base price from Excel "Price" column (column 6)';

-- Step 5: Verify the column was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cars'
AND column_name IN ('exact_price', 'delhi_price', 'mumbai_price')
ORDER BY column_name;
