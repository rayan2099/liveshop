'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { storeApi, orderApi } from '@/lib/api';
import { ShoppingBag, Search, Filter, Clock, CheckCircle2, Package, Truck, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const STATUS_ICONS: Record<string, any> = {
    pending: Clock,
    confirmed: CheckCircle2,
    preparing: Package,
    ready_for_pickup: Truck,
    delivered: CheckCircle2,
    cancelled: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    preparing: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    ready_for_pickup: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
    delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function StoreOrdersPage() {
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch store ID
    const { data: storesData } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.getMyStores(),
    });
    const storeId = storesData?.data?.items?.[0]?.id;

    const { data: ordersData, isLoading, refetch } = useQuery({
        queryKey: ['store-orders', storeId, statusFilter],
        queryFn: () => orderApi.getStoreOrders(storeId!, { status: statusFilter || undefined }),
        enabled: !!storeId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            orderApi.updateStatus(id, { status }),
        onSuccess: () => refetch(),
    });

    const orders = ordersData?.data?.items || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-bold text-3xl">Orders</h1>
                    <p className="text-white/60">Fulfill orders and track delivery status</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
                {[
                    { label: 'All Orders', value: '' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Preparing', value: 'preparing' },
                    { label: 'Ready', value: 'ready_for_pickup' },
                    { label: 'Delivered', value: 'delivered' },
                ].map((filter) => (
                    <button
                        key={filter.label}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${statusFilter === filter.value
                                ? 'bg-neon-pink text-white border-neon-pink'
                                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-32 h-6 bg-white/10 rounded" />
                                <div className="w-24 h-6 bg-white/10 rounded-full" />
                            </div>
                            <div className="space-y-4">
                                <div className="w-full h-20 bg-white/5 rounded-xl" />
                            </div>
                        </div>
                    ))
                ) : orders.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center text-white/50">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm">When customers buy from your stream, they'll appear here.</p>
                    </div>
                ) : (
                    orders.map((order: any) => {
                        const StatusIcon = STATUS_ICONS[order.status] || AlertCircle;
                        const statusStyle = STATUS_COLORS[order.status] || 'text-white/40 bg-white/5 border-white/10';

                        return (
                            <div key={order.id} className="glass rounded-2xl p-6 border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle} flex items-center gap-1.5`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/50 mb-4">
                                            Placed on {format(new Date(order.createdAt), 'MMM d, h:mm a')} • {order.items?.length} items
                                        </p>

                                        <div className="flex flex-wrap gap-4">
                                            <div className="bg-white/5 p-3 rounded-xl min-w-[200px]">
                                                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Customer</p>
                                                <p className="font-medium">{order.customer?.profile?.firstName} {order.customer?.profile?.lastName}</p>
                                                <p className="text-xs text-white/40">{order.customer?.phone || 'No phone'}</p>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-xl min-w-[200px]">
                                                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Amount</p>
                                                <p className="font-bold text-neon-cyan">${order.totalAmount.toFixed(2)}</p>
                                                <p className="text-xs text-white/40">{order.paymentStatus || 'unpaid'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'confirmed' })}
                                                disabled={updateStatusMutation.isPending}
                                                className="btn-primary py-3 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-500"
                                            >
                                                Confirm Order
                                            </button>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button
                                                onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'preparing' })}
                                                disabled={updateStatusMutation.isPending}
                                                className="btn-primary py-3 px-6 rounded-xl font-bold bg-purple-600 hover:bg-purple-500"
                                            >
                                                Start Preparing
                                            </button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button
                                                onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'ready_for_pickup' })}
                                                disabled={updateStatusMutation.isPending}
                                                className="btn-primary py-3 px-6 rounded-xl font-bold bg-neon-cyan text-black hover:bg-neon-cyan/80"
                                            >
                                                Ready for Delivery
                                            </button>
                                        )}

                                        <button className="glass px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                {/* Items Preview */}
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                        {order.items?.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg flex-shrink-0">
                                                <img src={item.image || 'https://via.placeholder.com/100'} alt="" className="w-10 h-10 rounded-md object-cover" />
                                                <div>
                                                    <p className="text-xs font-medium">{item.name}</p>
                                                    <p className="text-[10px] text-white/40">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
