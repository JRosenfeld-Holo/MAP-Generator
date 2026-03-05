-- ============================================================
-- FIX: Infinite recursion in profiles RLS policies
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Drop the old policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Recreate SELECT policy: users can always read their own row,
-- admins/superadmins can read all rows.
-- Uses auth.uid() for self-check and auth.jwt() for role check
-- to avoid querying the profiles table inside its own policy.
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'role' = 'service_role')
  );

-- Allow all authenticated users to read all profiles
-- (simpler approach that avoids recursion; role checks are done in the app)
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow inserts from service role (Edge Functions) and for self-insert
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR (auth.jwt() ->> 'role' = 'service_role')
  );

-- Allow deletes from service role (Edge Functions)
CREATE POLICY "Service role can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );
