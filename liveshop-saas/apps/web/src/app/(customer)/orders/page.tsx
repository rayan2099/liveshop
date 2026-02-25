'use client';

import { ProtectedRoute } from '@/hooks/use-auth';
import { Package, Search } from 'lucide-react';
import Link from 'next/link';

export default function CustomerOrdersPage() {
    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="font-display font-bold text-3xl mb-2">My Orders</h1>
                    <p className="text-white/60">Track your purchases and view order history</p>
                </div>

                <div className="glass rounded-3xl p-12 text-center border-dashed border-2 border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="w-8 h-8 text-white/20" />
                    </div>
                    <h2 className="text-xl font-bold mb-3">No orders found</h2>
                    <p className="text-white/40 max-w-sm mx-auto mb-8">
                        You haven't placed any orders yet. Start exploring live streams to find something you love!
                    </p>
                    <Link href="/streams" className="btn-primary inline-flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Explore Streams
                    </Link>
                </div>
            </div>
        </ProtectedRoute>
    );
}
