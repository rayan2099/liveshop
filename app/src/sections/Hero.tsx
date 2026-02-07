import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, FileText } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const product = productRef.current;
    const cta = ctaRef.current;
    const bg = bgRef.current;

    if (!section || !headline || !product || !cta || !bg) return;

    const ctx = gsap.context(() => {
      // Initial entrance animations
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(bg, 
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.2 }
      )
      .fromTo(headline.querySelectorAll('.headline-line'),
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.8, stagger: 0.15 },
        '-=0.8'
      )
      .fromTo(product,
        { z: -500, rotateY: 45, opacity: 0 },
        { z: 0, rotateY: -15, opacity: 1, duration: 1.4, ease: 'elastic.out(1, 0.75)' },
        '-=0.6'
      )
      .fromTo(cta.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        '-=0.8'
      );

      // Floating animation for product
      gsap.to(product, {
        y: -10,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });

      // Scroll-based animations
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          scrub: 0.5,
          pin: true,
        }
      });

      scrollTl.to(product, {
        rotateY: 25,
        rotateX: -5,
        y: -50,
        ease: 'none'
      })
      .to(headline, {
        y: -100,
        opacity: 0.3,
        ease: 'none'
      }, 0)
      .to(bg, {
        scale: 1.15,
        ease: 'none'
      }, 0);

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Background */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0 }}
      >
        <img 
          src="/hero-bg.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-void/40 to-void" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-void/50 to-void" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(11,11,15,0.8) 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left: Text Content */}
        <div className="flex-1 text-center lg:text-left">
          <span className="eyebrow mb-4 block">Live Retail Platform</span>
          
          <div ref={headlineRef} className="overflow-hidden mb-6">
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl uppercase tracking-tight leading-none">
              <span className="headline-line block overflow-hidden">
                <span className="inline-block">Shop The</span>
              </span>
              <span className="headline-line block overflow-hidden">
                <span className="inline-block text-gradient">Moment</span>
              </span>
            </h1>
          </div>
          
          <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 mb-8">
            Watch live. Tap to buy. Get it delivered in minutes. 
            The future of retail is streaming now.
          </p>
          
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="btn-primary flex items-center justify-center gap-2 group">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Explore the Demo
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              View Documentation
            </button>
          </div>
        </div>

        {/* Right: 3D Product Card */}
        <div className="flex-1 flex justify-center lg:justify-end perspective-1000">
          <div 
            ref={productRef}
            className="relative preserve-3d"
            style={{ opacity: 0 }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-neon-pink/20 blur-[80px] rounded-full scale-75" />
            
            {/* Product image */}
            <img 
              src="/product-earbuds.png" 
              alt="Featured Product"
              className="relative w-64 sm:w-80 lg:w-96 h-auto drop-shadow-2xl"
            />
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 glass px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse" />
                <span className="text-sm font-mono text-white/80">LIVE NOW</span>
              </div>
            </div>
            
            {/* Price tag */}
            <div className="absolute -top-4 -right-4 glass-strong px-4 py-2 rounded-xl">
              <span className="text-lg font-bold text-neon-cyan">$149</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-void to-transparent z-[5]" />
    </section>
  );
}
