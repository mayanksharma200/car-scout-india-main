-- Add exact_price column to store the base price from "Price" column in Excel
-- This is different from on-road prices (mumbai_price, delhi_price, etc.)
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS exact_price TEXT;

-- Create index for price queries
CREATE INDEX IF NOT EXISTS idx_cars_exact_price ON public.cars(exact_price);

-- Add comment to document the column
COMMENT ON COLUMN public.cars.exact_price IS 'Base price from Excel "Price" column (column 6), shown as exact_price on listings. Display "N/A" if null.';
