'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ShoppingBag, Store, Video, User, LogOut } from 'lucide-react';

export function CustomerNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
              <span className="font-display font-bold text-black text-sm">L</span>
            </div>
            <span className="font-display font-bold text-xl">LiveShop</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/streams"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Streams</span>
            </Link>
            <Link
              href="/stores"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Stores</span>
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.profile?.firstName || 'Profile'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
