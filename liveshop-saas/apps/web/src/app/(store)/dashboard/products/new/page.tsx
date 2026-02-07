'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productApi, storeApi } from '@/lib/api';
import { Package, Upload, Plus, X, ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        inventoryQuantity: '',
        category: '',
        tags: [] as string[],
        images: [] as string[],
    });
    const [newTag, setNewTag] = useState('');

    // Fetch store ID
    const { data: storesData } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.getMyStores(),
    });
    const storeId = storesData?.data?.items?.[0]?.id;

    const createProductMutation = useMutation({
        mutationFn: (data: any) => productApi.createProduct(data),
        onSuccess: () => {
            router.push('/dashboard');
        },
        onError: (error: any) => {
            alert(error.response?.data?.error?.message || 'Failed to create product');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) {
            alert('Store ID not found. Please create a store first.');
            return;
        }

        createProductMutation.mutate({
            ...formData,
            storeId,
            price: parseFloat(formData.price),
            compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
            inventoryQuantity: parseInt(formData.inventoryQuantity),
            images: formData.images.length > 0 ? formData.images : ['https://via.placeholder.com/400'],
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display font-bold text-3xl">Add New Product</h1>
                    <p className="text-white/60">Create a new item in your store catalog</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-neon-pink" />
                                Basic Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Wireless Headphones"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Tell customers about your product..."
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors resize-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Plus className="w-5 h-5 text-neon-cyan" />
                                Pricing & Inventory
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Compare at Price ($)</label>
                                    <input
                                        type="number"
                                        name="compareAtPrice"
                                        value={formData.compareAtPrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="inventoryQuantity"
                                    value={formData.inventoryQuantity}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Upload className="w-5 h-5 text-purple-400" />
                                Images
                            </h2>
                            <div className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-neon-pink/50 transition-colors cursor-pointer group">
                                <Upload className="w-8 h-8 text-white/20 group-hover:text-neon-pink transition-colors" />
                                <p className="text-xs text-white/40">Upload image</p>
                                <p className="text-[10px] text-white/20">Max 5MB</p>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h2 className="font-semibold text-lg">Organization</h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors appearance-none"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="beauty">Beauty</option>
                                    <option value="home">Home & Decor</option>
                                    <option value="gadgets">Gadgets</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tags</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add tag..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-neon-pink transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="p-2 glass rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-xs group">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)}>
                                                <X className="w-3 h-3 text-white/40 group-hover:text-red-400" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={createProductMutation.isPending}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                        >
                            {createProductMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
