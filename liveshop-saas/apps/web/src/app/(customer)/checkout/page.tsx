'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';
import { CreditCard, MapPin, Package, CheckCircle, Lock } from 'lucide-react';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState('');

    const [shippingAddress, setShippingAddress] = useState({
        recipient: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        phone: '',
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
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
        }
    }, [searchParams]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        const name = e.target.name;

        // Format card number
        if (name === 'cardNumber') {
            value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        }

        // Format expiry date
        if (name === 'expiryDate') {
            value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substr(0, 5);
        }

        setPaymentInfo({ ...paymentInfo, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create order
            const orderData = {
                items: items.map(item => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity || 1,
                })),
                shippingAddress,
                paymentMethodId: 'mock_payment_method', // Mock payment
            };

            const response = await orderApi.createOrder(orderData);
            const newOrderId = response.data.data.order.id;

            setOrderId(newOrderId);
            setOrderComplete(true);

            // Clear cart
            localStorage.removeItem('cart');
        } catch (error: any) {
            console.error('Error processing order:', error);
            alert(error.response?.data?.error?.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const tax = subtotal * 0.08;
    const shipping = 9.99;
    const total = subtotal + tax + shipping;

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
                </div>

                <div className="relative glass rounded-3xl p-12 max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="font-display font-bold text-3xl mb-2">Order Confirmed!</h1>
                    <p className="text-white/60 mb-6">
                        Your order has been placed successfully
                    </p>
                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                        <p className="text-sm text-white/60 mb-1">Order Number</p>
                        <p className="font-mono font-semibold text-lg">{orderId.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-white/60 mb-8">
                        We'll send you a confirmation email with tracking details shortly.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn-primary w-full"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

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
        <div className="min-h-screen bg-void py-12 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="font-display font-bold text-3xl mb-2">Checkout</h1>
                    <p className="text-white/60">Complete your purchase</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-neon-cyan" />
                                    </div>
                                    <h2 className="font-semibold text-xl">Shipping Address</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Recipient Name</label>
                                        <input
                                            type="text"
                                            name="recipient"
                                            value={shippingAddress.recipient}
                                            onChange={handleAddressChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Street Address</label>
                                        <input
                                            type="text"
                                            name="street1"
                                            value={shippingAddress.street1}
                                            onChange={handleAddressChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={shippingAddress.city}
                                                onChange={handleAddressChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={shippingAddress.state}
                                                onChange={handleAddressChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={shippingAddress.postalCode}
                                                onChange={handleAddressChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={shippingAddress.phone}
                                                onChange={handleAddressChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-neon-pink" />
                                    </div>
                                    <h2 className="font-semibold text-xl">Payment Information</h2>
                                    <div className="ml-auto flex items-center gap-2 text-xs text-white/40">
                                        <Lock className="w-3 h-3" />
                                        <span>Secure Payment</span>
                                    </div>
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                                    <p className="text-yellow-400 text-sm">
                                        <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242 with any future expiry date and CVV.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={paymentInfo.cardNumber}
                                            onChange={handlePaymentChange}
                                            placeholder="4242 4242 4242 4242"
                                            maxLength={19}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors font-mono"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={paymentInfo.cardName}
                                            onChange={handlePaymentChange}
                                            placeholder="John Doe"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Expiry Date</label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={paymentInfo.expiryDate}
                                                onChange={handlePaymentChange}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors font-mono"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">CVV</label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={paymentInfo.cvv}
                                                onChange={handlePaymentChange}
                                                placeholder="123"
                                                maxLength={4}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-pink transition-colors font-mono"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="glass rounded-2xl p-6 sticky top-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Package className="w-5 h-5 text-neon-cyan" />
                                    <h2 className="font-semibold text-xl">Order Summary</h2>
                                </div>

                                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <img
                                                src={item.images?.[0] || '/placeholder.png'}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-white/60">Qty: {item.quantity || 1}</p>
                                                <p className="text-neon-pink font-semibold text-sm">
                                                    ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/10 pt-4 space-y-2 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">Subtotal</span>
                                        <span>${Number(subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">Shipping</span>
                                        <span>${Number(shipping).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">Tax</span>
                                        <span>${Number(tax).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-bold text-xl text-neon-pink">${Number(total).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Processing...' : 'Place Order'}
                                </button>

                                <p className="text-xs text-white/40 text-center mt-4">
                                    By placing this order, you agree to our terms and conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
