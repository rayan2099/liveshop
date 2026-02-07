import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import LiveRoom from './sections/LiveRoom';
import ThreeFlows from './sections/ThreeFlows';
import Monetization from './sections/Monetization';
import TechStack from './sections/TechStack';
import Footer from './sections/Footer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Configure ScrollTrigger defaults
    ScrollTrigger.defaults({
      toggleActions: 'play none none reverse',
    });

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-void text-white overflow-x-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main content */}
      <main>
        <Hero />
        <div id="features">
          <LiveRoom />
        </div>
        <div id="flows">
          <ThreeFlows />
        </div>
        <div id="pricing">
          <Monetization />
        </div>
        <div id="tech">
          <TechStack />
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default App;
