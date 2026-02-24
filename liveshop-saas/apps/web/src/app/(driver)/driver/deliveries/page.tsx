'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, MapPin, Calendar, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { deliveryApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DriverDeliveriesPage() {
    const { data: myDeliveries, isLoading } = useQuery({
        queryKey: ['my-deliveries-history'],
        queryFn: () => deliveryApi.getMyDeliveries(),
    });

    const deliveries = myDeliveries?.data?.deliveries || [];
    const completedDeliveries = deliveries.filter((d: any) => d.status === 'delivered');
    const otherDeliveries = deliveries.filter((d: any) => d.status !== 'delivered');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="font-display font-bold text-3xl text-neon-cyan mb-2">Delivery History</h1>
                <p className="text-white/60">Manage and review your past trips</p>
            </div>

            <div className="space-y-8">
                {/* Active/In-ProgressSection */}
                {otherDeliveries.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-neon-cyan" />
                            Active Trips
                        </h2>
                        <div className="grid gap-4">
                            {otherDeliveries.map((delivery: any) => (
                                <DeliveryCard key={delivery.id} delivery={delivery} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Completed Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Completed Deliveries
                    </h2>
                    {isLoading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : completedDeliveries.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center">
                            <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/40">No completed deliveries yet</p>
                            <Link href="/driver" className="text-neon-cyan text-sm mt-4 inline-block hover:underline">
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {completedDeliveries.map((delivery: any) => (
                                <DeliveryCard key={delivery.id} delivery={delivery} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function DeliveryCard({ delivery }: { delivery: any }) {
    const isDelivered = delivery.status === 'delivered';
    const isCancelled = delivery.status === 'cancelled';

    return (
        <div className="glass rounded-2xl p-6 hover:border-white/20 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDelivered ? 'bg-green-500/20 text-green-500' :
                            isCancelled ? 'bg-red-500/20 text-red-500' :
                                'bg-neon-cyan/20 text-neon-cyan'
                        }`}>
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{delivery.order?.orderNumber || 'Trip #' + delivery.id.slice(0, 8)}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isDelivered ? 'bg-green-500/20 text-green-500' :
                                    isCancelled ? 'bg-red-500/20 text-red-500' :
                                        'bg-neon-cyan/20 text-neon-cyan'
                                }`}>
                                {delivery.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(delivery.createdAt), 'MMM d, h:mm a')}
                            </span>
                            <span className="flex items-center gap-1 text-neon-cyan font-medium">
                                ${(Number(delivery.driverEarnings) || 0).toFixed(2)} Earned
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:text-right">
                    <div className="flex items-center md:justify-end gap-2 text-sm text-white/70">
                        <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
                        <span>{delivery.dropoffAddress?.city}, {delivery.dropoffAddress?.street}</span>
                    </div>
                    <p className="text-xs text-white/40">{delivery.order?.store?.name}</p>
                </div>

                <button className="p-2 lg:p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors self-center">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
