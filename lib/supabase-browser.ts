import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Bypass Navigator LockManager to prevent timeouts when
        // multiple tabs are open to the same origin
        lock: async <R,>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
            return await fn();
        },
    },
});
