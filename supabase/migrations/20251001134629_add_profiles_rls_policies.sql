-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Service role full access
CREATE POLICY "Service role full access"
ON public.profiles
FOR ALL
TO public
USING (
  (current_setting('request.jwt.claims'::text, true)::json ->> 'role'::text) = 'service_role'::text
);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id);

-- Users can view own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO public
USING (auth.uid() = id);
