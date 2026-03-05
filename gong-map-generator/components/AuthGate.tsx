'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import ChangePasswordPage from '@/components/ChangePasswordPage';
import { Loader2 } from 'lucide-react';

// Routes that are publicly accessible without login (e.g. shareable MAP links)
const PUBLIC_PREFIXES = ['/v/'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, profile, loading, isRecovery } = useAuth();

    // Shareable MAP views are public — customers must not be required to log in
    const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isPublic) return <>{children}</>;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-brand-muted">
                    <Loader2 size={24} className="animate-spin text-brand-lime" />
                    <span className="font-mono text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    if (isRecovery || profile?.must_change_password) {
        return <ChangePasswordPage />;
    }

    return <>{children}</>;
}
