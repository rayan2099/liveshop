'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { streamApi, productApi } from '@/lib/api';
import { Video, VideoOff, Mic, MicOff, MessageSquare, Package, Users, DollarSign, X } from 'lucide-react';

export default function BroadcastPage() {
    const searchParams = useSearchParams();
    const storeId = searchParams.get('storeId');

    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [streamData, setStreamData] = useState<any>(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [pinnedProduct, setPinnedProduct] = useState<any>(null);
    const [showProductPicker, setShowProductPicker] = useState(false);

    // Initialize camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true,
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraOn(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraOn(false);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicOn(!isMicOn);
        }
    };

    const goLive = async () => {
        if (!storeId) {
            alert('Please select a store first');
            return;
        }

        try {
            // Create stream
            const createResponse = await streamApi.createStream({
                storeId,
                title: 'Live Shopping Session',
                description: 'Check out our amazing products!',
                type: 'instant',
            });

            const newStream = createResponse.data.data.stream;
            setStreamData(newStream);

            // Start stream
            await streamApi.startStream(newStream.id);
            setIsLive(true);

            // Load products for this store
            const productsResponse = await productApi.search({ storeId });
            setProducts(productsResponse.data.data.items || []);
        } catch (error: any) {
            console.error('Error going live:', error);
            alert(error.response?.data?.error?.message || 'Failed to start stream');
        }
    };

    const endStream = async () => {
        if (!streamData) return;

        try {
            await streamApi.endStream(streamData.id);
            setIsLive(false);
            stopCamera();
        } catch (error) {
            console.error('Error ending stream:', error);
        }
    };

    const pinProduct = async (productId: string) => {
        if (!streamData) return;

        try {
            await streamApi.pinProduct(streamData.id, { productId });
            const product = products.find(p => p.id === productId);
            setPinnedProduct(product);
            setShowProductPicker(false);
        } catch (error) {
            console.error('Error pinning product:', error);
        }
    };

    const sendMessage = async () => {
        if (!streamData || !newMessage.trim()) return;

        try {
            await streamApi.sendMessage(streamData.id, {
                content: newMessage,
                type: 'text',
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    useEffect(() => {
        if (!storeId) {
            alert('No store selected. Please create a store first.');
        }
    }, [storeId]);

    return (
        <div className="min-h-screen bg-void p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="font-display font-bold text-3xl mb-2">Broadcast Studio</h1>
                    <p className="text-white/60">Go live and showcase your products</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Video Area */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Video Preview */}
                        <div className="glass rounded-2xl overflow-hidden aspect-video relative">
                            {isCameraOn ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-void-dark">
                                    <div className="text-center">
                                        <VideoOff className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                        <p className="text-white/40">Camera is off</p>
                                    </div>
                                </div>
                            )}

                            {/* Live Indicator */}
                            {isLive && (
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    <span className="font-semibold text-sm">LIVE</span>
                                </div>
                            )}

                            {/* Viewer Count */}
                            {isLive && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 glass rounded-full">
                                    <Users className="w-4 h-4" />
                                    <span className="font-semibold text-sm">{viewerCount}</span>
                                </div>
                            )}

                            {/* Pinned Product Overlay */}
                            {pinnedProduct && isLive && (
                                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={pinnedProduct.images?.[0] || '/placeholder.png'}
                                            alt={pinnedProduct.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{pinnedProduct.name}</h3>
                                            <p className="text-neon-pink font-bold text-lg">${pinnedProduct.price}</p>
                                        </div>
                                        <button
                                            onClick={() => setPinnedProduct(null)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {!isCameraOn ? (
                                        <button
                                            onClick={startCamera}
                                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <Video className="w-6 h-6" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopCamera}
                                            className="p-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                        >
                                            <VideoOff className="w-6 h-6 text-red-400" />
                                        </button>
                                    )}

                                    <button
                                        onClick={toggleMic}
                                        className={`p-4 rounded-xl transition-colors ${isMicOn
                                                ? 'bg-white/5 hover:bg-white/10'
                                                : 'bg-red-500/20 hover:bg-red-500/30'
                                            }`}
                                    >
                                        {isMicOn ? (
                                            <Mic className="w-6 h-6" />
                                        ) : (
                                            <MicOff className="w-6 h-6 text-red-400" />
                                        )}
                                    </button>

                                    {isLive && (
                                        <button
                                            onClick={() => setShowProductPicker(!showProductPicker)}
                                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <Package className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>

                                {!isLive ? (
                                    <button
                                        onClick={goLive}
                                        disabled={!isCameraOn}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Go Live
                                    </button>
                                ) : (
                                    <button
                                        onClick={endStream}
                                        className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-colors font-semibold"
                                    >
                                        End Stream
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Product Picker */}
                        {showProductPicker && (
                            <div className="glass rounded-2xl p-6">
                                <h3 className="font-semibold mb-4">Pin a Product</h3>
                                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                                    {products.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => pinProduct(product.id)}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                                        >
                                            <img
                                                src={product.images?.[0] || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded-lg"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <p className="text-neon-pink text-sm">${product.price}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="glass rounded-2xl p-6">
                            <h3 className="font-semibold mb-4">Stream Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Viewers</span>
                                    </div>
                                    <span className="font-semibold">{viewerCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-sm">Messages</span>
                                    </div>
                                    <span className="font-semibold">{messages.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-sm">Revenue</span>
                                    </div>
                                    <span className="font-semibold text-neon-pink">$0</span>
                                </div>
                            </div>
                        </div>

                        {/* Chat */}
                        <div className="glass rounded-2xl p-6 flex flex-col h-96">
                            <h3 className="font-semibold mb-4">Live Chat</h3>

                            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                                {messages.length === 0 ? (
                                    <p className="text-white/40 text-sm text-center py-8">
                                        No messages yet
                                    </p>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{msg.user?.profile?.firstName || 'User'}</p>
                                                <p className="text-sm text-white/60">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {isLive && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message..."
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
