'use client';

import { useAuth, ProtectedRoute } from '@/hooks/use-auth';
import { User, Settings, Shield, Bell, LogOut } from 'lucide-react';

export default function CustomerProfilePage() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="font-display font-bold text-3xl mb-2">Account Settings</h1>
                    <p className="text-white/60">Manage your profile and preferences</p>
                </div>

                <div className="grid gap-6">
                    {/* Basic Info */}
                    <div className="glass rounded-3xl p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 flex items-center justify-center border border-white/10">
                                <User className="w-10 h-10 text-white/40" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{user?.profile?.firstName} {user?.profile?.lastName}</h2>
                                <p className="text-white/40">{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group">
                                <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User className="w-5 h-5 text-neon-pink" />
                                </div>
                                <div>
                                    <p className="font-medium">Personal Info</p>
                                    <p className="text-xs text-white/40">Name, email, and phone</p>
                                </div>
                            </button>

                            <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group">
                                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield className="w-5 h-5 text-neon-cyan" />
                                </div>
                                <div>
                                    <p className="font-medium">Security</p>
                                    <p className="text-xs text-white/40">Password and 2FA</p>
                                </div>
                            </button>

                            <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group">
                                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Bell className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="font-medium">Notifications</p>
                                    <p className="text-xs text-white/40">Alerts and updates</p>
                                </div>
                            </button>

                            <button
                                onClick={logout}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-red-400/5 border border-red-400/10 hover:bg-red-400/10 transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LogOut className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-400">Sign Out</p>
                                    <p className="text-xs text-red-400/40">Logout from your account</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
