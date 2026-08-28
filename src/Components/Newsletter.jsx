import React, { useState } from 'react';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to STORE Privé VIP updates!');
    setEmail('');
  };

  return (
    <section className="relative py-20 bg-[#121216] border-t border-white/10 overflow-hidden">
      
      {/* Soft Ambient Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#c87d4a] rounded-full filter blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#d4af37] rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-[#c87d4a]" />
          <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
            STORE VIP INSIDER
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Join the Privé Club & Enjoy 10% Off
        </h2>

        <p className="text-sm text-white/60 max-w-lg mx-auto font-light leading-relaxed">
          Be first to receive invitations to seasonal private sales, new capsule drops, and bespoke styling advice.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a] transition-all"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c87d4a]/20 transition-all"
          >
            <span>Subscribe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-[10px] text-white/30 pt-2">
          By subscribing, you agree to our Privacy Policy and Terms of Service. Unsubscribe anytime.
        </p>

      </div>
    </section>
  );
};

export default Newsletter;
