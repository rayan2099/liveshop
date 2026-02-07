'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Star, MapPin } from 'lucide-react';
import { storeApi } from '@/lib/api';

export default function StoresPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['stores', search],
    queryFn: () => storeApi.getStores({ search }),
  });

  const stores = data?.data?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-display font-bold text-3xl">Stores</h1>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores..."
            className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-white/5 rounded-2xl mb-3" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/60 text-lg">No stores found</p>
          <p className="text-white/40">Try a different search term</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stores.map((store: any) => (
            <Link key={store.id} href={`/stores/${store.slug}`} className="group">
              <div className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
                <div className="aspect-square bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className="w-24 h-24 rounded-xl object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center">
                      <span className="font-display font-bold text-3xl">{store.name[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium group-hover:text-neon-pink transition-colors">{store.name}</h3>
                  <p className="text-sm text-white/50 line-clamp-1 mb-2">{store.description || store.category}</p>
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{store.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{store.address?.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
