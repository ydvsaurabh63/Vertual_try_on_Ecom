import React from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import BrandValues from '../Components/BrandValues';
import { Sparkles, Award, ShieldCheck } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="space-y-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs items={[{ label: 'About STORE' }]} />

        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">OUR HERITAGE & VISION</span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Crafting Minimalist Luxury for the Contemporary Era
          </h1>
          <p className="text-base text-white/70 font-light leading-relaxed">
            STORE was founded on the singular principle that true elegance requires no noise. We blend Italian tailoring precision with Mongolian cashmere and Mulberry silks.
          </p>
        </div>

        {/* Editorial Photo Showcase */}
        <div className="relative h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80"
            alt="STORE Atelier Studio"
            className="w-full h-full object-cover filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-transparent flex items-end p-8">
            <div className="text-xs text-white/90">
              <p className="font-bold text-white text-base">STORE Milano Atelier & Design House</p>              <p className="text-white/60">Established 2026 • Certified Sustainable Organic Luxury</p>
            </div>
          </div>
        </div>
      </div>

      <BrandValues />
    </div>
  );
};

export default AboutPage;
