'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Video, Package, ShoppingBag, TrendingUp, DollarSign, Users, Plus, AlertCircle } from 'lucide-react';
import { storeApi, streamApi, orderApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

export default function StoreDashboardPage() {
  const { user, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // 1. Fetch stores
  const { data: storesData, isLoading: isLoadingStores, refetch: refetchStores, error: storesError } = useQuery({
    queryKey: ['my-stores'],
    queryFn: () => storeApi.getMyStores(),
    enabled: !!user,
    staleTime: 0, // Always fetch fresh
  });

  const stores = storesData?.data?.data?.items || [];
  const urlStoreId = searchParams.get('storeId');
  const store = urlStoreId
    ? stores.find((s: any) => s.id === urlStoreId) || stores[0]
    : stores[0];
  const storeId = store?.id;

  // 2. Fetch dependencies only if store exists
  const { data: analyticsResponse } = useQuery({
    queryKey: ['store-analytics', storeId],
    queryFn: () => storeApi.getStoreAnalytics(storeId),
    enabled: !!storeId,
  });

  const { data: streamsResponse } = useQuery({
    queryKey: ['store-streams', storeId],
    queryFn: () => storeApi.getStoreStreams(storeId, { limit: 3 }),
    enabled: !!storeId,
  });

  const { data: ordersResponse } = useQuery({
    queryKey: ['store-orders', storeId],
    queryFn: () => orderApi.getStoreOrders(storeId, { limit: 5 }),
    enabled: !!storeId,
  });

  const analytics = analyticsResponse?.data?.data;
  const streams = streamsResponse?.data?.data?.items || [];
  const orders = ordersResponse?.data?.data?.items || [];

  // Auto-refresh logic if coming from a creation
  useEffect(() => {
    if (user && stores.length === 0) {
      const timer = setTimeout(() => {
        refetchStores();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, stores.length, refetchStores]);

  if (isLoadingStores) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-void">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink mb-4" />
        <p className="text-white/60 animate-pulse">Loading your store dashboard...</p>
      </div>
    );
  }

  // If no store found, show a much more helpful "Quick Fix" screen
  if (stores.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="glass rounded-3xl p-12 border-neon-pink/20">
          <div className="w-20 h-20 rounded-2xl bg-neon-pink/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-neon-pink" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Store Not Found</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            We couldn't find a store linked to <strong>{user?.email}</strong>.<br />
            If you just created one, it might take a second to sync.
          </p>

          <div className="grid gap-4">
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['my-stores'] });
                refetchStores();
                refetchUser();
              }}
              className="btn-primary w-full py-4 text-lg"
            >
              Refresh Dashboard
            </button>
            <Link href="/stores/create" className="text-white/40 hover:text-white transition-colors text-sm underline">
              Try creating a store with a different name
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-white/30 italic">
              User ID: {user?.id}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Today's Revenue", value: analytics?.orders?.revenue ? `$${analytics.orders.revenue}` : '$0', change: '+0%', icon: DollarSign },
    { label: 'Active Orders', value: analytics?.orders?.total || '0', change: '+0', icon: ShoppingBag },
    { label: 'Live Viewers', value: '0', change: '+0', icon: Users },
    { label: 'Total Streams', value: analytics?.streams?.total || '0', change: '+0', icon: Video },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Dashboard</h1>
          <p className="text-white/60">Managed Store: <span className="text-neon-cyan font-semibold">{store.name}</span></p>
        </div>
        <Link href={`/dashboard/broadcast?storeId=${storeId}`} className="btn-primary flex items-center gap-2 px-8 py-3">
          <Video className="w-5 h-5" />
          Go Live Now
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass rounded-2xl p-6 border-white/5 hover:border-white/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-neon-pink" />
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/40 tracking-wide uppercase mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Streams */}
        <div className="glass rounded-2xl p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-2xl text-white">Your Streams</h2>
            <Link href={storeId ? `/dashboard/streams?storeId=${storeId}` : '/dashboard/streams'} className="text-neon-pink text-sm hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {streams.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-white/40 mb-6 font-medium">No broadcast history yet</p>
                <Link href={`/broadcast?storeId=${storeId}`} className="btn-secondary text-sm px-6">
                  Start Your First Stream
                </Link>
              </div>
            ) : (
              streams.map((stream: any) => (
                <div key={stream.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 flex items-center justify-center">
                    <Video className="w-7 h-7 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{stream.title}</h3>
                    <p className="text-sm text-white/40 font-medium">
                      {stream.status === 'live' ? (
                        <span className="text-red-500 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                          Live now
                        </span>
                      ) : (
                        `Recorded on ${new Date(stream.createdAt).toLocaleDateString()}`
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{stream.viewerCount || 0}</p>
                    <p className="text-xs text-white/30 uppercase">viewers</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass rounded-2xl p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-2xl text-white">Recent Orders</h2>
            <Link href={storeId ? `/dashboard/orders?storeId=${storeId}` : '/dashboard/orders'} className="text-neon-pink text-sm hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-medium">Waiting for your first sale...</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div key={order.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-14 h-14 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white uppercase tracking-tighter">{order.orderNumber}</h3>
                    <p className="text-sm text-white/40">{order.items?.length || 0} items purchased</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">${order.totalAmount}</p>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 glass rounded-3xl p-8 border-white/5 bg-gradient-to-r from-white/5 to-transparent">
        <h2 className="font-display font-bold text-2xl text-white mb-8">Store Management</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <Link href={storeId ? `/dashboard/products/new?storeId=${storeId}` : '/dashboard/products/new'} className="group flex flex-col gap-4 p-6 bg-white/5 rounded-2xl hover:bg-neon-pink/10 transition-all border border-white/5 hover:border-neon-pink/30">
            <div className="w-14 h-14 rounded-xl bg-neon-pink/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-neon-pink" />
            </div>
            <div>
              <p className="font-bold text-lg text-white">Add Product</p>
              <p className="text-sm text-white/40">List a new item for sale</p>
            </div>
          </Link>
          <Link href={storeId ? `/dashboard/products?storeId=${storeId}` : '/dashboard/products'} className="group flex flex-col gap-4 p-6 bg-white/5 rounded-2xl hover:bg-neon-cyan/10 transition-all border border-white/5 hover:border-neon-cyan/30">
            <div className="w-14 h-14 rounded-xl bg-neon-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <p className="font-bold text-lg text-white">Inventory</p>
              <p className="text-sm text-white/40">Manage your stock</p>
            </div>
          </Link>
          <Link href={storeId ? `/dashboard/deliveries?storeId=${storeId}` : '/dashboard/deliveries'} className="group flex flex-col gap-4 p-6 bg-white/5 rounded-2xl hover:bg-neon-cyan/10 transition-all border border-white/5 hover:border-neon-cyan/30">
            <div className="w-14 h-14 rounded-xl bg-neon-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <p className="font-bold text-lg text-white">Deliveries</p>
              <p className="text-sm text-white/40">Track fulfillment</p>
            </div>
          </Link>
          <Link href={storeId ? `/dashboard/analytics?storeId=${storeId}` : '/dashboard/analytics'} className="group flex flex-col gap-4 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 hover:border-white/20">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-white">Analytics</p>
              <p className="text-sm text-white/40">Track your performance</p>
            </div>
          </Link>
          <Link href={storeId ? `/dashboard/broadcast?storeId=${storeId}` : '/dashboard/broadcast'} className="group flex flex-col gap-4 p-6 bg-neon-pink/10 rounded-2xl hover:bg-neon-pink/20 transition-all border border-neon-pink/20 hover:border-neon-pink/40">
            <div className="w-14 h-14 rounded-xl bg-neon-pink/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-neon-pink" />
            </div>
            <div>
              <p className="font-bold text-lg text-white">Go Live</p>
              <p className="text-sm text-white/40">Launch a live shopping show</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
