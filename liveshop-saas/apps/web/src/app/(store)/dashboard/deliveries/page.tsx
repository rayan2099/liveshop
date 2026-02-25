'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Package, MapPin, Clock, User, ChevronRight, Search, Filter } from 'lucide-react';
import { deliveryApi, storeApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';

export default function StoreDeliveriesPage() {
    const searchParams = useSearchParams();

    // 1. Fetch stores to find the active one
    const { data: storesData } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.getMyStores(),
    });

    const stores = storesData?.data?.data?.items || [];
    const urlStoreId = searchParams.get('storeId');
    const store = urlStoreId
        ? stores.find((s: any) => s.id === urlStoreId) || stores[0]
        : stores[0];
    const storeId = store?.id;

    // 2. Fetch deliveries for this store
    const { data: deliveriesResponse, isLoading } = useQuery({
        queryKey: ['store-deliveries', storeId],
        queryFn: () => deliveryApi.getStoreDeliveries(storeId),
        enabled: !!storeId,
        refetchInterval: 15000, // Refresh every 15 seconds
    });

    const deliveries = deliveriesResponse?.data?.deliveries || [];

    if (!storeId && !isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">No Store Selected</h2>
                <p className="text-white/40 mt-2">Please select a store to view its deliveries.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-bold text-3xl text-white mb-2">Deliveries</h1>
                    <p className="text-white/60">Manage fulfillment and track drivers for <span className="text-neon-cyan font-semibold">{store?.name}</span></p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-neon-cyan/50 w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="glass h-40 animate-pulse rounded-3xl" />
                    ))
                ) : deliveries.length === 0 ? (
                    <div className="glass rounded-3xl p-16 text-center border-dashed border-white/10">
                        <Package className="w-16 h-16 text-white/5 mx-auto mb-4" />
                        <p className="text-white/40 text-lg">No active or past deliveries found.</p>
                        <Link href="/dashboard" className="btn-secondary mt-6 text-sm">
                            Back to Dashboard
                        </Link>
                    </div>
                ) : (
                    deliveries.map((delivery: any) => (
                        <div key={delivery.id} className="glass rounded-3xl p-6 border-white/5 hover:border-white/20 transition-all">
                            <div className="grid md:grid-cols-4 gap-6 items-center">
                                {/* Order Info */}
                                <div className="md:col-span-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-neon-cyan" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white uppercase tracking-tighter">
                                                {delivery.order?.orderNumber}
                                            </p>
                                            <p className="text-xs text-white/40">
                                                {format(new Date(delivery.createdAt), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {delivery.order?.items?.slice(0, 2).map((item: any, idx: number) => (
                                            <span key={idx} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60">
                                                {item.quantity}x {item.name}
                                            </span>
                                        ))}
                                        {delivery.order?.items?.length > 2 && (
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60">
                                                +{delivery.order.items.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status & Driver */}
                                <div className="md:col-span-1">
                                    <div className="mb-3">
                                        <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${delivery.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                                delivery.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-neon-cyan/10 text-neon-cyan'
                                            }`}>
                                            {delivery.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {delivery.driver ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-white/60" />
                                            </div>
                                            <p className="text-sm font-medium">{delivery.driver.profile?.firstName} {delivery.driver.profile?.lastName}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/30 italic">Searching for driver...</p>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="md:col-span-1 border-white/5 md:border-l md:pl-6">
                                    <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Destination</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-neon-pink shrink-0 mt-0.5" />
                                        <p className="text-xs text-white/70 line-clamp-2">
                                            {delivery.dropoffAddress?.street}, {delivery.dropoffAddress?.city}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-1 flex justify-end">
                                    <Link
                                        href={`/orders/${delivery.orderId}/tracking`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors border border-white/10"
                                    >
                                        Track
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
