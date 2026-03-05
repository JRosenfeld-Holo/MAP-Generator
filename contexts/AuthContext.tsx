'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/auth-types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    isRecovery: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
    clearRecovery: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

async function loadProfile(userId: string): Promise<Profile | null> {
    try {
        const { data, error } = await supabaseBrowser
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error.message);
            return null;
        }
        return data as Profile;
    } catch (err) {
        console.error('Profile fetch exception:', err);
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRecovery, setIsRecovery] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Safety timeout: if auth doesn't resolve in 10s, stop loading
        const timeout = setTimeout(() => {
            console.warn('[Auth] Initialization timed out after 10s — proceeding without session');
            setLoading(false);
        }, 10000);

        const init = async () => {
            try {
                console.log('[Auth] Starting session check...');
                const { data: { session: s } } = await supabaseBrowser.auth.getSession();
                console.log('[Auth] Session result:', s ? 'authenticated' : 'no session');
                setSession(s);
                setUser(s?.user ?? null);

                if (s?.user) {
                    const p = await loadProfile(s.user.id);
                    setProfile(p);
                }
            } catch (err) {
                console.error('[Auth] Init error:', err);
            } finally {
                clearTimeout(timeout);
                setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
            async (event, s) => {
                console.log('[Auth] State change:', event);
                if (event === 'PASSWORD_RECOVERY') {
                    setIsRecovery(true);
                }

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    setSession(s);
                    setUser(s?.user ?? null);
                    if (s?.user) {
                        const p = await loadProfile(s.user.id);
                        setProfile(p);
                    }
                    setLoading(false);
                }

                if (event === 'SIGNED_OUT') {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setIsRecovery(false);
                    setLoading(false);
                }
            }
        );

        return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) {
            const p = await loadProfile(user.id);
            setProfile(p);
        }
    }, [user]);

    const signIn = useCallback(async (email: string, password: string) => {
        const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
    }, []);

    const signOut = useCallback(async () => {
        await supabaseBrowser.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsRecovery(false);
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) return { error: error.message };
        return { error: null };
    }, []);

    const updatePassword = useCallback(async (newPassword: string) => {
        const { error } = await supabaseBrowser.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };

        if (user) {
            await supabaseBrowser
                .from('profiles')
                .update({ must_change_password: false })
                .eq('id', user.id);

            const p = await loadProfile(user.id);
            setProfile(p);
        }

        setIsRecovery(false);
        return { error: null };
    }, [user]);

    const clearRecovery = useCallback(() => {
        setIsRecovery(false);
    }, []);

    const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            isAdmin,
            isRecovery,
            signIn,
            signOut,
            resetPassword,
            updatePassword,
            clearRecovery,
            refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
