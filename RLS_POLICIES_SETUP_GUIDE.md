# Row Level Security (RLS) Policies Setup Guide

## Overview
This guide documents how we implemented Row Level Security (RLS) policies for the `profiles` table in our Supabase database to ensure users can only access and modify their own profile data.

## What is Row Level Security (RLS)?

Row Level Security is a PostgreSQL feature that allows you to control access to individual rows in a database table based on the current user's context. With RLS enabled, you can create policies that determine which rows users can see, insert, update, or delete.

## Problem Statement

After migrating to the new Supabase account, the `profiles` table had RLS disabled, meaning:
- Any authenticated user could view ALL profiles
- Any authenticated user could modify ANY profile
- No data isolation between users
- Security vulnerability exposing user data

## Solution: RLS Policies Implementation

### Step 1: Create Initial Migration File

We created a new migration to add RLS policies:

```bash
npx supabase migration new add_profiles_rls_policies
```

This created: `supabase/migrations/20251001134629_add_profiles_rls_policies.sql`

### Step 2: Cleanup Duplicate Policies

After the initial migration, we discovered duplicate and extra policies that weren't in the old database. We created a cleanup migration:

```bash
npx supabase migration new clean_profiles_rls_policies
```

This created: `supabase/migrations/20251001140053_clean_profiles_rls_policies.sql`

### Step 3: Final RLS Policies SQL

The final migration file contains the following SQL that matches the old database exactly:

```sql
-- Drop all existing policies on profiles table (including duplicates)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate only the 4 original policies from old database
-- 1. Service role full access
CREATE POLICY "Service role full access"
ON public.profiles
FOR ALL
TO public
USING (
  (current_setting('request.jwt.claims'::text, true)::json ->> 'role'::text) = 'service_role'::text
);

-- 2. Users can insert own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- 3. Users can update own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id);

-- 4. Users can view own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO public
USING (auth.uid() = id);
```

### Step 4: Apply Migration

Push the migration to Supabase:

```bash
npx supabase db push
```

Press `Y` when prompted to confirm.

## Policy Breakdown

### 1. Service Role Full Access
```sql
CREATE POLICY "Service role full access"
ON public.profiles
FOR ALL
TO public
USING (
  (current_setting('request.jwt.claims'::text, true)::json ->> 'role'::text) = 'service_role'::text
);
```

**Purpose:** Allows backend services using the service role key to perform ALL operations (SELECT, INSERT, UPDATE, DELETE) on any profile.

**When it applies:** When requests are made with the Supabase service role key (used in backend/admin operations).

**Use case:** Backend API endpoints that need to manage user profiles, admin dashboards, automated cleanup tasks.

### 2. Users Can Insert Own Profile
```sql
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);
```

**Purpose:** Users can only create a profile where the `id` matches their authenticated user ID.

**Security check:** `auth.uid() = id` ensures the profile ID must match the authenticated user's ID.

**Use case:** Automatic profile creation via the `handle_new_user()` trigger during signup.

### 3. Users Can Update Own Profile
```sql
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id);
```

**Purpose:** Users can only update their own profile data.

**Security check:** `auth.uid() = id` ensures users can only modify rows where the profile ID matches their user ID.

**Use case:** Profile edit forms, avatar uploads, phone number updates, etc.

### 4. Users Can View Own Profile
```sql
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO public
USING (auth.uid() = id);
```

**Purpose:** Users can only read their own profile information.

**Security check:** `auth.uid() = id` ensures users can only view their own data.

**Use case:** Profile page displays, fetching current user info for forms, etc.

## Key Concepts

### `auth.uid()`
- Returns the UUID of the currently authenticated user
- Extracted from the JWT token in the request
- Returns `NULL` if user is not authenticated

### `USING` vs `WITH CHECK`
- **USING:** Determines which existing rows are visible/modifiable (SELECT, UPDATE, DELETE)
- **WITH CHECK:** Validates new/modified data (INSERT, UPDATE)

### Policy Target Roles
- **TO public:** Applies to all database roles (both authenticated and anon users)
- Could also target specific roles like `authenticated` or `anon`

## Verification

