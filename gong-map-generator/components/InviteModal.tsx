'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { UserRole } from '@/lib/auth-types';
import { Loader2, UserPlus, X } from 'lucide-react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const { profile, session } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('ae');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await supabaseBrowser.functions.invoke('invite-user', {
                body: { email, role },
            });

            if (res.error) {
                setError(res.error.message || 'Failed to send invitation.');
            } else {
                setSuccess(`Invitation sent to ${email}`);
                setEmail('');
                setRole('ae');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const canInviteAdmin = profile?.role === 'superadmin';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-slate hover:text-brand-white transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <UserPlus className="w-5 h-5 text-brand-lime" />
                    <h2 className="text-xl font-bold text-brand-white">Invite User</h2>
                </div>

                {success && (
                    <div className="bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-sm rounded-lg px-4 py-3 mb-4">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="block text-[11px] text-brand-muted uppercase tracking-wider font-medium mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="newuser@company.com"
                            required
                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] text-brand-muted uppercase tracking-wider font-medium mb-2">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-white focus:outline-none focus:border-brand-lime/50 cursor-pointer"
                        >
                            <option value="ae">Account Executive (AE)</option>
                            {canInviteAdmin && <option value="admin">Admin</option>}
                        </select>
                    </div>

                    <p className="text-brand-slate text-xs">
                        The user will receive an email with a link to set their password and access the platform.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-lime text-brand-bg font-bold py-3 rounded-lg text-sm hover:bg-brand-lime-dim disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
