import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[88vh] flex items-center bg-[#0b0b0e] overflow-hidden">
      
      {/* Background Editorial Image & Ambient Lighting Overlay matching reference */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=2000&q=90"
          alt="Elevate Your Style - Premium Collection"
          className="w-full h-full object-cover object-right md:object-center opacity-65 scale-105 transition-transform duration-1000"
        />
        {/* Soft dark gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0e] via-[#0b0b0e]/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-[#0b0b0e]/40" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl space-y-6">
          
          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#c87d4a]" />
            <span className="text-xs font-semibold tracking-[0.3em] text-white/80 uppercase">
              NEW COLLECTION 2026
            </span>
          </div>

          {/* Main Title matching reference website exact styling */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-sans font-extrabold tracking-tight text-white leading-[1.05]">
            Elevate <br />
            <span className="font-light italic text-white/90">Your Style</span>
          </h1>

          {/* Supporting Subtext */}
          <p className="text-base sm:text-lg text-white/70 max-w-lg font-light leading-relaxed">
            Timeless pieces, hand-picked for the modern gentleman & contemporary wardrobe. Premium labels, distinctive style.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white font-medium text-sm tracking-wide shadow-lg shadow-[#c87d4a]/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/new-arrivals"
              className="inline-flex items-center px-8 py-4 rounded-full bg-white/5 hover:bg-white/15 border border-white/20 text-white font-medium text-sm tracking-wide backdrop-blur-md transition-all"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
