'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentApi } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutConfirmPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const id = searchParams.get('id'); // Moyasar payment ID
        const currentOrderId = searchParams.get('orderId');
        const paymentStatus = searchParams.get('status');

        if (!id || !currentOrderId) {
            setStatus('error');
            setError('Missing payment or order information.');
            return;
        }

        setOrderId(currentOrderId);

        // If Moyasar already reports failure in URL
        if (paymentStatus === 'failed') {
            setStatus('error');
            setError(searchParams.get('message') || 'Payment failed.');
            return;
        }

        // Verify with our backend (only once)
        if (!verificationAttempted.current) {
            verificationAttempted.current = true;
            verifyPayment(id, currentOrderId);
        }
    }, [searchParams]);

    const verifyPayment = async (moyasarPaymentId: string, orderId: string) => {
        try {
            const response = await paymentApi.confirmPayment(moyasarPaymentId, orderId);
            if (response.data.success) {
                setStatus('success');
                // Clear cart on success
                localStorage.removeItem('cart');
            } else {
                throw new Error(response.data.error?.message || 'Verification failed');
            }
        } catch (err: any) {
            console.error('Payment verification error:', err);
            setStatus('error');
            setError(err.response?.data?.error?.message || err.message || 'Could not verify payment');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4">
                <Loader2 className="w-12 h-12 text-neon-pink animate-spin mb-4" />
                <h1 className="text-2xl font-bold">Verifying Payment...</h1>
                <p className="text-white/60 mt-2 text-center">Please don't close this window while we confirm your order.</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center px-4">
                <div className="relative glass rounded-3xl p-12 max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="font-display font-bold text-3xl mb-2">Payment Confirmed!</h1>
                    <p className="text-white/60 mb-6">Your order has been placed successfully.</p>
                    <div className="bg-white/5 rounded-xl p-4 mb-8">
                        <p className="text-sm text-white/60 mb-1">Order Number</p>
                        <p className="font-mono font-semibold text-lg">{orderId?.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <Link href="/orders" className="btn-primary w-full inline-block">
                        View My Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void flex items-center justify-center px-4">
            <div className="relative glass rounded-3xl p-12 max-w-md w-full text-center border-red-500/20">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="font-display font-bold text-3xl mb-2">Payment Failed</h1>
                <p className="text-white/60 mb-6">{error || 'Something went wrong with your transaction.'}</p>
                <Link href={`/checkout?orderId=${orderId}`} className="btn-primary w-full inline-block mb-3">
                    Try Again
                </Link>
                <Link href="/cart" className="text-white/40 hover:text-white text-sm transition-colors">
                    Return to Cart
                </Link>
            </div>
        </div>
    );
}
