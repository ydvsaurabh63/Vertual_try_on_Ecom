import React from 'react';
import { Truck, RefreshCw, ShieldCheck, Headphones, Gem, Award } from 'lucide-react';

const BrandValues = () => {
  const values = [
    {
      icon: Truck,
      title: 'Complimentary Express Shipping',
      desc: 'Free worldwide express delivery on all orders over $300.'
    },
    {
      icon: RefreshCw,
      title: '30-Day Hassle-Free Returns',
      desc: 'Simple, transparent complimentary returns with pre-paid labels.'
    },
    {
      icon: ShieldCheck,
      title: 'Guaranteed Authentic Luxury',
      desc: '100% certified authentic materials and craftsmanship.'
    },
    {
      icon: Headphones,
      title: 'Dedicated Concierge 24/7',
      desc: 'Personal styling consultation and round-the-clock support.'
    }
  ];

  return (
    <section className="py-16 bg-[#0b0b0e] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-[#121216] border border-white/5 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#c87d4a]/10 border border-[#c87d4a]/30 flex items-center justify-center text-[#c87d4a]">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide">{item.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandValues;
