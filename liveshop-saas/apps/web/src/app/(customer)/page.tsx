'use client';

import Link from 'next/link';
import { Play, ShoppingBag, Truck, Store, ArrowRight, User, Star, MapPin } from 'lucide-react';
import { StreamCard } from '@/components/streams/StreamCard';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { storeApi, streamApi } from '@/lib/api';


const mockStreams = [
    {
        id: 'mock-1',
        title: 'New Season Collection',
        storeName: 'Urban Style',
        thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80',
        viewerCount: 0,
        isLive: false,
        avatarUrl: ''
    },
    {
        id: 'mock-2',
        title: 'Gamer Setup Showcase',
        storeName: 'Tech Zone',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80',
        viewerCount: 0,
        isLive: false,
        avatarUrl: ''
    },
    {
        id: 'mock-3',
        title: 'Morning Skincare Routine',
        storeName: 'Glow Up',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80',
        viewerCount: 0,
        isLive: false,
        avatarUrl: ''
    },
    {
        id: 'mock-4',
        title: 'Home Office Essentials',
        storeName: 'Minimalist Inc',
        thumbnailUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80',
        viewerCount: 0,
        isLive: false,
        avatarUrl: ''
    }
];

export default function CustomerHomePage() {
    const { user, isAuthenticated } = useAuth();

    // Fetch real stores
    const { data: storesData } = useQuery({
        queryKey: ['featured-stores'],
        queryFn: () => storeApi.getStores({ limit: 4 }),
    });
    const stores = storesData?.data?.data?.items || [];

    // Fetch live streams from the real API
    const { data: streamsData, isLoading: streamsLoading } = useQuery({
        queryKey: ['live-streams'],
        queryFn: () => streamApi.getStreams({ status: 'live', limit: 4 }),
        refetchInterval: 30000, // re-poll every 30s
    });
    const liveStreams = streamsData?.data?.data?.items || [];

    return (
        <div className="space-y-12 pb-20">
            {/* Authenticated Dashboard Header */}
            {isAuthenticated ? (
                <section className="pt-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div>
                                <h1 className="font-display font-bold text-4xl lg:text-5xl mb-3">
                                    Welcome back, <span className="text-gradient leading-tight">{user?.profile?.firstName || 'Friend'}</span>
                                </h1>
                                <p className="text-white/60 text-lg">Your neighborhood live marketplace is open and active.</p>
                            </div>
                        </div>

                        {/* High-Impact Entry Points */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <Link href="/streams" className="group relative overflow-hidden glass rounded-[2.5rem] p-10 hover:bg-white/10 transition-all hover:scale-[1.02] border border-white/5 hover:border-neon-pink/50">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-neon-pink/20 flex items-center justify-center mb-8 border border-neon-pink/20 group-hover:scale-110 transition-transform duration-500">
                                        <Play className="w-8 h-8 text-neon-pink" fill="currentColor" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3 tracking-tight">Watch Live</h3>
                                    <p className="text-white/50 text-base leading-relaxed">Join active streams, chat with local sellers, and shop in real-time.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-neon-pink/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-neon-pink/20 transition-all duration-700" />
                                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 text-neon-pink">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </Link>

                            <Link href="/stores" className="group relative overflow-hidden glass rounded-[2.5rem] p-10 hover:bg-white/10 transition-all hover:scale-[1.02] border border-white/5 hover:border-neon-cyan/50">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mb-8 border border-neon-cyan/20 group-hover:scale-110 transition-transform duration-500">
                                        <Store className="w-8 h-8 text-neon-cyan" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3 tracking-tight">Find Stores</h3>
                                    <p className="text-white/50 text-base leading-relaxed">Discover boutiques, artisans, and shops around your neighborhood.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-neon-cyan/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-neon-cyan/20 transition-all duration-700" />
                                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 text-neon-cyan">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </Link>

                            <Link href="/orders" className="group relative overflow-hidden glass rounded-[2.5rem] p-10 hover:bg-white/10 transition-all hover:scale-[1.02] border border-white/5 hover:border-white/50">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                                        <ShoppingBag className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3 tracking-tight">My Orders</h3>
                                    <p className="text-white/50 text-base leading-relaxed">Keep track of your latest deliveries and view your purchase history.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[80px] -mr-20 -mt-20 group-hover:bg-white/10 transition-all duration-700" />
                                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 text-white">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>
            ) : (
                /* Hero Section - Upgraded with premium landing design (Guest Only) */
                <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-[3rem] mx-4 bg-void border border-white/5">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-neon-pink/15 rounded-full blur-[180px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-neon-cyan/15 rounded-full blur-[180px]" />
                    </div>

                    <div className="relative max-w-7xl mx-auto text-center">
                        <span className="eyebrow mb-6 block animate-in fade-in slide-in-from-bottom-2 duration-700">Live Retail Platform</span>
                        <h1 className="font-display font-bold text-6xl sm:text-7xl lg:text-8xl uppercase tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            Shop The <span className="text-gradient">Moment</span>
                        </h1>
                        <p className="text-2xl text-white/60 max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 leading-relaxed">
                            Experience real-time product demos, chat with store owners, and buy instantly while watching live streams.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <Link href="/register" className="btn-primary flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold">
                                <User className="w-6 h-6" />
                                Get Started Free
                            </Link>
                            <Link href="/streams" className="btn-secondary flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold">
                                Browse Live Content
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Live Now */}
            <section className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10 flex items-center justify-between">
                        <h2 className="text-3xl font-bold flex items-center gap-4 tracking-tight">
                            <span className="flex h-4 w-4 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"></span>
                            </span>
                            {isAuthenticated ? 'Recommended Live Shows' : 'Trending Now'}
                        </h2>
                        <Link href="/streams" className="text-base font-bold text-neon-pink hover:underline uppercase tracking-widest bg-neon-pink/5 px-4 py-2 rounded-xl border border-neon-pink/10 transition-all hover:bg-neon-pink/10">
                            View All &rarr;
                        </Link>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {streamsLoading ? (
                            // Skeleton loading state
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="glass rounded-3xl overflow-hidden animate-pulse">
                                    <div className="aspect-video bg-white/10" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-3/4" />
                                        <div className="h-3 bg-white/5 rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : liveStreams.length > 0 ? (
                            liveStreams.map((stream: any) => (
                                <StreamCard
                                    key={stream.id}
                                    id={stream.id}
                                    title={stream.title}
                                    storeName={stream.store?.name || 'Live Store'}
                                    thumbnailUrl={stream.thumbnailUrl || ''}
                                    viewerCount={stream.viewerCount || 0}
                                    isLive={stream.status === 'live'}
                                    avatarUrl={stream.store?.logoUrl || ''}
                                />
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-16 text-white/40">
                                <Play className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">No streams live right now</p>
                                <p className="text-sm mt-2">Check back soon or <Link href="/stores" className="text-neon-pink hover:underline">browse stores</Link></p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Platform Features - From Landing (Guest Only) */}
            {!isAuthenticated && (
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 rounded-[4rem] mx-4 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <h2 className="font-display font-bold text-4xl sm:text-5xl text-center mb-20 tracking-tight">
                            One Ecosystem. Three Experiences.
                        </h2>

                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="glass rounded-[3rem] p-10 hover:bg-white/10 transition-all duration-500 group border border-white/5 hover:border-white/20">
                                <div className="w-16 h-16 rounded-2xl bg-neon-pink/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-neon-pink/10">
                                    <ShoppingBag className="w-8 h-8 text-neon-pink" />
                                </div>
                                <h3 className="font-display font-bold text-2xl mb-4">For Shoppers</h3>
                                <p className="text-white/50 mb-8 text-base leading-relaxed">
                                    Join live shows, chat with hosts, and buy products instantly without ever leaving the immersive video player.
                                </p>
                                <Link href="/register?role=customer" className="text-neon-pink text-base font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                    Start Shopping <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="glass rounded-[3rem] p-10 hover:bg-white/10 transition-all duration-500 group border border-white/5 hover:border-white/20">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <Store className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-display font-bold text-2xl mb-4">For Merchants</h3>
                                <p className="text-white/50 mb-8 text-base leading-relaxed">
                                    Go live from your mobile device or studio, showcase your inventory, and see your sales grow in real-time.
                                </p>
                                <Link href="/register?role=store_owner" className="text-white text-base font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                    Launch Your Store <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="glass rounded-[3rem] p-10 hover:bg-white/10 transition-all duration-500 group border border-white/5 hover:border-white/20">
                                <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-neon-cyan/10">
                                    <Truck className="w-8 h-8 text-neon-cyan" />
                                </div>
                                <h3 className="font-display font-bold text-2xl mb-4">For Partners</h3>
                                <p className="text-white/50 mb-8 text-base leading-relaxed">
                                    Earn competitive fees by delivering orders from local stores to customers in your surrounding neighborhood.
                                </p>
                                <Link href="/register?role=driver" className="text-neon-cyan text-base font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                    Partner with us <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Stores Section - Added to show real stores */}
            <section className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10 flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight">Featured Stores</h2>
                        <Link href="/stores" className="text-sm font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                            Explore All Stores &rarr;
                        </Link>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {stores.length > 0 ? (
                            stores.map((store: any) => (
                                <Link key={store.id} href={`/stores/${store.slug}` as any} className="group">
                                    <div className="glass rounded-[2rem] overflow-hidden hover:bg-white/10 transition-all duration-500 border border-white/5 hover:border-white/20">
                                        <div className="aspect-video bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center relative overflow-hidden">
                                            {store.logoUrl ? (
                                                <img src={store.logoUrl} alt={store.name} className="w-20 h-20 rounded-2xl object-cover relative z-10 shadow-2xl" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center relative z-10 border border-white/10">
                                                    <span className="font-display font-bold text-4xl text-white/50 text-gradient">{store.name[0]}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-void/20 group-hover:bg-void/0 transition-colors duration-500" />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-xl mb-1 group-hover:text-neon-pink transition-colors">{store.name}</h3>
                                            <p className="text-sm text-white/40 line-clamp-1 mb-4">{store.description || store.category}</p>
                                            <div className="flex items-center gap-4 text-xs font-bold text-white/60">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-400/10 text-yellow-500 border border-yellow-400/10">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>{Number(store.rating || 5).toFixed(1)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                                                    <MapPin className="w-3 h-3 text-neon-cyan" />
                                                    <span>{store.address?.city || 'Local'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            /* Placeholder for empty state */
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="glass rounded-[2rem] p-6 animate-pulse border border-white/5">
                                    <div className="aspect-video bg-white/5 rounded-2xl mb-6" />
                                    <div className="h-6 bg-white/5 rounded-lg w-3/4 mb-3" />
                                    <div className="h-4 bg-white/5 rounded-lg w-1/2 mb-6" />
                                    <div className="flex gap-2">
                                        <div className="h-6 w-12 bg-white/5 rounded-lg" />
                                        <div className="h-6 w-20 bg-white/5 rounded-lg" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Upcoming Streams */}
            <section className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10 flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight">Scheduled Events</h2>
                        <Link href="/streams" className="text-base font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10">
                            Full Calendar &rarr;
                        </Link>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {mockStreams.filter(s => !s.isLive).map((stream) => (
                            <StreamCard
                                key={stream.id}
                                {...stream}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="max-w-7xl mx-auto">
                    <h2 className="mb-12 text-3xl font-bold tracking-tight">Explore Categories</h2>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
                        {['Fashion', 'Beauty', 'Electronics', 'Home', 'Food', 'Art'].map((cat) => (
                            <Link
                                key={cat}
                                href={`/streams?category=${cat.toLowerCase()}`}
                                className="flex h-32 flex-col items-center justify-center rounded-[2rem] bg-white/5 border border-white/5 p-6 text-center transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 group"
                            >
                                <span className="text-white/80 font-bold group-hover:text-white transition-colors uppercase tracking-widest text-sm">{cat}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
