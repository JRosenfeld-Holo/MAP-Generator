/**
 * Run the SQL migration against the remote Supabase project.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=sb_secret_... npx tsx scripts/run-migration.ts
 *
 * Or set values in a .env file and use: npx dotenv -e .env -- npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const SQL_STATEMENTS = [
    // 1. Create profiles table
    `CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'ae')) DEFAULT 'ae',
    display_name TEXT,
    must_change_password BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // 2. Enable RLS
    `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,

    // 3. RLS Policies
    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
      CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
  END $$`,

    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles' AND tablename = 'profiles') THEN
      CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
      );
    END IF;
  END $$`,

    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
      CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
  END $$`,

    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert profiles' AND tablename = 'profiles') THEN
      CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
      );
    END IF;
  END $$`,

    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete profiles' AND tablename = 'profiles') THEN
      CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
      );
    END IF;
  END $$`,

    // 4. Auto-create profile trigger
    `CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, role, must_change_password)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'role', 'ae'),
      true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

    `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,

    `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`,

    // 5. Updated_at trigger
    `CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

    `DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles`,

    `CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()`,
];

async function runMigration() {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('🗄️  Running migration...\n');

    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
        const sql = SQL_STATEMENTS[i];
        const preview = sql.trim().slice(0, 60).replace(/\n/g, ' ');
        process.stdout.write(`  [${i + 1}/${SQL_STATEMENTS.length}] ${preview}...  `);

        const { error } = await supabase.rpc('exec_sql', { sql_text: sql });

        if (error) {
            console.log(`⚠️  RPC not available. SQL needs to be run manually.`);
            console.log(`    Error: ${error.message}\n`);
        } else {
            console.log('✅');
        }
    }

    console.log('\n🎉 Migration complete!');
}

runMigration().catch(console.error);
