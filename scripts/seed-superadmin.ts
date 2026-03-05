/**
 * Seed script: Create the initial superadmin user.
 *
 * Run once with:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *   SUPERADMIN_EMAIL=you@company.com \
 *   SUPERADMIN_PASSWORD=YourSecurePassword \
 *   npx tsx scripts/seed-superadmin.ts
 *
 * ⚠️  Never hardcode credentials — always pass via environment variables.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
    console.error('❌ Missing required env vars:');
    console.error('   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD');
    process.exit(1);
}

async function seed() {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('🔑 Creating superadmin user...');

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === SUPERADMIN_EMAIL);

    if (existing) {
        console.log('⚠️  User already exists. Updating profile to superadmin...');

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: existing.id,
                email: SUPERADMIN_EMAIL,
                role: 'superadmin',
                must_change_password: false,
            });

        if (profileError) {
            console.error('❌ Profile upsert failed:', profileError.message);
            process.exit(1);
        }

        console.log('✅ Profile updated to superadmin.');
        return;
    }

    // Create the user
    const { data, error } = await supabase.auth.admin.createUser({
        email: SUPERADMIN_EMAIL!,
        password: SUPERADMIN_PASSWORD!,
        email_confirm: true,
        user_metadata: { role: 'superadmin' },
    });

    if (error) {
        console.error('❌ User creation failed:', error.message);
        process.exit(1);
    }

    console.log('✅ User created:', data.user.id);

    // Create the profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: data.user.id,
            email: SUPERADMIN_EMAIL,
            role: 'superadmin',
            must_change_password: false,
        });

    if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message);
        process.exit(1);
    }

    console.log('✅ Superadmin created successfully.');
    console.log('📧 Email:', SUPERADMIN_EMAIL);
}

seed().catch(console.error);
