'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
    const { updatePassword, isRecovery, profile } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isFirstLogin = profile?.must_change_password && !isRecovery;
    const title = isFirstLogin ? 'Set Your Password' : 'Reset Password';
    const subtitle = isFirstLogin
        ? 'Welcome! Please create a secure password for your account.'
        : 'Enter your new password below.';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await updatePassword(newPassword);
        if (result.error) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-lime shadow-[0_0_10px_rgba(191,253,17,0.6)]" />
                    <span className="text-brand-lime font-mono text-xs tracking-[0.3em] uppercase">Hologram</span>
                </div>
                <h1 className="text-3xl font-bold text-brand-white tracking-tight">Mutual Action Plan</h1>
            </div>

            <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-brand-lime" />
                    <h2 className="text-xl font-bold text-brand-white">{title}</h2>
                </div>
                <p className="text-brand-muted text-sm mb-6">{subtitle}</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                <div className="text-brand-muted text-xs mb-4 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    <span>Minimum 8 characters required.</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] text-brand-muted uppercase tracking-wider font-medium mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••••"
                            required
                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] text-brand-muted uppercase tracking-wider font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••"
                            required
                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-lime text-brand-bg font-bold py-3 rounded-lg text-sm hover:bg-brand-lime-dim disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Password & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
