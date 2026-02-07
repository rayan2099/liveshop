'use client';

import { useState, useEffect } from 'react';
import { streamApi } from '@/lib/api';
import { Users, Play, Clock } from 'lucide-react';
import Link from 'next/link';

export default function StreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      const response = await streamApi.getStreams({ page: 1, limit: 20 });
      setStreams(response.data.data.streams || []);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl mb-2">Live Streams</h1>
          <p className="text-white/60">Watch and shop from live broadcasts</p>
        </div>

        {streams.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-white/40" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No live streams right now</h2>
            <p className="text-white/60 mb-6">Check back soon for live shopping sessions!</p>
            <Link href="/" className="btn-primary inline-block">
              Go Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <Link
                key={stream.id}
                href={`/watch/${stream.id}`}
                className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform group"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20">
                  {stream.thumbnailUrl ? (
                    <img
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-16 h-16 text-white/40" />
                    </div>
                  )}

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="font-semibold text-sm">LIVE</span>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 glass rounded-full">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold text-sm">{stream.viewerCount || 0}</span>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-all">
                      <Play className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={stream.store?.logoUrl || '/placeholder.png'}
                      alt={stream.store?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate mb-1">{stream.title}</h3>
                      <p className="text-sm text-neon-cyan truncate">{stream.store?.name}</p>
                    </div>
                  </div>

                  {stream.description && (
                    <p className="text-sm text-white/60 line-clamp-2">{stream.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
