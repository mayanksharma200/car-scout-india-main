-- =====================================================
-- Clear Existing Car Data
-- =====================================================
-- This script removes all existing car data from the database
-- Run this before importing new car data to start fresh
-- =====================================================

-- Disable triggers temporarily to speed up deletion
ALTER TABLE public.cars DISABLE TRIGGER ALL;
ALTER TABLE public.leads DISABLE TRIGGER ALL;
ALTER TABLE public.user_wishlist DISABLE TRIGGER ALL;
ALTER TABLE public.price_alerts DISABLE TRIGGER ALL;

-- Delete all car-related data (cascades to related tables)
DELETE FROM public.cars;

-- Re-enable triggers
ALTER TABLE public.cars ENABLE TRIGGER ALL;
ALTER TABLE public.leads ENABLE TRIGGER ALL;
ALTER TABLE public.user_wishlist ENABLE TRIGGER ALL;
ALTER TABLE public.price_alerts ENABLE TRIGGER ALL;

-- Reset sequences if needed
-- (PostgreSQL auto-generates UUIDs, so no sequence reset needed)

-- Vacuum to reclaim storage
VACUUM FULL public.cars;
VACUUM FULL public.leads;
VACUUM FULL public.user_wishlist;
VACUUM FULL public.price_alerts;

-- Display statistics
SELECT 'Cars deleted successfully' AS status;
SELECT COUNT(*) AS remaining_cars FROM public.cars;
