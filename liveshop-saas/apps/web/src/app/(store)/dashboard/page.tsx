'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Video, Package, ShoppingBag, TrendingUp, DollarSign, Users, Plus } from 'lucide-react';
import { storeApi, streamApi, orderApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function StoreDashboardPage() {
  const { user } = useAuth();

  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ['my-stores'],
    queryFn: () => storeApi.getMyStores(),
    enabled: !!user,
  });

  const store = storesData?.data?.items?.[0];
  const storeId = store?.id;

  const { data: analytics } = useQuery({
    queryKey: ['store-analytics', storeId],
    queryFn: () => storeApi.getStoreAnalytics(storeId),
    enabled: !!storeId,
  });

  const { data: streamsData } = useQuery({
    queryKey: ['store-streams', storeId],
    queryFn: () => storeApi.getStoreStreams(storeId, { limit: 3 }),
    enabled: !!storeId,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['store-orders', storeId],
    queryFn: () => orderApi.getStoreOrders(storeId, { limit: 5 }),
    enabled: !!storeId,
  });

  if (isLoadingStores) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-pink" />
      </div>
    );
  }

  if (!store && !isLoadingStores) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">You don't have a store yet</h2>
        <Link href="/stores/create" className="btn-primary">
          Create Your First Store
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Today's Revenue", value: '$2,450', change: '+12%', icon: DollarSign },
    { label: 'Active Orders', value: '23', change: '+5', icon: ShoppingBag },
    { label: 'Live Viewers', value: '1,234', change: '+89', icon: Users },
    { label: 'Conversion Rate', value: '8.5%', change: '+1.2%', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl">Dashboard</h1>
          <p className="text-white/60">Welcome back, {user?.profile?.firstName}</p>
        </div>
        <Link href={`/broadcast?storeId=${storeId}`} className="btn-primary flex items-center gap-2">
          <Video className="w-5 h-5" />
          Go Live
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-neon-pink" />
                </div>
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Streams */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl">Your Streams</h2>
            <Link href="/dashboard/streams" className="text-neon-pink text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {!streamsData?.data?.items?.length ? (
              <div className="text-center py-8">
                <p className="text-white/50 mb-4">No streams yet</p>
                <Link href={`/broadcast?storeId=${storeId}`} className="btn-secondary text-sm">
                  Start Your First Stream
                </Link>
              </div>
            ) : (
              streamsData?.data?.items?.map((stream: any) => (
                <div key={stream.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{stream.title}</h3>
                    <p className="text-sm text-white/50">
                      {stream.status === 'live' ? (
                        <span className="text-red-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          Live now
                        </span>
                      ) : (
                        `Scheduled for ${new Date(stream.scheduledAt || stream.createdAt).toLocaleDateString()}`
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{stream.viewerCount || 0}</p>
                    <p className="text-sm text-white/50">viewers</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-neon-pink text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {!ordersData?.data?.items?.length ? (
              <div className="text-center py-8">
                <p className="text-white/50">No orders yet</p>
              </div>
            ) : (
              ordersData?.data?.items?.map((order: any) => (
                <div key={order.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{order.orderNumber}</h3>
                    <p className="text-sm text-white/50">{order.items?.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
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
      <div className="mt-8 glass rounded-2xl p-6">
        <h2 className="font-display font-bold text-xl mb-6">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/dashboard/products/new" className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-neon-pink/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-neon-pink" />
            </div>
            <div>
              <p className="font-medium">Add Product</p>
              <p className="text-sm text-white/50">List a new item</p>
            </div>
          </Link>
          <Link href="/dashboard/products" className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <p className="font-medium">Inventory</p>
              <p className="text-sm text-white/50">Manage items</p>
            </div>
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium">View Analytics</p>
              <p className="text-sm text-white/50">Track results</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
