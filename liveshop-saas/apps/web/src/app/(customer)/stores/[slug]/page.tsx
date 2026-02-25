'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { storeApi, productApi } from '@/lib/api';
import { Star, MapPin, ShoppingBag, Video, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StoreDetailPage() {
    const { slug } = useParams() as { slug: string };

    const { data: storeResponse, isLoading: isLoadingStore } = useQuery({
        queryKey: ['store', slug],
        queryFn: () => storeApi.getStore(slug),
    });

    const store = storeResponse?.data?.data?.store;

    const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['store-products', store?.id],
        queryFn: () => storeApi.getStoreProducts(store.id),
        enabled: !!store?.id,
    });

    const products = productsResponse?.data?.data?.items || [];

    if (isLoadingStore) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-void">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink" />
            </div>
        );
    }

    if (!store) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Store Not Found</h1>
                <p className="text-white/60 mb-8">The store you're looking for doesn't exist or has been moved.</p>
                <Link href="/stores" className="btn-primary px-8 py-3 translate-x-0">
                    Browse All Stores
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Store Hero */}
            <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
                <div className="absolute inset-0 bg-void">
                    {store.coverUrl ? (
                        <img src={store.coverUrl} className="w-full h-full object-cover opacity-50" alt="" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-cyan-900/40 opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] glass p-1 bg-white/5 border-white/10 shrink-0 shadow-2xl overflow-hidden group">
                            {store.logoUrl ? (
                                <img src={store.logoUrl} className="w-full h-full object-cover rounded-[2.2rem]" alt={store.name} />
                            ) : (
                                <div className="w-full h-full rounded-[2.2rem] bg-white/5 flex items-center justify-center">
                                    <span className="font-display font-bold text-5xl text-gradient">{store.name[0]}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pb-4">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-neon-pink/20 text-neon-pink border border-neon-pink/20">
                                    {store.category || 'Retail'}
                                </span>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-500 border border-yellow-400/10">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span>{Number(store.rating || 5).toFixed(1)} ({store.reviewCount || 0} reviews)</span>
                                </div>
                            </div>
                            <h1 className="text-4xl sm:text-6xl font-display font-bold mb-4 tracking-tighter">{store.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-white/60">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-neon-cyan" />
                                    <span className="text-sm font-medium">{store.address?.city}, {store.address?.state}</span>
                                </div>
                                {store.website && (
                                    <div className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-white/40" />
                                        <a href={store.website} target="_blank" className="text-sm hover:text-white transition-colors underline underline-offset-4">Visit Website</a>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4 pb-4">
                            <Link href={`/broadcast?storeId=${store.id}`} className="btn-secondary flex items-center gap-2 py-4 px-6 rounded-2xl">
                                <Video className="w-5 h-5" />
                                <span className="font-bold">Live Stream</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-10">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 mb-6">About</h3>
                            <p className="text-white/60 leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5">
                                {store.description || "No description provided."}
                            </p>
                        </div>

                        <div className="glass rounded-[2rem] p-8 border-white/5">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 mb-6">Quick Stats</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/40 text-sm">Products</span>
                                    <span className="font-bold">{products.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/40 text-sm">Total Orders</span>
                                    <span className="font-bold">{store.orderCount || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/40 text-sm">Joined</span>
                                    <span className="font-bold">{new Date(store.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-bold tracking-tight">Our Products</h2>
                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-white/5 rounded-xl text-sm font-bold text-white/60">{products.length} Items</span>
                            </div>
                        </div>

                        {isLoadingProducts ? (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="glass rounded-[2rem] overflow-hidden p-6 animate-pulse">
                                        <div className="aspect-square bg-white/5 rounded-2xl mb-6" />
                                        <div className="h-6 bg-white/5 rounded-lg w-3/4 mb-3" />
                                        <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 glass rounded-[3rem] border border-dashed border-white/10">
                                <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold mb-2">No products yet</h3>
                                <p className="text-white/40">Check back soon for new arrivals!</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {products.map((product: any) => (
                                    <div key={product.id} className="group glass rounded-[2rem] overflow-hidden hover:bg-white/10 transition-all duration-500 border border-white/5 hover:border-white/20 hover:scale-[1.02]">
                                        <div className="aspect-square bg-white/5 relative overflow-hidden">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-12 h-12 text-white/10" />
                                                </div>
                                            )}
                                            <button className="absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-neon-pink flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-neon-pink/20">
                                                <ShoppingBag className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-display font-bold text-white">${Number(product.price).toFixed(2)}</span>
                                                {product.compareAtPrice && (
                                                    <span className="text-sm text-white/30 line-through">${Number(product.compareAtPrice).toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
