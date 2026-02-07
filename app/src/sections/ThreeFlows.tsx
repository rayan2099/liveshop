import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Store, Bike } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const personas = [
  {
    id: 'customer',
    title: 'THE CUSTOMER',
    description: 'Discover, chat, and buy without leaving the stream.',
    image: '/customer-card.jpg',
    icon: User,
    color: 'neon-pink',
    stats: [
      { label: 'Active Users', value: '2.4M+' },
      { label: 'Avg. Session', value: '18 min' },
    ]
  },
  {
    id: 'store',
    title: 'THE STORE',
    description: 'Pin products, see orders in real-time, and hand off in seconds.',
    image: '/store-card.jpg',
    icon: Store,
    color: 'white',
    stats: [
      { label: 'Stores Live', value: '15K+' },
      { label: 'Conversion', value: '12%' },
    ]
  },
  {
    id: 'driver',
    title: 'THE DRIVER',
    description: 'Accept jobs, navigate, and earn—all in one tap.',
    image: '/driver-card.jpg',
    icon: Bike,
    color: 'neon-cyan',
    stats: [
      { label: 'Drivers', value: '50K+' },
      { label: 'Avg. Delivery', value: '22 min' },
    ]
  }
];

export default function ThreeFlows() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

    const cardElements = cards.querySelectorAll('.persona-card');

    const ctx = gsap.context(() => {
      // Heading entrance
      gsap.fromTo(heading,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards fan-out animation on scroll
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          scrub: 0.5,
          pin: true,
        }
      });

      // Initial stacked state
      gsap.set(cardElements[0], { x: -100, rotateY: 25, rotateZ: -10, zIndex: 2 });
      gsap.set(cardElements[1], { x: 0, rotateY: 0, rotateZ: 0, zIndex: 3, scale: 1.05 });
      gsap.set(cardElements[2], { x: 100, rotateY: -25, rotateZ: 10, zIndex: 2 });

      // Fan out on scroll
      scrollTl.to(cardElements[0], {
        x: -320,
        rotateY: 5,
        rotateZ: -2,
        ease: 'none'
      }, 0)
      .to(cardElements[1], {
        y: -20,
        scale: 1.1,
        ease: 'none'
      }, 0)
      .to(cardElements[2], {
        x: 320,
        rotateY: -5,
        rotateZ: 2,
        ease: 'none'
      }, 0);

      // Hover effects
      cardElements.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: card === cardElements[1] ? 1.1 : 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-void"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light to-void" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Heading */}
        <h2 
          ref={headingRef}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-center uppercase tracking-tight mb-20"
          style={{ opacity: 0 }}
        >
          Built For <span className="text-gradient">Every Player</span>
        </h2>

        {/* Cards container */}
        <div 
          ref={cardsRef}
          className="relative flex items-center justify-center perspective-1000 min-h-[500px]"
        >
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.id}
                className="persona-card absolute w-72 sm:w-80 preserve-3d cursor-pointer"
                style={{ 
                  zIndex: index === 1 ? 3 : 2,
                }}
              >
                <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-card">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={persona.image} 
                      alt={persona.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
                    
                    {/* Icon badge */}
                    <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl bg-${persona.color}/20 backdrop-blur-xl flex items-center justify-center border border-${persona.color}/30`}>
                      <Icon className={`w-5 h-5 text-${persona.color}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display font-bold text-xl uppercase tracking-tight mb-2">
                      {persona.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-6">
                      {persona.description}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6">
                      {persona.stats.map((stat, i) => (
                        <div key={i}>
                          <p className={`text-2xl font-bold text-${persona.color === 'white' ? 'white' : persona.color}`}>
                            {stat.value}
                          </p>
                          <p className="text-xs text-white/40">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-${persona.color}/10 to-transparent pointer-events-none`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom indicator */}
        <div className="mt-16 flex justify-center gap-2">
          {personas.map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-neon-pink' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
