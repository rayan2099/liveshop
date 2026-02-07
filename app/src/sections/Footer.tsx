import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  Resources: ['Documentation', 'API Reference', 'Guides', 'Support', 'Community'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies', 'Compliance'],
};

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      // Reveal animation
      gsap.fromTo(content.querySelectorAll('.reveal-item'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={sectionRef}
      className="relative w-full bg-void"
    >
      {/* CTA Section */}
      <div className="relative py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-void-light to-void" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-[200px]" />

        <div ref={contentRef} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="reveal-item font-display font-bold text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight mb-6">
            Ready To Go <span className="text-gradient">Live?</span>
          </h2>
          <p className="reveal-item text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Join thousands of stores already transforming their business with live retail.
          </p>
          
          <div className="reveal-item flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
              Request Access
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {/* Logo & info */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
                  <span className="font-display font-bold text-black text-lg">L</span>
                </div>
                <span className="font-display font-bold text-xl">LiveShop</span>
              </div>
              <p className="text-sm text-white/50 mb-6 max-w-xs">
                The future of retail. Live streaming commerce with instant delivery.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <Mail className="w-4 h-4 text-neon-cyan" />
                  <span>hello@liveshop.io</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <Phone className="w-4 h-4 text-neon-cyan" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <MapPin className="w-4 h-4 text-neon-cyan" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © 2026 LiveShop Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social) => (
                <a 
                  key={social}
                  href="#"
                  className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
