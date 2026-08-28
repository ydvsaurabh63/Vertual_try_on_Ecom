import React, { useState } from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does the Virtual Try-On Fitting Room work?',
      a: 'Click on the "Try it on" button on any product card or hero section. Select a male or female mannequin avatar model, choose your desired size and color, and instantly preview the garment drape live in 3D studio settings.'
    },
    {
      q: 'What shipping options are available?',
      a: 'We offer complimentary express shipping worldwide on all orders above $300. Orders are dispatched via DHL Express / FedEx International within 24 hours from our Milan logistics hub.'
    },
    {
      q: 'What is your return & exchange policy?',
      a: 'STORE provides a 30-day complimentary return window. Items must be unworn with original luxury security tags attached. Pre-paid return shipping labels are included in your order package.'
    },
    {
      q: 'Are all products 100% authentic?',
      a: 'Yes, every garment is handcrafted using certified 100% Mongolian Cashmere, Italian Worsted Wool, or Mulberry Silk, sourced directly from verified European ateliers.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'FAQ & Help Center' }]} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-white">Frequently Asked Questions</h1>
        <p className="text-xs text-white/50">Find quick answers to common questions about orders, fitting, and shipping.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="rounded-2xl bg-[#121216] border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-[#c87d4a] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#c87d4a] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-white/70 font-light leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQPage;
