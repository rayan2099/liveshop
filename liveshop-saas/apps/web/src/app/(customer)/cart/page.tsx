'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
    storeId: string;
    storeName?: string;
}

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const updateCart = (newCart: CartItem[]) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const updateQuantity = (index: number, delta: number) => {
        const newCart = [...cart];
        newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
        updateCart(newCart);
    };

    const removeItem = (index: number) => {
        const newCart = cart.filter((_, i) => i !== index);
        updateCart(newCart);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-white/40" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-white/60 mb-6">Start shopping to add items to your cart</p>
                    <Link href="/" className="btn-primary inline-block">
                        Browse Streams
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void py-12 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="font-display font-bold text-3xl mb-2">Shopping Cart</h1>
                    <p className="text-white/60">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item, index) => (
                            <div key={index} className="glass rounded-2xl p-6">
                                <div className="flex gap-4">
                                    <img
                                        src={item.images?.[0] || '/placeholder.png'}
                                        alt={item.name}
                                        className="w-24 h-24 object-cover rounded-xl"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                                        {item.storeName && (
                                            <p className="text-sm text-white/60 mb-2">{item.storeName}</p>
                                        )}
                                        <p className="text-neon-pink font-bold text-xl">${Number(item.price).toFixed(2)}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(index, -1)}
                                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(index, 1)}
                                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="glass rounded-2xl p-6 sticky top-6">
                            <h2 className="font-semibold text-xl mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Subtotal</span>
                                    <span className="font-semibold">${Number(subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Tax (8%)</span>
                                    <span className="font-semibold">${Number(tax).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                                    <span className="font-semibold text-lg">Total</span>
                                    <span className="font-bold text-2xl text-neon-pink">${Number(total).toFixed(2)}</span>
                                </div>
                            </div>

                            <Link
                                href={`/checkout?items=${encodeURIComponent(JSON.stringify(cart))}`}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/"
                                className="block text-center text-sm text-white/60 hover:text-white mt-4 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
