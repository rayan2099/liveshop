'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { deliveryApi } from '@/lib/api';
import { format, startOfDay, isSameDay } from 'date-fns';

export default function DriverEarningsPage() {
    const { data: myDeliveries, isLoading } = useQuery({
        queryKey: ['my-deliveries-earnings'],
        queryFn: () => deliveryApi.getMyDeliveries(),
    });

    const deliveries = myDeliveries?.data?.deliveries || [];
    const completedDeliveries = deliveries.filter((d: any) => d.status === 'delivered');

    const today = new Date();
    const todayDeliveries = completedDeliveries.filter((d: any) => isSameDay(new Date(d.createdAt), today));

    const totalEarnings = completedDeliveries.reduce((acc: number, d: any) => acc + (Number(d.driverEarnings) || 0) + (Number(d.tipAmount) || 0), 0);
    const todayEarnings = todayDeliveries.reduce((acc: number, d: any) => acc + (Number(d.driverEarnings) || 0) + (Number(d.tipAmount) || 0), 0);

    const stats = [
        { label: "Today's Earnings", value: `$${todayEarnings.toFixed(2)}`, icon: DollarSign, trend: '+12%', isPositive: true },
        { label: 'Total Earned', value: `$${totalEarnings.toFixed(2)}`, icon: TrendingUp, trend: '+5%', isPositive: true },
        { label: 'Total Deliveries', value: completedDeliveries.length.toString(), icon: Package, trend: '85% active', isPositive: true },
        { label: 'Average per Trip', value: completedDeliveries.length > 0 ? `$${(totalEarnings / completedDeliveries.length).toFixed(2)}` : '$0.00', icon: Calendar, trend: 'Stable', isPositive: true },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="font-display font-bold text-3xl text-neon-cyan mb-2">Earnings Dashboard</h1>
                <p className="text-white/60">Track your performance and payouts</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass rounded-2xl p-6 hover:border-neon-cyan/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-neon-cyan" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.trend}
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-white/50">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-neon-cyan" />
                            Recent Payouts
                        </h2>
                        <div className="space-y-4">
                            {completedDeliveries.length === 0 ? (
                                <p className="text-center py-12 text-white/40">No earnings data available</p>
                            ) : (
                                completedDeliveries.slice(0, 10).map((delivery: any) => (
                                    <div key={delivery.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div>
                                            <p className="font-bold">{delivery.order?.orderNumber || 'Trip'}</p>
                                            <p className="text-xs text-white/40">{format(new Date(delivery.createdAt), 'MMMM d, h:mm a')}</p>
                                        </div>
                                        <p className="font-bold text-neon-cyan">+${(Number(delivery.driverEarnings) + (Number(delivery.tipAmount) || 0)).toFixed(2)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6 bg-gradient-to-br from-neon-cyan/10 to-transparent">
                        <h3 className="font-bold text-lg mb-4">Payout Info</h3>
                        <p className="text-sm text-white/60 mb-6">Your next payout is scheduled for Monday, Oct 24th.</p>
                        <div className="space-y-4">
                            <div className="bg-black/40 p-4 rounded-xl">
                                <p className="text-xs text-white/40">Bank Account</p>
                                <p className="font-medium">•••• 4242</p>
                            </div>
                            <button className="w-full py-3 bg-neon-cyan text-black rounded-xl font-bold text-sm">
                                Request Instant Payout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
