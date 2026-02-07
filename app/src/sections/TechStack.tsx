import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const technologies = [
  { name: 'React', x: 10, y: 30 },
  { name: 'Node.js', x: 25, y: 60 },
  { name: 'WebRTC', x: 45, y: 25 },
  { name: 'GraphQL', x: 60, y: 55 },
  { name: 'AWS', x: 75, y: 35 },
  { name: 'Stripe', x: 90, y: 65 },
];

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const path = pathRef.current;
    const icons = iconsRef.current;

    if (!section || !heading || !path || !icons) return;

    const iconElements = icons.querySelectorAll('.tech-icon');

    const ctx = gsap.context(() => {
      // Heading entrance
      gsap.fromTo(heading,
        { y: 30, opacity: 0 },
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

      // Path draw animation
      const pathLength = path.getTotalLength();
      gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'top 20%',
          scrub: 1,
        }
      });

      // Icons pop in
      iconElements.forEach((icon, i) => {
        gsap.fromTo(icon,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            delay: 0.3 + i * 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-20" style={{ opacity: 0 }}>
          <span className="eyebrow mb-4 block">Technology</span>
          <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight mb-4">
            Powered By <span className="text-gradient">Modern Stack</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            React, Node.js, WebRTC, and GraphQL. Built for scale, designed for speed.
          </p>
        </div>

        {/* Data river visualization */}
        <div className="relative h-64 sm:h-80">
          {/* SVG Path */}
          <svg 
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#FF2D8D" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* Background path */}
            <path
              d="M 0 150 Q 200 80 400 150 T 800 150 T 1000 150"
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="40"
              strokeLinecap="round"
              className="opacity-30"
            />
            
            {/* Animated path */}
            <path
              ref={pathRef}
              d="M 0 150 Q 200 80 400 150 T 800 150 T 1000 150"
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Data packets */}
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} r="6" fill="#00F0FF" className="animate-pulse">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  begin={`${i}s`}
                  path="M 0 150 Q 200 80 400 150 T 800 150 T 1000 150"
                />
              </circle>
            ))}
          </svg>

          {/* Tech icons */}
          <div ref={iconsRef} className="absolute inset-0">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="tech-icon absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${tech.x}%`,
                  top: `${tech.y}%`,
                  opacity: 0
                }}
              >
                <div className="relative group">
                  {/* Glow */}
                  <div className="absolute inset-0 bg-neon-cyan/30 blur-xl rounded-full scale-150 group-hover:scale-200 transition-transform duration-300" />
                  
                  {/* Icon container */}
                  <div className="relative glass-strong px-4 py-2 rounded-xl flex items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/30 to-neon-pink/30 flex items-center justify-center">
                      <span className="text-xs font-bold">{tech.name.slice(0, 2)}</span>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{tech.name}</span>
                  </div>

                  {/* Pulse ring */}
                  <div className="absolute inset-0 border border-neon-cyan/30 rounded-xl animate-ping opacity-30" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Real-time', desc: 'Sub-100ms latency streaming' },
            { title: 'Scalable', desc: 'Handle millions of concurrent viewers' },
            { title: 'Secure', desc: 'End-to-end encryption' },
            { title: 'Reliable', desc: '99.99% uptime SLA' },
            { title: 'Fast', desc: 'Global CDN delivery' },
            { title: 'Flexible', desc: 'API-first architecture' },
          ].map((feature, i) => (
            <div 
              key={i}
              className="glass p-6 rounded-2xl hover:bg-white/10 transition-colors duration-300"
            >
              <h4 className="font-display font-bold text-lg mb-2">{feature.title}</h4>
              <p className="text-sm text-white/50">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
