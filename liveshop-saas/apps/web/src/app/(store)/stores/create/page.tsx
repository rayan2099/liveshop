'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/api';
import { Store, MapPin, FileText, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

const categories = [
    'Fashion & Apparel',
    'Beauty & Cosmetics',
    'Electronics',
    'Home & Garden',
    'Food & Beverage',
    'Sports & Outdoors',
    'Toys & Games',
    'Books & Media',
    'Health & Wellness',
    'Art & Crafts',
    'Automotive',
    'Other',
];

export default function CreateStorePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { refetchUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: categories[0],
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'USA',
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData({
                ...formData,
                address: {
                    ...formData.address,
                    [addressField]: value,
                },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await storeApi.createStore(formData);
            const store = response.data.data.store;

            // Refresh query cache so the dashboard sees the new store
            await queryClient.invalidateQueries({ queryKey: ['my-stores'] });

            // Refresh user data so the app knows the user is now a store owner
            await refetchUser();

            // Success! Store is created, now go to dashboard
            router.push(`/dashboard?storeId=${store.id}`);
        } catch (err: any) {
            const serverError = err.response?.data?.error;

            // Check for the "taken" error specifically
            if (serverError?.code === 'SLUG_EXISTS') {
                setError('A store with this name already exists. Please choose a unique name (or use your other account if you already created this one).');
                setIsLoading(false);
                return;
            }

            if (serverError?.code === 'VALIDATION_ERROR' && serverError.details) {
                setError(`Validation failed: ${serverError.details[0]?.message || 'Please check your inputs'}`);
            } else {
                setError(serverError?.message || 'Failed to create store');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void py-12 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative max-w-3xl mx-auto">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="glass rounded-3xl p-8">
                    <div className="mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center mb-4">
                            <Store className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="font-display font-bold text-3xl mb-2">Create Your Store</h1>
                        <p className="text-white/60">Start selling live on LiveShop</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Store Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Store Name <span className="text-neon-pink">*</span>
                            </label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink transition-colors"
                                    placeholder="My Awesome Store"
                                    required
                                />
                            </div>
                            <p className="text-xs text-white/40 mt-1">This will be visible to customers</p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Category <span className="text-neon-pink">*</span>
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink transition-colors appearance-none cursor-pointer"
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} className="bg-void-dark">
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description <span className="text-neon-pink">*</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-5 h-5 text-white/40" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink transition-colors min-h-[120px]"
                                    placeholder="Tell customers about your store..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-5 h-5 text-neon-cyan" />
                                <h3 className="font-semibold">Store Address</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                    placeholder="123 Main St"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                        placeholder="New York"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">State</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                        placeholder="NY"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="address.postalCode"
                                        value={formData.address.postalCode}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                        placeholder="10001"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Country</label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                        placeholder="USA"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 rounded-xl border border-white/10 hover:border-white/30 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating...' : 'Create Store'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="mt-6 glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li className="flex items-start gap-2">
                            <span className="text-neon-pink mt-0.5">•</span>
                            <span>Your store will be created and you'll be redirected to your dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-neon-cyan mt-0.5">•</span>
                            <span>You can add products and customize your store settings</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-neon-pink mt-0.5">•</span>
                            <span>Start going live and selling to customers!</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