### Check RLS Status in Supabase Dashboard
1. Go to **Table Editor** → Select `profiles` table
2. Look for **RLS enabled** indicator (should show a lock icon)
3. Click on **Policies** tab to see all 4 policies listed

### Test Policies with SQL
```sql
-- As authenticated user, try to view another user's profile
-- This should return 0 rows
SELECT * FROM profiles WHERE id != auth.uid();

-- View your own profile
-- This should return 1 row
SELECT * FROM profiles WHERE id = auth.uid();
```

### Test via Application
1. **Signup test:** Create new user → Profile should auto-create via trigger
2. **Login test:** Login and fetch profile → Should only see own profile
3. **Update test:** Update profile fields → Should only update own profile
4. **View test:** Try to query another user's profile → Should return empty/null

## Security Benefits

✅ **Data Isolation:** Users cannot access other users' profile data
✅ **Prevent Data Tampering:** Users cannot modify other profiles
✅ **Backend Flexibility:** Service role still has full access for admin operations
✅ **Defense in Depth:** Even if frontend validation fails, database enforces security
✅ **Automatic Enforcement:** No need to add `WHERE user_id = ?` clauses in every query

## Common Issues & Solutions

### Issue 1: "permission denied for table profiles"
**Cause:** RLS is enabled but no policies grant access
**Solution:** Ensure all 4 policies are created correctly

### Issue 2: Users can't see their own profile
**Cause:** `auth.uid()` is returning NULL (user not authenticated)
**Solution:** Verify JWT token is being sent in requests, check Supabase client initialization

### Issue 3: Service role queries failing
**Cause:** Service role policy not created or JWT check incorrect
**Solution:** Verify service role key is being used, check policy syntax

### Issue 4: Profile not created on signup
**Cause:** INSERT policy preventing trigger from working
**Solution:** Ensure trigger uses service role context with `SECURITY DEFINER`:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Function code
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Additional Tables Requiring RLS

Consider implementing similar RLS policies for these tables:

1. **user_sessions** - Users should only see their own sessions
2. **user_wishlist** - Users should only access their own wishlist
3. **price_alerts** - Users should only manage their own alerts
4. **leads** - Users should only see leads they created (or assigned admin can see all)
5. **otp_verification** - Users should only access their own OTP records

## Example: Adding RLS to user_wishlist

```sql
-- Enable RLS
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access"
ON public.user_wishlist FOR ALL TO public
USING ((current_setting('request.jwt.claims'::text, true)::json ->> 'role'::text) = 'service_role'::text);

-- Users can manage own wishlist
CREATE POLICY "Users can manage own wishlist"
ON public.user_wishlist FOR ALL TO public
USING (auth.uid() = user_id);
```

## Migration History

| Migration File | Date | Purpose |
|---|---|---|
| `20251001134629_add_profiles_rls_policies.sql` | 2025-10-01 | Initial RLS policies added to profiles table |
| `20251001140053_clean_profiles_rls_policies.sql` | 2025-10-01 | Cleaned up duplicate policies to match old database exactly (4 policies only) |

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## Summary

We successfully secured the `profiles` table by:
1. Creating initial migration file for RLS policies (`20251001134629_add_profiles_rls_policies.sql`)
2. Enabling RLS on the profiles table
3. Identifying duplicate and extra policies that weren't in the old database
4. Creating cleanup migration to remove duplicates (`20251001140053_clean_profiles_rls_policies.sql`)
5. Implementing exactly 4 policies matching the old database:
   - Service role full access (ALL operations)
   - Users can insert own profile (INSERT)
   - Users can update own profile (UPDATE)
   - Users can view own profile (SELECT)
6. Pushing both migrations to Supabase
7. Verifying policies work correctly

This ensures users can only access and modify their own profile data while maintaining backend flexibility through the service role.

## Important Notes

- **Only 4 policies exist** in the final setup, matching the old database exactly
- **No admin-specific policies** were added (admins use service role for access)
- **Duplicate policies removed** including:
  - "Users can update their own profile" (duplicate)
  - "Users can view their own profile" (duplicate)
  - "Admins can update all profiles" (unnecessary)
  - "Admins can view all profiles" (unnecessary)
