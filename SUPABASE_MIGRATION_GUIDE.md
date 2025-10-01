# Supabase Migration Guide - Complete Documentation

## Overview
This document provides complete step-by-step instructions for migrating a Supabase project from one account to another, including all database tables, edge functions, secrets, policies, and data.

**Migration Date:** October 1, 2025
**Source Project:** gfjhsljeezfdkknhsrxx
**Target Project:** uioyehbpjxcykvfnmcuk

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Schema Migration](#schema-migration)
4. [Data Backup](#data-backup)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Secrets Configuration](#secrets-configuration)
7. [Data Restoration](#data-restoration)
8. [Authentication Setup](#authentication-setup)
9. [Environment Configuration](#environment-configuration)
10. [Troubleshooting](#troubleshooting)
11. [Verification](#verification)

---

## Prerequisites

### Required Tools
- Docker Desktop (for database operations)
- Node.js and npm
- Supabase CLI (`npm install -g supabase`)
- Git (for version control)

### Access Requirements
- Admin access to both old and new Supabase accounts
- Project IDs for both accounts
- Database passwords for both projects

---

## Initial Setup

### 1. Login to Current Supabase Account
```bash
npx supabase login
```

### 2. Link to Current Project
```bash
npx supabase link --project-ref gfjhsljeezfdkknhsrxx
```

### 3. Verify Connection
```bash
npx supabase status
npx supabase migration list
```

### 4. Repair Migration History (if needed)
If migration history is out of sync:
```bash
npx supabase migration repair --status reverted 20250731050737
npx supabase migration repair --status reverted 20250731050806
npx supabase migration repair --status reverted 20250801053724
npx supabase migration repair --status reverted 20250819062155
npx supabase migration repair --status applied 001
npx supabase migration repair --status applied 20250731050744
npx supabase migration repair --status applied 20250731050813
```

---

## Schema Migration

### Existing Migrations
Your project should have these base migrations:
- `001_create_profiles_table.sql` - Profiles table with RLS
- `20250731050744_*.sql` - Main tables (cars, leads, api_settings)
- `20250731050813_*.sql` - Security fixes

### Additional Migrations Required

These tables were created directly in the old database and need migrations:

#### 1. User Sessions Table
**File:** `supabase/migrations/20251001120852_add_user_sessions_table.sql`

```sql
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions"
ON public.user_sessions FOR ALL USING (true);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON public.user_sessions(is_active);
```

#### 2. Cars Image Columns
**File:** `supabase/migrations/20251001121803_add_cars_image_columns.sql`

```sql
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS imagin_images JSONB,
ADD COLUMN IF NOT EXISTS image_last_updated TIMESTAMP WITH TIME ZONE;
```

#### 3. Missing Public Tables
**File:** `supabase/migrations/20251001123728_add_missing_tables.sql`

```sql
-- auth_audit_logs
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- otp_verification
CREATE TABLE IF NOT EXISTS public.otp_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  phone TEXT,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  mobile_no TEXT,
  purpose TEXT DEFAULT 'verification',
  attempts INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending'
);

-- price_alerts
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  target_price INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  category TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- user_activity_logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- user_wishlist
CREATE TABLE IF NOT EXISTS public.user_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- wishlist_shares
CREATE TABLE IF NOT EXISTS public.wishlist_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Views
CREATE OR REPLACE VIEW public.active_user_sessions AS
SELECT * FROM public.user_sessions WHERE is_active = true;

CREATE OR REPLACE VIEW public.user_wishlist_with_cars AS
SELECT
  uw.id, uw.user_id, uw.car_id, uw.added_at,
  c.brand, c.model, c.variant, c.price_min, c.price_max,
  c.images, c.fuel_type, c.transmission
FROM public.user_wishlist uw
LEFT JOIN public.cars c ON uw.car_id = c.id;

-- Enable RLS
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_shares ENABLE ROW LEVEL SECURITY;

-- Policies for user_wishlist
CREATE POLICY "Users can view their own wishlist"
ON public.user_wishlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
ON public.user_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist"
ON public.user_wishlist FOR DELETE USING (auth.uid() = user_id);

-- Policies for price_alerts
CREATE POLICY "Users can view their own price alerts"
ON public.price_alerts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create price alerts"
ON public.price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role policies
CREATE POLICY "Service role can manage all" ON public.auth_audit_logs FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.otp_verification FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.products FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.user_activity_logs FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.wishlist_shares FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_auth_audit_logs_user_id ON public.auth_audit_logs(user_id);
CREATE INDEX idx_otp_verification_email ON public.otp_verification(email);
CREATE INDEX idx_otp_verification_mobile ON public.otp_verification(mobile_no);
CREATE INDEX idx_otp_verification_phone ON public.otp_verification(phone);
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_wishlist_user_id ON public.user_wishlist(user_id);
```

#### 4. Fix Profiles Table Structure
**File:** `supabase/migrations/20251001125052_fix_profiles_table_structure.sql`

```sql
-- Drop old column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- Add required columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Fix trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone,
    email_verified, is_active
  )
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Data Backup

### 1. Start Docker Desktop
Docker is required for database dump operations.

### 2. Create Complete Backup
```bash
npx supabase db dump --file supabase/backup-data.sql --data-only
```

This creates a backup with all table data (approximately 1.2 MB).

### 3. Edge Functions
Already in `supabase/functions/` directory:
- add-test-data
- import-comprehensive-cars
- sync-api-ninjas-data
- sync-carwale-data
- update-car-images

### 4. Document Secrets
```bash
npx supabase secrets list
```

Expected secrets:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL
- TEST_API_KEY

---

## Switch to New Account

### 1. Logout
```bash
npx supabase logout
```

### 2. Login to New Account
```bash
npx supabase login
```

### 3. Link New Project
```bash
npx supabase link --project-ref uioyehbpjxcykvfnmcuk
```

### 4. Push All Migrations
```bash
npx supabase db push
```

Confirm with `Y` for each migration.

---

## Edge Functions Deployment

### Deploy All Functions
```bash
npx supabase functions deploy
```

### Verify
```bash
npx supabase functions list
```

All 5 functions should show ACTIVE status.

---

## Secrets Configuration

### Set Custom Secret
```bash
npx supabase secrets set TEST_API_KEY=4dPJWgew/N5hCnkOz0IcDQ==kX60y6n5UubRo11E
```

Note: SUPABASE_* secrets are auto-managed by Supabase.

---

## Data Restoration

### Manual Approach (Used)

Due to Docker network issues, data was restored manually via SQL Editor.

#### Extract Data by Table
```bash
# These files were created during migration:
# - supabase/restore-api-settings.sql (3 rows)
# - supabase/restore-cars-clean.sql (~198 cars)
# - supabase/restore-profiles.sql (~30 profiles)
# - supabase/restore-leads.sql (~23 leads)
```

#### Execute in SQL Editor
Go to: https://supabase.com/dashboard/project/uioyehbpjxcykvfnmcuk/sql/new

Run each file in order by copying content and clicking "Run".

---

## Authentication Setup

### 1. Configure Supabase Auth
Go to: https://supabase.com/dashboard/project/uioyehbpjxcykvfnmcuk/auth/providers

Settings:
- ✅ Enable Email provider
- ❌ Disable "Confirm email" (for testing)
- ✅ Allow new user signups
- ✅ Enable manual linking

### 2. Clean Old Auth Data
Run in SQL Editor:
```sql
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.mfa_amr_claims CASCADE;
```

This prevents duplicate key errors from restored auth data.

---

## Environment Configuration

### Backend .env
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:8080
FRONTEND_URL=http://localhost:8080

SUPABASE_URL=https://uioyehbpjxcykvfnmcuk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SIMPLE_STORAGE=true
ADMIN_CREATION_KEY=admintest098

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SESSION_TIMEOUT=15m
REFRESH_TIMEOUT=7d

SMS_USERNAME=VENTES
SMS_PASSWORD=VENTES@

API_NINJAS_KEY=4dPJWgew/N5hCnkOz0IcDQ==kX60y6n5UubRo11E
IMAGIN_CUSTOMER_KEY=in-ventesavenues
IMAGIN_TAILORING_KEY=4D^xvkwX#3$#
```

### Frontend .env
```env
VITE_API_URL=/api
VITE_FRONTEND_URL=http://localhost:8080
NODE_ENV=development

VITE_SUPABASE_URL=https://uioyehbpjxcykvfnmcuk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MSG91_AUTH_KEY=your_msg91_key
VITE_MSG91_TEMPLATE_ID=your_template_id

VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_API_FALLBACK=true
```

### Supabase Config
```toml
project_id = "uioyehbpjxcykvfnmcuk"

[functions.sync-carwale-data]
verify_jwt = false

[functions.sync-api-ninjas-data]
verify_jwt = false

[functions.add-test-data]
verify_jwt = false

[functions.import-comprehensive-cars]
verify_jwt = false

[functions.update-car-images]
verify_jwt = false
```

---

## Troubleshooting

### Docker Not Running
**Error:** "Docker Desktop is a prerequisite"

**Solution:** Start Docker Desktop or use manual SQL export

### Migration History Mismatch
**Error:** "migration history does not match"

**Solution:** Use `npx supabase migration repair` commands

### Column Does Not Exist
**Error:** "column 'X' does not exist"

**Solution:** Create migration to add missing column

### Duplicate Key (Auth Tables)
**Error:** "duplicate key value violates unique constraint"

**Solution:** TRUNCATE auth tables as shown above

### OTP Storage Issues
**Error:** "Could not find column 'mobile_no'"

**Solution:** All OTP columns added in migration 20251001123728

### Profile Not Created
**Error:** "Invalid credentials" after signup

**Solution:** Fixed in migration 20251001125052

---

## Verification

### Test Complete Flow

#### 1. Create Test User
```bash
curl -X POST "http://localhost:3001/api/auth/create-test-user" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: admintest098" \
  -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User","role":"user"}'
```

#### 2. Test Login
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

#### 3. Test OTP
```bash
# Send OTP
curl -X POST "http://localhost:3001/api/sms/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"1234567890"}'

# Verify OTP
curl -X POST "http://localhost:3001/api/sms/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"1234567890","otp":"<OTP_FROM_RESPONSE>"}'
```

---

## Migration Checklist

- [x] Logged into old account
- [x] Verified migration history
- [x] Created backup (backup-data.sql)
- [x] Logged out from old account
- [x] Logged into new account
- [x] Linked new project
- [x] Pushed base migrations
- [x] Created user_sessions table
- [x] Added cars image columns
- [x] Created missing tables
- [x] Fixed profiles table structure
- [x] Deployed edge functions
- [x] Configured secrets
- [x] Restored table data
- [x] Configured auth settings
- [x] Cleaned old auth data
- [x] Updated backend .env
- [x] Updated frontend .env
- [x] Updated supabase config
- [x] Tested signup
- [x] Tested login
- [x] Tested OTP
- [x] Verified all tables
- [x] Verified data restoration

---

## Summary

**Migration Completed Successfully**

- **Source:** gfjhsljeezfdkknhsrxx
- **Target:** uioyehbpjxcykvfnmcuk
- **Total Migrations:** 7 files
- **Total Tables:** 12 public tables
- **Total Edge Functions:** 5
- **Data Migrated:** ~200 cars, ~30 profiles, ~23 leads
- **Time:** ~2 hours

**All Features Working:**
- ✅ Authentication (signup/login)
- ✅ Profile auto-creation
- ✅ OTP send/verify
- ✅ Database operations
- ✅ Edge functions

---

## Files Created

**Backup Files:**
- `supabase/backup-data.sql` (1.2 MB)
- `supabase/restore-api-settings.sql`
- `supabase/restore-cars-clean.sql`
- `supabase/restore-profiles.sql`
- `supabase/restore-leads.sql`

**Migration Files:**
- `20251001120852_add_user_sessions_table.sql`
- `20251001121803_add_cars_image_columns.sql`
- `20251001123728_add_missing_tables.sql`
- `20251001125052_fix_profiles_table_structure.sql`
- `20251001131432_fix_otp_verification_table.sql`
- `20251001132111_add_otp_status_column.sql`

---

**Documentation created:** October 1, 2025
**Migration status:** ✅ Complete
