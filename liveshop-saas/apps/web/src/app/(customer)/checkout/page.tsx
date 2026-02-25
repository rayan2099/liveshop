'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { orderApi, paymentApi } from '@/lib/api';
import { CreditCard, MapPin, Package, Lock, Loader2, ArrowLeft } from 'lucide-react';
import Script from 'next/script';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [items, setItems] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'address' | 'payment'>('address');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [moyasarConfig, setMoyasarConfig] = useState<any>(null);

    const [shippingAddress, setShippingAddress] = useState({
        recipient: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'SA',
        phone: '',
    });

    useEffect(() => {
        const itemsParam = searchParams.get('items');
        if (itemsParam) {
            try {
                const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
                setItems(parsedItems);
            } catch (error) {
                console.error('Error parsing items:', error);
            }
        } else {
            // Try to load from localStorage if query param is missing
            const cart = localStorage.getItem('cart');
            if (cart) {
                setItems(JSON.parse(cart));
            }
        }
    }, [searchParams]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // 1. Create the pending order
            const orderData = {
                items: items.map(item => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity || 1,
                })),
                shippingAddress,
            };

            const orderResponse = await orderApi.createOrder(orderData);
            const newOrderId = orderResponse.data.data.order.id;
            setOrderId(newOrderId);

            // 2. Prepare Moyasar payment
            const paymentResponse = await paymentApi.preparePayment(newOrderId);
            setMoyasarConfig(paymentResponse.data.data);

            // 3. Move to payment step
            setStep('payment');
        } catch (error: any) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.error?.message || 'Failed to initialize order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Initialize Moyasar Form when script is loaded and config is available
    const initMoyasar = useCallback(() => {
        if (!moyasarConfig || typeof window === 'undefined' || !(window as any).Moyasar) return;

        (window as any).Moyasar.init({
            element: '.moyasar-payment-form',
            amount: moyasarConfig.amountHalalas,
            currency: moyasarConfig.currency,
            description: moyasarConfig.description,
            publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || 'pk_test_vcVox7pDeSReh9S8vG6S2XGkCBoWk8v5X769741c',
            callback_url: moyasarConfig.callbackUrl,
            methods: ['creditcard', 'applepay', 'stcpay'],
            on_completed: function (payment: any) {
                // This is a client-side hook, the real verification happens at the callbackUrl
                console.log('Payment initialized:', payment);
            }
        });
    }, [moyasarConfig]);

    useEffect(() => {
        if (step === 'payment' && (window as any).Moyasar) {
            initMoyasar();
        }
    }, [step, initMoyasar]);

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0);
    const tax = subtotal * 0.15; // 15% VAT in Saudi Arabia
    const shipping = 25; // 25 SAR shipping
    const total = subtotal + tax + shipping;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">No items to checkout</h1>
                    <button onClick={() => router.push('/')} className="text-neon-pink hover:underline">
                        Go back home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void py-12 px-4 relative overflow-hidden">
            {/* Moyasar form script/CSS */}
            <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.13.0/moyasar.css" />
            <Script
                src="https://cdn.moyasar.com/mpf/1.13.0/moyasar.js"
                strategy="lazyOnload"
                onLoad={initMoyasar}
            />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-neon-pink/10 rounded-full blur-[180px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-neon-cyan/10 rounded-full blur-[180px]" />
            </div>

            <div className="relative max-w-6xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    {step === 'payment' && (
                        <button
                            onClick={() => setStep('address')}
                            className="p-2 glass rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="font-display font-bold text-3xl mb-1">Checkout</h1>
                        <p className="text-white/60">
                            {step === 'address' ? 'Enter your delivery details' : 'Complete secure payment'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 'address' ? (
                            <form onSubmit={handleCreateOrder} className="glass rounded-[2rem] p-8 border border-white/5">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/20">
                                        <MapPin className="w-6 h-6 text-neon-cyan" />
                                    </div>
                                    <h2 className="font-bold text-2xl">Delivery Address</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-white/70">Recipient Name</label>
                                        <input
                                            type="text"
                                            name="recipient"
                                            value={shippingAddress.recipient}
                                            onChange={handleAddressChange}
                                            className="input-field"
                                            placeholder="Full Name"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-white/70">Street Address</label>
                                        <input
                                            type="text"
                                            name="street1"
                                            value={shippingAddress.street1}
                                            onChange={handleAddressChange}
                                            className="input-field"
                                            placeholder="Building, street, neighborhood"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/70">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            className="input-field"
                                            placeholder="Riyadh, Jeddah, etc."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/70">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={shippingAddress.postalCode}
                                            onChange={handleAddressChange}
                                            className="input-field"
                                            placeholder="12345"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-white/70">Phone Number</label>
                                        <div className="flex gap-3">
                                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-white/50">+966</div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={shippingAddress.phone}
                                                onChange={handleAddressChange}
                                                className="input-field flex-1"
                                                placeholder="5XXXXXXXX"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="btn-primary w-full mt-10 h-16 text-lg font-bold flex items-center justify-center gap-3"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Initializing Order...
                                        </>
                                    ) : (
                                        'Continue to Payment'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="glass rounded-[2rem] p-8 border border-white/5 animate-in fade-in duration-500">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-neon-pink/20 flex items-center justify-center border border-neon-pink/20">
                                        <CreditCard className="w-6 h-6 text-neon-pink" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-2xl">Secure Payment</h2>
                                        <p className="text-white/40 text-sm flex items-center gap-1.5 mt-0.5">
                                            <Lock className="w-3 h-3" />
                                            SSL Secured Transaction
                                        </p>
                                    </div>
                                </div>

                                {/* Moyasar Hosted Form Container */}
                                <div className="moyasar-payment-form bg-white rounded-2xl overflow-hidden min-h-[300px]">
                                    {!moyasarConfig && (
                                        <div className="h-[400px] flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-black/20 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <p className="text-center text-white/40 text-xs mt-8">
                                    Your payment is processed securely by Moyasar. <br />
                                    No card details are stored on our servers.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass rounded-[2rem] p-8 border border-white/5 sticky top-8">
                            <div className="flex items-center gap-3 mb-8">
                                <Package className="w-6 h-6 text-neon-cyan" />
                                <h2 className="font-bold text-xl">Order Summary</h2>
                            </div>

                            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                            <img
                                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-1 right-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                                ×{item.quantity || 1}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <p className="font-bold text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-white/40 mb-1">Unit: SAR {Number(item.price).toFixed(2)}</p>
                                            <p className="text-neon-pink font-bold text-base">
                                                SAR {(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-white/5 pt-6 text-sm">
                                <div className="flex justify-between text-white/50">
                                    <span>Subtotal</span>
                                    <span>SAR {Number(subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>Shipping</span>
                                    <span>SAR {Number(shipping).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>VAT (15%)</span>
                                    <span>SAR {Number(tax).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-white/5 mt-4">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-display font-bold text-3xl text-neon-pink">
                                        SAR {Number(total).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <img src="https://mada.com.sa/assets/images/logo.png" alt="Mada" className="h-6 object-contain" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 object-contain" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 object-contain" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/1280px-Apple_Pay_logo.svg.png" alt="Apple Pay" className="h-6 object-contain ml-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    padding: 1rem 1.25rem;
                    color: white;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #ff007a;
                    background: rgba(255, 0, 122, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
