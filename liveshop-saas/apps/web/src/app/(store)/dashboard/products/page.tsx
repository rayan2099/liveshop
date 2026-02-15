'use client';

import { useQuery } from '@tanstack/react-query';
import { storeApi, productApi } from '@/lib/api';
import { Package, Plus, Search, Filter, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const searchParams = useSearchParams();

    // Fetch store ID
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

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['store-products', storeId, search],
        queryFn: () => storeApi.getStoreProducts(storeId!, { search, limit: 50 }),
        enabled: !!storeId,
    });

    const products = productsData?.data?.data?.items || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-bold text-3xl">Products</h1>
                    <p className="text-white/60">Manage your store inventory and pricing</p>
                </div>
                <Link href={storeId ? `/dashboard/products/new?storeId=${storeId}` : '/dashboard/products/new'} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-5 h-5" />
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink transition-colors"
                    />
                </div>
                <button className="glass px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Filter className="w-5 h-5" />
                    More Filters
                </button>
            </div>

            {/* Products Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-left">
                                <th className="px-6 py-4 text-sm font-semibold text-white/60">Product</th>
                                <th className="px-6 py-4 text-sm font-semibold text-white/60">Category</th>
                                <th className="px-6 py-4 text-sm font-semibold text-white/60">Price</th>
                                <th className="px-6 py-4 text-sm font-semibold text-white/60">Stock</th>
                                <th className="px-6 py-4 text-sm font-semibold text-white/60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/5 rounded-lg" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-white/10 rounded" />
                                                    <div className="w-20 h-3 bg-white/5 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-20 h-4 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-12 h-4 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-8 h-8 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                                        No products found. Start by adding your first product!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product: any) => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images?.[0] || 'https://via.placeholder.com/400'}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-lg object-cover bg-white/10"
                                                />
                                                <div>
                                                    <p className="font-medium group-hover:text-neon-pink transition-colors">{product.name}</p>
                                                    <p className="text-xs text-white/40 truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-white/60 capitalize">
                                                {product.tags?.[0] || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium text-neon-cyan">${Number(product.price).toFixed(2)}</p>
                                                {product.compareAtPrice && (
                                                    <p className="text-xs text-white/40 line-through">${Number(product.compareAtPrice).toFixed(2)}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${product.inventoryQuantity < 10 ? 'text-red-400' : 'text-white/60'}`}>
                                                {product.inventoryQuantity} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-neon-pink">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
