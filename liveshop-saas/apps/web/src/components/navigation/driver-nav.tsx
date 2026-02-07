'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { LayoutDashboard, Package, MapPin, DollarSign, LogOut } from 'lucide-react';

export function DriverNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/driver" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
              <span className="font-display font-bold text-black text-sm">L</span>
            </div>
            <span className="font-display font-bold text-xl">LiveShop</span>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full ml-2">Driver</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/driver"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/driver/deliveries"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Deliveries</span>
            </Link>
            <Link
              href="/driver/earnings"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Earnings</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60 hidden sm:inline">{user?.profile?.firstName}</span>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
