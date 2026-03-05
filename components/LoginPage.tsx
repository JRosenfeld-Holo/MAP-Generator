'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const { signIn, resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await signIn(email, password);
        if (result.error) {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await resetPassword(email);
        if (result.error) {
            setError(result.error);
        } else {
            setResetSent(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            {/* Branding */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-lime shadow-[0_0_10px_rgba(191,253,17,0.6)]" />
                    <span className="text-brand-lime font-mono text-xs tracking-[0.3em] uppercase">Hologram</span>
                </div>
                <h1 className="text-3xl font-bold text-brand-white tracking-tight">Mutual Action Plan</h1>
                <p className="text-brand-muted font-mono text-xs mt-2 tracking-wider">Generator Platform</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl">
                {!forgotMode ? (
                    <>
                        <h2 className="text-xl font-bold text-brand-white mb-1">Sign In</h2>
                        <p className="text-brand-muted text-sm mb-6">Access your Mutual Action Plan workspace.</p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div>
                                <label className="block text-[11px] text-brand-muted uppercase tracking-wider font-medium mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="operator@pipelineos.com"
                                        required
                                        className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-3 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] text-brand-muted uppercase tracking-wider font-medium mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••"
                                        required
                                        className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-3 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-lime text-brand-bg font-bold py-3 rounded-lg text-sm hover:bg-brand-lime-dim disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="text-center mt-5">
                            <button
                                onClick={() => { setForgotMode(true); setError(''); }}
                                className="text-brand-muted text-sm hover:text-brand-lime transition-colors cursor-pointer"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-brand-white mb-1">Reset Password</h2>
                        <p className="text-brand-muted text-sm mb-6">We&apos;ll send you a reset link.</p>

                        {resetSent ? (
                            <div className="bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-sm rounded-lg px-4 py-4 text-center">
                                Check your email for a password reset link.
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleReset} className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] text-brand-muted uppercase tracking-wider font-medium mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="operator@pipelineos.com"
                                            required
                                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-brand-lime text-brand-bg font-bold py-3 rounded-lg text-sm hover:bg-brand-lime-dim disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                                    </button>
                                </form>
                            </>
                        )}

                        <div className="text-center mt-5">
                            <button
                                onClick={() => { setForgotMode(false); setResetSent(false); setError(''); }}
                                className="text-brand-muted text-sm hover:text-brand-lime transition-colors cursor-pointer"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </>
                )}
            </div>

            <p className="text-brand-slate text-xs font-mono mt-8">
                &copy; {new Date().getFullYear()} Hologram Inc. Confidential.
            </p>
        </div>
    );
}
