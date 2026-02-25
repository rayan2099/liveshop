'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { storeApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Settings, Store, MapPin, FileText, Tag, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

export default function StoreSettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: storesData, isLoading: isLoadingStores } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.getMyStores(),
        enabled: !!user,
    });

    const stores = storesData?.data?.data?.items || [];
    const urlStoreId = searchParams.get('storeId');
    const store = urlStoreId
        ? stores.find((s: any) => s.id === urlStoreId) || stores[0]
        : stores[0];

    const [activeSection, setActiveSection] = useState('general');
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

    const [notifs, setNotifs] = useState({
        orderUpdates: true,
        streamAlerts: true,
        marketing: false,
        systemStatus: true
    });

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name || '',
                description: store.description || '',
                category: store.category || categories[0],
                address: {
                    street: store.address?.street || '',
                    city: store.address?.city || '',
                    state: store.address?.state || '',
                    postalCode: store.address?.postalCode || '',
                    country: store.address?.country || 'USA',
                },
            });
        }
    }, [store]);

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
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await storeApi.updateStore(store.id, formData);
            setSuccess('Store settings updated successfully!');
            await queryClient.invalidateQueries({ queryKey: ['my-stores'] });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Update error:', err.response?.data);
            const serverError = err.response?.data?.error;

            if (serverError?.details) {
                const details = serverError.details.map((d: any) => d.message).join(', ');
                setError(`Validation Error: ${details}`);
            } else {
                setError(serverError?.message || 'Failed to update store settings');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingStores) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-neon-pink animate-spin mb-4" />
                <p className="text-white/60">Loading store settings...</p>
            </div>
        );
    }

    if (!store && !isLoadingStores) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <div className="glass rounded-3xl p-12">
                    <h2 className="text-2xl font-bold mb-4">No Store Found</h2>
                    <p className="text-white/60 mb-8">You need a store to access settings.</p>
                    <Link href="/stores/create" className="btn-primary">
                        Create a Store
                    </Link>
                </div>
            </div>
        );
    }

    const sections = [
        { id: 'general', label: 'General Details', icon: Store },
        { id: 'location', label: 'Location & Shipping', icon: MapPin },
        { id: 'payments', label: 'Payments & Billing', icon: FileText },
        { id: 'notifications', label: 'Notification Prefs', icon: Settings },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display font-bold text-3xl">Store Settings</h1>
                        <p className="text-white/60">Configure your store presence and details</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium">
                        Active Store: {store.name}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation/Status */}
                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 border-white/5">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-neon-pink" />
                            Sections
                        </h3>
                        <div className="space-y-2">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium ${isActive
                                            ? 'bg-neon-pink/10 text-neon-pink border border-neon-pink/20'
                                            : 'hover:bg-white/5 text-white/60 border border-transparent'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {section.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass rounded-3xl p-6 border-white/5 bg-gradient-to-br from-neon-cyan/5 to-transparent">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-neon-cyan mb-4">Pro Tips</h3>
                        <p className="text-sm text-white/60 leading-relaxed mb-4">
                            Adding a clear, descriptive category helps customers discover your store faster in our marketplace.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                            Updates apply instantly
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings Form */}
                <div className="lg:col-span-2 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 shadow-xl">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span className="text-[10px] font-bold">✓</span>
                            </div>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {activeSection === 'general' && (
                            <div className="glass rounded-3xl p-8 border-white/5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-l from-white to-transparent h-full w-1/3 pointer-events-none"></div>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 rounded-xl bg-neon-pink/10">
                                        <Store className="w-6 h-6 text-neon-pink" />
                                    </div>
                                    <h2 className="text-xl font-bold">General Information</h2>
                                </div>

                                <div className="space-y-6 relative">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/60">Store Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-all focus:ring-1 focus:ring-neon-pink/30"
                                            placeholder="Enter store name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/60">Category</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink transition-all appearance-none cursor-pointer"
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

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/60">Description</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-4 w-5 h-5 text-white/20" />
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink transition-all min-h-[120px]"
                                                placeholder="What do you sell?"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'location' && (
                            <div className="glass rounded-3xl p-8 border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 rounded-xl bg-neon-cyan/10">
                                        <MapPin className="w-6 h-6 text-neon-cyan" />
                                    </div>
                                    <h2 className="text-xl font-bold">Physical Location</h2>
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/60">Street Address</label>
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-all"
                                            placeholder="123 Main St"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/60">City</label>
                                            <input
                                                type="text"
                                                name="address.city"
                                                value={formData.address.city}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/60">State</label>
                                            <input
                                                type="text"
                                                name="address.state"
                                                value={formData.address.state}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/60">ZIP Code</label>
                                            <input
                                                type="text"
                                                name="address.postalCode"
                                                value={formData.address.postalCode}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/60">Country</label>
                                            <input
                                                type="text"
                                                name="address.country"
                                                value={formData.address.country}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'payments' && (
                            <div className="glass rounded-3xl p-8 border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 rounded-xl bg-green-500/10">
                                        <FileText className="w-6 h-6 text-green-500" />
                                    </div>
                                    <h2 className="text-xl font-bold">Payments & Billing</h2>
                                </div>
                                <div className="p-8 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                                    <p className="text-white/40 mb-4">Payment integration is currently handled automatically through Stripe.</p>
                                    <button type="button" className="btn-primary py-2 px-6 opacity-50 cursor-not-allowed">
                                        Connect Stripe Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="glass rounded-3xl p-8 border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 rounded-xl bg-neon-cyan/10">
                                        <Settings className="w-6 h-6 text-neon-cyan" />
                                    </div>
                                    <h2 className="text-xl font-bold">Notification Preferences</h2>
                                </div>
                                <div className="space-y-6">
                                    {Object.entries(notifs).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div>
                                                <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                <p className="text-xs text-white/40">Receive updates about this activity</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setNotifs({ ...notifs, [key]: !value })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-neon-pink' : 'bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sticky Action Bar */}
                        <div className="sticky bottom-8 z-30">
                            <div className="p-4 glass-strong rounded-3xl border-white/10 shadow-2xl flex items-center justify-between gap-4">
                                <p className="text-sm text-white/40 ml-4 hidden md:block">
                                    Careful! High-quality info drives more sales.
                                </p>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="flex-1 md:flex-none px-8 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 group min-w-[160px]"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}
