'use client';

import { useQuery } from '@tanstack/react-query';
import { storeApi, streamApi } from '@/lib/api';
import { Video, Plus, Calendar, Users, Eye, Play, StopCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function StreamsPage() {
    // Fetch store ID
    const { data: storesData } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.getMyStores(),
    });
    const storeId = storesData?.data?.items?.[0]?.id;

    const { data: streamsData, isLoading } = useQuery({
        queryKey: ['store-streams', storeId],
        queryFn: () => storeApi.getStoreStreams(storeId!, { limit: 50 }),
        enabled: !!storeId,
    });

    const streams = streamsData?.data?.items || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-bold text-3xl">Live Streams</h1>
                    <p className="text-white/60">Manage your live sessions and scheduled broadcasts</p>
                </div>
                <Link href={`/broadcast?storeId=${storeId}`} className="btn-primary flex items-center gap-2 self-start">
                    <Plus className="w-5 h-5" />
                    Go Live Now
                </Link>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                            <div className="w-full h-48 bg-white/5 rounded-xl mb-4" />
                            <div className="w-2/3 h-6 bg-white/10 rounded mb-2" />
                            <div className="w-1/2 h-4 bg-white/5 rounded" />
                        </div>
                    ))
                ) : streams.length === 0 ? (
                    <div className="lg:col-span-2 glass rounded-2xl p-12 text-center text-white/50">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No streams yet</p>
                        <p className="mb-6">Ready to showcase your products live?</p>
                        <Link href={`/broadcast?storeId=${storeId}`} className="btn-primary">
                            Start Your First Stream
                        </Link>
                    </div>
                ) : (
                    streams.map((stream: any) => (
                        <div key={stream.id} className="glass rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
                            <div className="relative aspect-video bg-black">
                                <img
                                    src={stream.thumbnailUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'}
                                    alt={stream.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute top-4 left-4">
                                    {stream.status === 'live' ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                            Live
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white/80 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {stream.status}
                                        </span>
                                    )}
                                </div>
                                {stream.status === 'live' && (
                                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs text-white font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                                            <Eye className="w-3.5 h-3.5" />
                                            {stream.viewerCount}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2 group-hover:text-neon-pink transition-colors">{stream.title}</h3>
                                <p className="text-sm text-white/50 line-clamp-2 mb-6">{stream.description}</p>

                                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Date</span>
                                            <span className="text-sm text-white/80 font-medium">
                                                {format(new Date(stream.scheduledAt || stream.createdAt), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        {stream.status === 'ended' && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Peak</span>
                                                <span className="text-sm text-white/80 font-medium">{stream.peakViewers || 0} viewers</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={(stream.status === 'live' ? `/broadcast/${stream.id}` : `/dashboard/streams/${stream.id}`) as any}
                                        className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <Play className="w-5 h-5 text-neon-pink" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
