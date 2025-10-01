-- Drop all existing policies on profiles table
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
