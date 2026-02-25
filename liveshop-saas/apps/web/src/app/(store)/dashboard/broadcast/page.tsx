'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { streamApi, storeApi, productApi } from '@/lib/api';
import {
    LiveKitRoom,
    VideoConference,
    ControlBar,
    RoomAudioRenderer,
    useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import {
    Video,
    Mic,
    Users,
    Package,
    MessageSquare,
    Settings,
    StopCircle,
    Play,
    Plus,
    Tag
} from 'lucide-react';
import Link from 'next/link';

export default function BroadcasterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const storeId = searchParams.get('storeId');

    const [token, setToken] = useState<string | null>(null);
    const [liveKitUrl, setLiveKitUrl] = useState<string>('');
    const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [showProducts, setShowProducts] = useState(false);

    // 1. Fetch store's products for pinning
    const { data: productsData } = useQuery({
        queryKey: ['store-products', storeId],
        queryFn: () => storeApi.getStoreProducts(storeId!),
        enabled: !!storeId,
    });
    const products = productsData?.data?.data?.items || [];

    // 2. Fetch or create stream
    const createStreamMutation = useMutation({
        mutationFn: (data: any) => streamApi.createStream(data),
        onSuccess: (res) => {
            const streamId = res.data.data.stream.id;
            setActiveStreamId(streamId);
            fetchToken(streamId);
        }
    });

    const fetchToken = async (streamId: string) => {
        try {
            const res = await streamApi.getToken(streamId);
            setToken(res.data.data.token);
            setLiveKitUrl(res.data.data.liveKitUrl);
        } catch (err) {
            console.error('Failed to fetch LiveKit token', err);
        }
    };

    const handleStartLive = async () => {
        if (!storeId) return;

        createStreamMutation.mutate({
            storeId,
            title: `Live Shopping from ${new Date().toLocaleDateString()}`,
            description: 'Join us for a live demo of our latest products!',
            type: 'live',
        });
    };

    const handleEndStream = async () => {
        if (!activeStreamId) return;
        try {
            await streamApi.endStream(activeStreamId);
            setIsLive(false);
            setToken(null);
            router.push('/dashboard');
        } catch (err) {
            console.error('Failed to end stream', err);
        }
    };

    const pinProductMutation = useMutation({
        mutationFn: (productId: string) =>
            streamApi.pinProduct(activeStreamId!, { productId }),
    });

    if (!token) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="glass rounded-[3rem] p-12 max-w-xl w-full text-center border-white/5">
                    <div className="w-24 h-24 rounded-3xl bg-neon-pink/10 flex items-center justify-center mx-auto mb-8 border border-neon-pink/20">
                        <Video className="w-12 h-12 text-neon-pink" />
                    </div>
                    <h1 className="font-display font-bold text-4xl mb-4">Start Broadcasting</h1>
                    <p className="text-white/60 mb-10 text-lg">
                        Ready to showcase your products to the world? Set up your camera and start selling in real-time.
                    </p>

                    <button
                        onClick={handleStartLive}
                        disabled={createStreamMutation.isPending}
                        className="btn-primary w-full py-5 text-xl font-bold flex items-center justify-center gap-3 group"
                    >
                        {createStreamMutation.isPending ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black" />
                        ) : (
                            <>
                                <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                                Initialize Broadcast
                            </>
                        )}
                    </button>

                    <Link href="/dashboard" className="block mt-6 text-white/40 hover:text-white transition-colors">
                        Go back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] bg-void flex flex-col lg:flex-row overflow-hidden">
            {/* Broadcaster Main View */}
            <div className="flex-1 relative bg-black flex flex-col">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={token}
                    serverUrl={liveKitUrl}
                    onConnected={() => setIsLive(true)}
                    onDisconnected={() => setIsLive(false)}
                    connect={true}
                    className="flex-1 flex flex-col"
                >
                    <div className="flex-1 relative">
                        <VideoConference
                            className="h-full"
                        />

                        {/* Overlay Controls */}
                        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-500 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/20">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                    <span className="font-black text-xs tracking-widest">LIVE</span>
                                </div>
                                <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                                    <Users className="w-4 h-4 text-neon-cyan" />
                                    <span className="font-bold text-xs">128 Viewers</span>
                                </div>
                            </div>

                            <button
                                onClick={handleEndStream}
                                className="bg-white/10 hover:bg-red-500/80 px-6 py-2.5 rounded-full flex items-center gap-2 border border-white/20 transition-all font-bold text-sm backdrop-blur-md"
                            >
                                <StopCircle className="w-5 h-5" />
                                End Broadcast
                            </button>
                        </div>
                    </div>
                </LiveKitRoom>
            </div>

            {/* Merchant Control Sidebar */}
            <div className="w-full lg:w-[400px] border-l border-white/5 flex flex-col glass backdrop-blur-3xl overflow-hidden relative">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="font-display font-bold text-xl flex items-center gap-3">
                        <Settings className="w-5 h-5 text-neon-pink" />
                        Merchant Console
                    </h2>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setShowProducts(false)}
                            className={`p-2 rounded-lg transition-colors ${!showProducts ? 'bg-neon-pink/20 text-neon-pink' : 'text-white/40 hover:text-white'}`}
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowProducts(true)}
                            className={`p-2 rounded-lg transition-colors ${showProducts ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-white/40 hover:text-white'}`}
                        >
                            <Tag className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                    {showProducts ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg text-white/90">Your Products</h3>
                                <span className="text-xs text-white/30 uppercase tracking-widest font-black">{products.length} Items</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {products.map((product: any) => (
                                    <div key={product.id} className="group relative glass rounded-2xl p-4 border-white/5 hover:border-neon-cyan/30 transition-all bg-white/5">
                                        <div className="flex gap-4">
                                            <img
                                                src={product.images?.[0] || '/placeholder.png'}
                                                className="w-16 h-16 rounded-xl object-cover shadow-2xl"
                                                alt=""
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm truncate group-hover:text-neon-cyan transition-colors">{product.name}</h4>
                                                <p className="text-neon-cyan font-black text-base mt-1">${Number(product.price).toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => pinProductMutation.mutate(product.id)}
                                                disabled={pinProductMutation.isPending}
                                                className="self-center p-3 rounded-xl bg-neon-cyan text-black hover:scale-110 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                                <MessageSquare className="w-12 h-12 mb-4" />
                                <p className="text-sm font-medium">Chat is live for customers</p>
                                <p className="text-[10px] uppercase tracking-widest mt-1">Real-time engagement active</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gradient-to-t from-black/40 to-transparent">
                    <div className="glass rounded-2xl p-4 border-neon-pink/20 bg-neon-pink/5">
                        <div className="flex items-center gap-3 mb-2">
                            <Tag className="w-4 h-4 text-neon-pink" />
                            <span className="text-[10px] font-black uppercase tracking-[.2em] text-neon-pink">Tip</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Interact with your customers! Pinned products see 4x more conversions during live demos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
