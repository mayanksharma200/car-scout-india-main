-- Add dedicated columns for important car data (also stored in specifications JSONB)
-- This allows fast queries while keeping full flexibility in specifications

-- City-specific pricing
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS mumbai_price TEXT,
ADD COLUMN IF NOT EXISTS bangalore_price TEXT,
ADD COLUMN IF NOT EXISTS delhi_price TEXT,
ADD COLUMN IF NOT EXISTS pune_price TEXT,
ADD COLUMN IF NOT EXISTS hyderabad_price TEXT,
ADD COLUMN IF NOT EXISTS chennai_price TEXT,
ADD COLUMN IF NOT EXISTS kolkata_price TEXT,
ADD COLUMN IF NOT EXISTS ahmedabad_price TEXT;

-- Colors
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS colors TEXT,
ADD COLUMN IF NOT EXISTS color_codes TEXT;

-- Warranty information
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS warranty_years INTEGER,
ADD COLUMN IF NOT EXISTS warranty_km INTEGER,
ADD COLUMN IF NOT EXISTS battery_warranty_years INTEGER,
ADD COLUMN IF NOT EXISTS battery_warranty_km INTEGER;

-- Price breakdown
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS ex_showroom_price TEXT,
ADD COLUMN IF NOT EXISTS rto_charges TEXT,
ADD COLUMN IF NOT EXISTS insurance_cost TEXT;

-- Safety features
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS airbags TEXT,
ADD COLUMN IF NOT EXISTS ncap_rating TEXT,
ADD COLUMN IF NOT EXISTS abs BOOLEAN,
ADD COLUMN IF NOT EXISTS esc BOOLEAN;

-- Comfort features
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS sunroof TEXT,
ADD COLUMN IF NOT EXISTS ac_type TEXT,
ADD COLUMN IF NOT EXISTS cruise_control BOOLEAN;

-- Engine details (expanded)
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS engine_type TEXT,
ADD COLUMN IF NOT EXISTS max_power TEXT,
ADD COLUMN IF NOT EXISTS max_torque TEXT,
ADD COLUMN IF NOT EXISTS top_speed TEXT,
ADD COLUMN IF NOT EXISTS acceleration TEXT;

-- Dimensions
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS length_mm TEXT,
ADD COLUMN IF NOT EXISTS width_mm TEXT,
ADD COLUMN IF NOT EXISTS height_mm TEXT,
ADD COLUMN IF NOT EXISTS wheelbase_mm TEXT,
ADD COLUMN IF NOT EXISTS ground_clearance_mm TEXT,
ADD COLUMN IF NOT EXISTS bootspace_litres TEXT;

-- Description
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_cars_mumbai_price ON public.cars(mumbai_price);
CREATE INDEX IF NOT EXISTS idx_cars_delhi_price ON public.cars(delhi_price);
CREATE INDEX IF NOT EXISTS idx_cars_bangalore_price ON public.cars(bangalore_price);
CREATE INDEX IF NOT EXISTS idx_cars_colors ON public.cars(colors);
CREATE INDEX IF NOT EXISTS idx_cars_warranty_years ON public.cars(warranty_years);
CREATE INDEX IF NOT EXISTS idx_cars_airbags ON public.cars(airbags);
CREATE INDEX IF NOT EXISTS idx_cars_sunroof ON public.cars(sunroof);

COMMENT ON COLUMN public.cars.mumbai_price IS 'On-road price in Mumbai (also in specifications->column_231)';
COMMENT ON COLUMN public.cars.bangalore_price IS 'On-road price in Bangalore (also in specifications->column_232)';
COMMENT ON COLUMN public.cars.delhi_price IS 'On-road price in Delhi (also in specifications->column_233)';
COMMENT ON COLUMN public.cars.specifications IS 'Full JSONB data with all 245 columns from Excel';
