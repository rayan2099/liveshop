import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Pin, ShoppingBag, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LiveRoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leftPhoneRef = useRef<HTMLDivElement>(null);
  const rightPhoneRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<SVGPathElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const leftPhone = leftPhoneRef.current;
    const rightPhone = rightPhoneRef.current;
    const beam = beamRef.current;
    const features = featuresRef.current;

    if (!section || !heading || !leftPhone || !rightPhone || !beam || !features) return;

    const ctx = gsap.context(() => {
      // Entrance timeline
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      entranceTl.fromTo(heading,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      )
      .fromTo(leftPhone,
        { x: '-100%', rotateY: 45, opacity: 0 },
        { x: '0%', rotateY: 15, opacity: 1, duration: 1, ease: 'expo.out' },
        '-=0.3'
      )
      .fromTo(rightPhone,
        { x: '100%', rotateY: -45, opacity: 0 },
        { x: '0%', rotateY: -15, opacity: 1, duration: 1, ease: 'expo.out' },
        '-=0.9'
      )
      .fromTo(beam,
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' },
        '-=0.4'
      )
      .fromTo(features.children,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      );

      // Scroll-based pinned animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          scrub: 0.5,
          pin: true,
        }
      });

      scrollTl.to(leftPhone, {
        rotateY: 0,
        ease: 'none'
      })
      .to(rightPhone, {
        rotateY: 0,
        ease: 'none'
      }, 0)
      .to([leftPhone, rightPhone], {
        scale: 1.05,
        ease: 'none'
      }, 0);

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-void"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light to-void" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Heading */}
        <h2 
          ref={headingRef}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-center uppercase tracking-tight mb-16"
          style={{ opacity: 0 }}
        >
          One Live. <span className="text-gradient">Two Worlds.</span>
        </h2>

        {/* Phones container */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 perspective-1000">
          
          {/* Connection beam SVG */}
          <svg 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 pointer-events-none hidden lg:block"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="50%" stopColor="#FF2D8D" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
            </defs>
            <path
              ref={beamRef}
              d="M 100 50 Q 400 20 700 50"
              fill="none"
              stroke="url(#beamGradient)"
              strokeWidth="2"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              className="opacity-60"
            />
            {/* Data packet dots */}
            <circle r="4" fill="#00F0FF" className="animate-pulse">
              <animateMotion dur="3s" repeatCount="indefinite" path="M 100 50 Q 400 20 700 50" />
            </circle>
            <circle r="4" fill="#FF2D8D" className="animate-pulse animation-delay-1000">
              <animateMotion dur="3s" repeatCount="indefinite" begin="1.5s" path="M 700 50 Q 400 80 100 50" />
            </circle>
          </svg>

          {/* Left Phone - Seller View */}
          <div 
            ref={leftPhoneRef}
            className="relative preserve-3d lg:mr-[-40px]"
            style={{ opacity: 0 }}
          >
            <div className="relative w-64 sm:w-72 lg:w-80">
              {/* Phone frame */}
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-card">
                <div className="bg-void rounded-[2.5rem] overflow-hidden">
                  {/* Screen content */}
                  <div className="aspect-[9/19] p-4 flex flex-col">
                    {/* Status bar */}
                    <div className="flex justify-between items-center text-xs text-white/60 mb-4">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-white/60 rounded-sm" />
                        <div className="w-4 h-2 bg-white/60 rounded-sm" />
                      </div>
                    </div>
                    
                    {/* Seller header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Fashion Store</p>
                        <p className="text-xs text-white/50">1.2K viewers</p>
                      </div>
                      <span className="ml-auto px-2 py-1 bg-red-500 text-xs rounded-full animate-pulse">LIVE</span>
                    </div>

                    {/* Go Live button */}
                    <button className="w-full py-3 bg-neon-pink rounded-xl text-sm font-medium mb-4 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Go Live
                    </button>

                    {/* Product list */}
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Products</p>
                    <div className="space-y-2 flex-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg" />
                          <div className="flex-1">
                            <p className="text-xs font-medium">Product {i}</p>
                            <p className="text-xs text-neon-cyan">${49 + i * 20}</p>
                          </div>
                          <Pin className="w-4 h-4 text-white/40" />
                        </div>
                      ))}
                    </div>

                    {/* Analytics */}
                    <div className="mt-4 p-3 bg-white/5 rounded-xl">
                      <p className="text-xs text-white/50 mb-2">Live Analytics</p>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-lg font-bold text-neon-cyan">847</p>
                          <p className="text-xs text-white/40">Views</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-neon-pink">23</p>
                          <p className="text-xs text-white/40">Orders</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">$1.2K</p>
                          <p className="text-xs text-white/40">Revenue</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 glass rounded-full text-xs font-mono uppercase tracking-wider text-neon-cyan">
                  Seller
                </span>
              </div>
            </div>
          </div>

          {/* Right Phone - Buyer View */}
          <div 
            ref={rightPhoneRef}
            className="relative preserve-3d lg:ml-[-40px]"
            style={{ opacity: 0 }}
          >
            <div className="relative w-64 sm:w-72 lg:w-80">
              {/* Phone frame */}
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-card">
                <div className="bg-void rounded-[2.5rem] overflow-hidden">
                  {/* Screen content */}
                  <div className="aspect-[9/19] relative">
                    {/* Video feed background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-cyan-900/50" />
                    
                    {/* Live overlay */}
                    <div className="absolute inset-0 flex flex-col p-4">
                      {/* Status bar */}
                      <div className="flex justify-between items-center text-xs text-white mb-4">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 bg-white rounded-sm" />
                          <div className="w-4 h-2 bg-white rounded-sm" />
                        </div>
                      </div>

                      {/* Top info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-purple-600 border-2 border-white/20" />
                        <div>
                          <p className="text-sm font-medium text-shadow">Fashion Store</p>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            <p className="text-xs text-white/80">1.2K watching</p>
                          </div>
                        </div>
                      </div>

                      {/* Product card overlay */}
                      <div className="mt-auto mb-20">
                        <div className="glass rounded-2xl p-3 mb-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Premium Headphones</p>
                              <p className="text-lg font-bold text-neon-cyan">$149</p>
                              <p className="text-xs text-white/50">Only 3 left!</p>
                            </div>
                          </div>
                          <button className="w-full mt-3 py-2 bg-neon-pink rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Buy Now
                          </button>
                        </div>
                      </div>

                      {/* Bottom actions */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 glass rounded-full px-4 py-2 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-white/50" />
                          <span className="text-sm text-white/50">Say something...</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="w-10 h-10 glass rounded-full flex items-center justify-center">
                            <span className="text-lg">❤️</span>
                          </button>
                          <button className="w-10 h-10 glass rounded-full flex items-center justify-center">
                            <span className="text-lg">🎁</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 glass rounded-full text-xs font-mono uppercase tracking-wider text-neon-pink">
                  Buyer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature points */}
        <div 
          ref={featuresRef}
          className="mt-24 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          {[
            { icon: Pin, text: 'Real-time product pinning' },
            { icon: ShoppingBag, text: 'Instant checkout overlay' },
            { icon: MessageCircle, text: 'Live chat & reactions' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 glass px-5 py-3 rounded-xl">
              <feature.icon className="w-5 h-5 text-neon-cyan" />
              <span className="text-sm text-white/80">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
