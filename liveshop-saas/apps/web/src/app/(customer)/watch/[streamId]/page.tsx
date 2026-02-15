'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { streamApi } from '@/lib/api';
import { Users, MessageSquare, ShoppingCart, Heart, Share2, X } from 'lucide-react';
import Link from 'next/link';

export default function WatchStreamPage() {
    const params = useParams();
    const streamId = params.streamId as string;

    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [pinnedProduct, setPinnedProduct] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        loadStream();
        loadChat();
    }, [streamId]);

    const loadStream = async () => {
        try {
            const response = await streamApi.getStream(streamId);
            setStream(response.data.data.stream);

            // Set pinned product if exists
            if (response.data.data.stream.pinnedProducts?.length > 0) {
                setPinnedProduct(response.data.data.stream.pinnedProducts[0].product);
            }
        } catch (error) {
            console.error('Error loading stream:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadChat = async () => {
        try {
            const response = await streamApi.getChat(streamId, { page: 1, limit: 50 });
            setMessages(response.data.data.messages || []);
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await streamApi.sendMessage(streamId, {
                content: newMessage,
                type: 'text',
            });
            setNewMessage('');
            loadChat(); // Reload chat
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const addToCart = (product: any) => {
        setCart([...cart, { ...product, quantity: 1 }]);
        setShowCart(true);
    };

    const removeFromCart = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink" />
            </div>
        );
    }

    if (!stream) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Stream not found</h1>
                    <Link href="/" className="text-neon-pink hover:underline">
                        Go back home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void">
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Video Area */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Video Player */}
                        <div className="glass rounded-2xl overflow-hidden aspect-video relative">
                            {stream.status === 'live' ? (
                                <div className="w-full h-full bg-void-dark flex items-center justify-center">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    {/* For demo, show placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20">
                                        <div className="text-center">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan mx-auto mb-4 animate-pulse" />
                                            <p className="text-xl font-semibold">Stream is Live!</p>
                                            <p className="text-white/60 text-sm mt-2">Video playback coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-void-dark">
                                    <div className="text-center">
                                        <p className="text-xl font-semibold mb-2">Stream Offline</p>
                                        <p className="text-white/60">This stream has ended</p>
                                    </div>
                                </div>
                            )}

                            {/* Live Indicator */}
                            {stream.status === 'live' && (
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    <span className="font-semibold text-sm">LIVE</span>
                                </div>
                            )}

                            {/* Viewer Count */}
                            <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 glass rounded-full">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold text-sm">{stream.viewerCount || 0}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button className="p-3 glass rounded-full hover:bg-white/20 transition-colors">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="p-3 glass rounded-full hover:bg-white/20 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Pinned Product */}
                            {pinnedProduct && stream.status === 'live' && (
                                <div className="absolute bottom-4 left-4 right-24 glass rounded-xl p-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={pinnedProduct.images?.[0] || '/placeholder.png'}
                                            alt={pinnedProduct.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{pinnedProduct.name}</h3>
                                            <p className="text-neon-pink font-bold text-lg">${Number(pinnedProduct.price).toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => addToCart(pinnedProduct)}
                                            className="px-4 py-2 bg-neon-pink hover:bg-neon-pink/80 rounded-xl font-semibold transition-colors whitespace-nowrap"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stream Info */}
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <img
                                    src={stream.store?.logoUrl || '/placeholder.png'}
                                    alt={stream.store?.name}
                                    className="w-16 h-16 rounded-xl object-cover"
                                />
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold mb-1">{stream.title}</h1>
                                    <Link
                                        href={`/stores/${stream.store?.slug}`}
                                        className="text-neon-cyan hover:underline font-medium"
                                    >
                                        {stream.store?.name}
                                    </Link>
                                    <p className="text-white/60 mt-2">{stream.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Chat */}
                        <div className="glass rounded-2xl p-6 flex flex-col h-[600px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Live Chat
                                </h3>
                                <button
                                    onClick={() => setShowCart(!showCart)}
                                    className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-pink rounded-full text-xs flex items-center justify-center font-bold">
                                            {cart.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {!showCart ? (
                                <>
                                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                                        {messages.length === 0 ? (
                                            <p className="text-white/40 text-sm text-center py-8">
                                                No messages yet. Be the first to chat!
                                            </p>
                                        ) : (
                                            messages.map((msg, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium">
                                                            {msg.user?.profile?.firstName || 'User'}
                                                        </p>
                                                        <p className="text-sm text-white/80 break-words">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {stream.status === 'live' && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="Say something..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-pink transition-colors"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                className="p-2 rounded-xl bg-neon-pink hover:bg-neon-pink/80 transition-colors"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Shopping Cart</h3>
                                        <button
                                            onClick={() => setShowCart(false)}
                                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {cart.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <p className="text-white/40 text-sm text-center">
                                                Your cart is empty
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                                                {cart.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                        <img
                                                            src={item.images?.[0] || '/placeholder.png'}
                                                            alt={item.name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{item.name}</p>
                                                            <p className="text-neon-pink font-semibold">${item.price}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(idx)}
                                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-white/10 pt-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="font-semibold">Total</span>
                                                    <span className="text-xl font-bold text-neon-pink">
                                                        ${cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/checkout?items=${encodeURIComponent(JSON.stringify(cart))}`}
                                                    className="block w-full btn-primary text-center"
                                                >
                                                    Checkout
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
