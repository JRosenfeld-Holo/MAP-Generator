'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { Profile } from '@/lib/auth-types';
import { Loader2, Users, Trash2, X, Shield, ShieldCheck, User } from 'lucide-react';

interface ManageUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
        superadmin: 'bg-brand-lime/15 text-brand-lime border-brand-lime/30',
        admin: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        ae: 'bg-brand-border text-brand-muted border-brand-border',
    };
    return styles[role] || styles.ae;
};

const roleIcon = (role: string) => {
    if (role === 'superadmin') return <ShieldCheck className="w-3 h-3" />;
    if (role === 'admin') return <Shield className="w-3 h-3" />;
    return <User className="w-3 h-3" />;
};

export default function ManageUsersModal({ isOpen, onClose }: ManageUsersModalProps) {
    const { profile: currentProfile } = useAuth();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        const { data, error: err } = await supabaseBrowser
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: true });

        if (err) {
            setError(err.message);
        } else {
            setUsers(data as Profile[]);
        }
        setLoading(false);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        setDeleting(userId);
        try {
            const res = await supabaseBrowser.functions.invoke('delete-user', {
                body: { userId },
            });
            if (res.error) {
                setError(res.error.message || 'Failed to delete user.');
            } else {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setDeleting(null);
        }
    };

    const canDelete = (user: Profile) => {
        if (user.id === currentProfile?.id) return false;
        if (user.role === 'superadmin') return false;
        if (user.role === 'admin' && currentProfile?.role !== 'superadmin') return false;
        return true;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-brand-lime" />
                        <h2 className="text-lg font-bold text-brand-white">Manage Users</h2>
                        <span className="text-brand-muted text-xs bg-brand-bg px-2 py-0.5 rounded-full">
                            {users.length} users
                        </span>
                    </div>
                    <button onClick={onClose} className="text-brand-slate hover:text-brand-white transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-brand-lime animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-red-400 text-sm text-center">{error}</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-[11px] text-brand-slate uppercase tracking-wider border-b border-brand-border">
                                    <th className="text-left px-6 py-3 font-medium">Email</th>
                                    <th className="text-left px-4 py-3 font-medium">Role</th>
                                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Joined</th>
                                    <th className="px-4 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-brand-border/50 hover:bg-brand-bg/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <span className="text-sm text-brand-white">{user.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${roleBadge(user.role)}`}>
                                                {roleIcon(user.role)}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-brand-muted text-xs hidden sm:table-cell">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {canDelete(user) && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={deleting === user.id}
                                                    className="text-brand-slate hover:text-red-400 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-red-500/10"
                                                >
                                                    {deleting === user.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
