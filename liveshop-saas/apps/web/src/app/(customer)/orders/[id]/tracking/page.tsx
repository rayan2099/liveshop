'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Package, MapPin, Clock, User, CheckCircle, ChevronLeft, Phone, BadgeCheck } from 'lucide-react';
import { deliveryApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';

export default function OrderTrackingPage() {
    const { id } = useParams();
    const orderId = id as string;

    const { data: deliveryResponse, isLoading, error } = useQuery({
        queryKey: ['order-tracking', orderId],
        queryFn: () => deliveryApi.trackDelivery(orderId),
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    const delivery = deliveryResponse?.data?.delivery;
    const order = delivery?.order;
    const driver = delivery?.driver;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan mb-4" />
                <p className="text-white/60">Finding your delivery details...</p>
            </div>
        );
    }

    if (error || !delivery) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <div className="glass rounded-3xl p-12">
                    <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Tracking not available</h2>
                    <p className="text-white/40 mt-2">We couldn't find tracking info for this order. It might still be preparing.</p>
                    <Link href="/orders" className="btn-primary mt-8 inline-flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const steps = [
        { label: 'Order Placed', status: 'confirmed', description: 'We have received your order' },
        { label: 'Preparing', status: 'preparing', description: 'Store is preparing your items' },
        { label: 'Ready for Pickup', status: 'ready_for_pickup', description: 'Waiting for driver to pick up' },
        { label: 'In Transit', status: 'in_transit', description: 'Driver is on the way to you' },
        { label: 'Delivered', status: 'delivered', description: 'Enjoy your purchase!' },
    ];

    const currentStatusIndex = steps.findIndex(s => s.status === order.status);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/orders" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back to Orders
            </Link>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="font-display font-bold text-3xl text-white">Track Order</h1>
                    <span className="text-xs font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        {order.orderNumber}
                    </span>
                </div>
                <p className="text-white/60">Estimated delivery: <span className="text-neon-cyan font-bold">15-25 mins</span></p>
            </div>

            <div className="grid gap-8">
                {/* Progress Timeline */}
                <div className="glass rounded-3xl p-8 border-white/5">
                    <div className="relative space-y-12">
                        {/* Vertical Line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/5" />
                        <div className="absolute left-[15px] top-2 w-0.5 bg-neon-cyan transition-all duration-1000" style={{ height: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }} />

                        {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStatusIndex;
                            const isCurrent = idx === currentStatusIndex;

                            return (
                                <div key={step.label} className="flex gap-6 relative">
                                    <div className={`w-8 h-8 rounded-full z-10 flex items-center justify-center border-4 border-void transition-colors ${isCompleted ? 'bg-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.4)]' : 'bg-white/10'
                                        }`}>
                                        {isCompleted && <CheckCircle className="w-4 h-4 text-black" />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold transition-colors ${isCompleted ? 'text-white' : 'text-white/30'}`}>
                                            {step.label}
                                            {isCurrent && <span className="ml-3 text-[10px] bg-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-full animate-pulse">Live</span>}
                                        </h3>
                                        <p className={`text-sm transition-colors ${isCompleted ? 'text-white/60' : 'text-white/20'}`}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Driver Card */}
                {driver && (
                    <div className="glass rounded-3xl p-6 bg-gradient-to-br from-neon-pink/10 to-transparent border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
                                    <User className="w-8 h-8 text-white/20" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-neon-cyan p-1 rounded-lg">
                                    <BadgeCheck className="w-3 h-3 text-black" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Your Courier</p>
                                <h3 className="font-bold text-lg">{driver.profile?.firstName} {driver.profile?.lastName}</h3>
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-neon-cyan" />
                                        4.9 Rating
                                    </span>
                                    <span>•</span>
                                    <span>{driver.driverProfile?.vehicleMake} {driver.driverProfile?.vehicleModel}</span>
                                </div>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
                                <Phone className="w-5 h-5 text-neon-cyan" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Details Mini */}
                <div className="glass rounded-3xl p-6 border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/40" />
                        </div>
                        <div>
                            <p className="font-bold">{order.store?.name}</p>
                            <p className="text-sm text-white/40">{order.items?.length} items</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-4">
                            <MapPin className="w-4 h-4 text-neon-pink shrink-0 mt-1" />
                            <div>
                                <p className="text-sm font-medium">Delivery Address</p>
                                <p className="text-sm text-white/60">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
