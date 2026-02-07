import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles, Building2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    id: 'saas',
    name: 'SaaS Subscription',
    description: 'Monthly platform fee + revenue share',
    price: '$299',
    period: '/month',
    icon: Sparkles,
    color: 'neon-pink',
    features: [
      'Unlimited live streams',
      'Real-time analytics dashboard',
      '24/7 priority support',
      'Up to 10 store locations',
      'Standard delivery integration',
      'Basic customization',
    ],
    cta: 'Start Free Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise License',
    description: 'White-label solution for large networks',
    price: 'Custom',
    period: '',
    icon: Building2,
    color: 'neon-cyan',
    features: [
      'Full white-label branding',
      'Unlimited store locations',
      'Dedicated infrastructure',
      'SLA guarantee (99.9%)',
      'Advanced analytics & AI insights',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    highlighted: true
  }
];

// Floating coin component
const FloatingCoins = () => {
  const coins = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 8,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    color: Math.random() > 0.5 ? '#FF2D8D' : '#00F0FF'
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute rounded-full animate-coin-float"
          style={{
            width: coin.size,
            height: coin.size,
            left: `${coin.left}%`,
            bottom: '-20px',
            backgroundColor: coin.color,
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default function Monetization() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

    const cardElements = cards.querySelectorAll('.pricing-card');

    const ctx = gsap.context(() => {
      // Heading entrance
      gsap.fromTo(heading,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards 3D flip entrance
      cardElements.forEach((card, i) => {
        gsap.fromTo(card,
          { rotateX: 90, opacity: 0, transformOrigin: 'center top' },
          {
            rotateX: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.2 + i * 0.15,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: section,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-32 overflow-hidden bg-void"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light to-void" />
      
      {/* Floating coins */}
      <FloatingCoins />

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="eyebrow mb-4 block">Pricing</span>
          <h2 
            ref={headingRef}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight"
            style={{ opacity: 0 }}
          >
            Choose Your <span className="text-gradient">Engine</span>
          </h2>
        </div>

        {/* Pricing cards */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8 perspective-1000"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`pricing-card relative preserve-3d ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
                style={{ opacity: 0 }}
              >
                {/* Highlighted badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1 bg-neon-cyan text-black text-xs font-mono uppercase tracking-wider rounded-full">
                      Recommended
                    </span>
                  </div>
                )}

                <div className={`relative h-full glass ${plan.highlighted ? 'border-neon-cyan/30' : ''} rounded-3xl p-8 overflow-hidden`}>
                  {/* Background glow */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-${plan.color}/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2`} />

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-${plan.color}/20 flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 text-${plan.color}`} />
                  </div>

                  {/* Plan info */}
                  <h3 className="font-display font-bold text-2xl uppercase tracking-tight mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-white/50 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <span className={`text-5xl font-bold text-${plan.color}`}>
                      {plan.price}
                    </span>
                    <span className="text-white/40">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-${plan.color}/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className={`w-3 h-3 text-${plan.color}`} />
                        </div>
                        <span className="text-sm text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button 
                    className={`w-full py-4 rounded-2xl font-medium transition-all duration-300 ${
                      plan.highlighted 
                        ? 'bg-neon-cyan text-black hover:shadow-glow-cyan hover:scale-[1.02]' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-white/40 mt-12">
          All plans include 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
