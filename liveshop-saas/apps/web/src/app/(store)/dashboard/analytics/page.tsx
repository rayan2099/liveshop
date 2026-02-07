'use client';

import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/api';
import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
    // Fetch store ID
    const { data: storesData } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.getMyStores(),
    });
    const storeId = storesData?.data?.items?.[0]?.id;

    const { data: analyticsData, isLoading } = useQuery({
        queryKey: ['store-analytics', storeId],
        queryFn: () => storeApi.getStoreAnalytics(storeId!),
        enabled: !!storeId,
    });

    const stats = [
        { label: 'Total Revenue', value: '$12,450', change: '+12.5%', trend: 'up', icon: DollarSign },
        { label: 'Total Orders', value: '156', change: '+8.2%', trend: 'up', icon: ShoppingBag },
        { label: 'Avg. Viewers', value: '1,234', change: '-2.4%', trend: 'down', icon: Users },
        { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', trend: 'up', icon: TrendingUp },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-bold text-3xl">Analytics</h1>
                    <p className="text-white/60">Track your store performance and audience engagement</p>
                </div>
                <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Last 30 Days
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-neon-pink" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-3xl font-bold mb-1">{stat.value}</p>
                            <p className="text-sm text-white/50">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="glass rounded-2xl p-8 h-[400px] flex flex-col">
                    <h3 className="font-bold text-lg mb-8">Revenue Overview</h3>
                    <div className="flex-1 flex items-end gap-2">
                        {[40, 60, 45, 70, 55, 85, 65, 90, 75, 100, 80, 95].map((val, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-neon-pink/20 rounded-t-lg relative group transition-all hover:bg-neon-pink"
                                style={{ height: `${val}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${val * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-white/40 uppercase font-bold tracking-widest">
                        <span>Jan</span>
                        <span>Jun</span>
                        <span>Dec</span>
                    </div>
                </div>

                <div className="glass rounded-2xl p-8 h-[400px] flex flex-col">
                    <h3 className="font-bold text-lg mb-8">Live Engagement</h3>
                    <div className="flex-1 relative">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path
                                d="M0 80 Q 25 20, 50 50 T 100 30"
                                fill="none"
                                stroke="rgba(0, 255, 255, 0.5)"
                                strokeWidth="4"
                                className="drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                            />
                            <path
                                d="M0 60 Q 25 80, 50 40 T 100 60"
                                fill="none"
                                stroke="rgba(255, 0, 255, 0.5)"
                                strokeWidth="4"
                                className="drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                            />
                        </svg>
                    </div>
                    <div className="flex gap-6 mt-8">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-neon-cyan" />
                            <span className="text-xs text-white/60">Viewers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-neon-pink" />
                            <span className="text-xs text-white/60">Chat Messages</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Streamed Products */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-lg">Top Performing Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Total Sold</th>
                                <th className="px-6 py-4">Revenue</th>
                                <th className="px-6 py-4">Conversion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { name: 'Ultra Glow Headphones', sold: 124, revenue: 5400, conv: '4.2%' },
                                { name: 'Neon Night Watch', sold: 89, revenue: 3200, conv: '3.8%' },
                                { name: 'Cyberpunk Jacket', sold: 45, revenue: 4500, conv: '2.5%' },
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium">{item.name}</td>
                                    <td className="px-6 py-4 text-white/60">{item.sold} units</td>
                                    <td className="px-6 py-4 text-neon-cyan font-bold">${item.revenue.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-neon-pink" style={{ width: `${parseFloat(item.conv) * 10}%` }} />
                                            </div>
                                            <span className="text-xs text-white/60">{item.conv}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
