'use client';

import Link from 'next/link';
import { Play, ShoppingBag, Truck, Store, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-void">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
                <span className="font-display font-bold text-black text-sm">L</span>
              </div>
              <span className="font-display font-bold text-xl">LiveShop</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <span className="eyebrow mb-4 block">Live Retail Platform</span>
          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight mb-6">
            Shop The <span className="text-gradient">Moment</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Watch live streams from your favorite stores. Tap to buy. Get it delivered in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/streams" className="btn-primary flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Watch Live Streams
            </Link>
            <Link href="/stores" className="btn-secondary flex items-center justify-center gap-2">
              Browse Stores
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center mb-16">
            Three Apps. One Platform.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer */}
            <div className="glass rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-neon-pink/20 flex items-center justify-center mb-6">
                <ShoppingBag className="w-7 h-7 text-neon-pink" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">For Customers</h3>
              <p className="text-white/60 mb-6">
                Discover live streams from nearby stores. Chat with hosts, request products, and buy instantly without leaving the stream.
              </p>
              <Link href="/register?role=customer" className="text-neon-pink hover:underline">
                Join as Customer →
              </Link>
            </div>

            {/* Store */}
            <div className="glass rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">For Stores</h3>
              <p className="text-white/60 mb-6">
                Go live from your phone, showcase products in real-time, see who bought what, and manage orders effortlessly.
              </p>
              <Link href="/register?role=store_owner" className="text-white hover:underline">
                Start Selling →
              </Link>
            </div>

            {/* Driver */}
            <div className="glass rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mb-6">
                <Truck className="w-7 h-7 text-neon-cyan" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">For Drivers</h3>
              <p className="text-white/60 mb-6">
                Accept nearby delivery jobs, pick up from stores, deliver to customers, and get paid through the app.
              </p>
              <Link href="/register?role=driver" className="text-neon-cyan hover:underline">
                Become a Driver →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display font-bold text-3xl">Live Now</h2>
            <Link href="/streams" className="text-neon-pink hover:underline">
              View All →
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} href={`/streams/${i}`} className="group">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50 mb-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 rounded-full text-xs font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur rounded-lg text-xs">
                    {100 + i * 50} viewers
                  </div>
                </div>
                <h3 className="font-medium group-hover:text-neon-pink transition-colors">Summer Collection Launch #{i}</h3>
                <p className="text-sm text-white/50">Fashion Boutique</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
                <span className="font-display font-bold text-black text-sm">L</span>
              </div>
              <span className="font-display font-bold text-xl">LiveShop</span>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 LiveShop Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
