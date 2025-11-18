-- Add fuel_tank_capacity_litres column to cars table
-- This column was missing from the original schema but is needed for the AddEditCar form

ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS fuel_tank_capacity_litres TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_cars_fuel_tank_capacity ON public.cars(fuel_tank_capacity_litres);

-- Add comment
COMMENT ON COLUMN public.cars.fuel_tank_capacity_litres IS 'Fuel tank capacity in litres (also in specifications->"Fuel Tank Capacity" or specifications->fuel_tank_capacity)';