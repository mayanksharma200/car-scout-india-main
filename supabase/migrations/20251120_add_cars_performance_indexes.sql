-- Add performance indexes for cars table to speed up queries
-- This migration adds indexes on commonly queried columns

-- Index on status column (most queries filter by status='active')
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);

-- Index on brand column (frequently used in filters)
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);

-- Index on model column (frequently used in filters)
CREATE INDEX IF NOT EXISTS idx_cars_model ON cars(model);

-- Composite index on status and brand (common combination)
CREATE INDEX IF NOT EXISTS idx_cars_status_brand ON cars(status, brand);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);

-- Index on price_min for range queries
CREATE INDEX IF NOT EXISTS idx_cars_price_min ON cars(price_min);

-- Index on price_max for range queries
CREATE INDEX IF NOT EXISTS idx_cars_price_max ON cars(price_max);

-- Index on fuel_type for filtering
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);

-- Index on transmission for filtering
CREATE INDEX IF NOT EXISTS idx_cars_transmission ON cars(transmission);

-- Composite index for the most common query pattern: status + brand + ordering
CREATE INDEX IF NOT EXISTS idx_cars_status_brand_created ON cars(status, brand, created_at DESC);
