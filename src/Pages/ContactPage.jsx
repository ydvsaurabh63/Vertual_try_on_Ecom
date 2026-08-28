import React, { useState } from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your message has been sent to our VIP Concierge team!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumbs items={[{ label: 'Contact Concierge' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">24/7 VIP CONCIERGE</span>
          <h1 className="text-4xl font-serif font-bold text-white">We're Here to Assist You</h1>
          <p className="text-sm text-white/70 font-light leading-relaxed">
            Have a question regarding styling recommendations, order tracking, or bespoke custom tailoring? Our personal shopping advisors are at your service.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121216] border border-white/10 text-xs">
              <Mail className="w-5 h-5 text-[#c87d4a]" />
              <div>
                <p className="font-bold text-white">Email Concierge</p>
                <p className="text-white/50">concierge@store-fashion.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121216] border border-white/10 text-xs">
              <Phone className="w-5 h-5 text-[#c87d4a]" />
              <div>
                <p className="font-bold text-white">Direct Advisory Phone</p>
                <p className="text-white/50">+1 (800) 888-LUXURY (Mon-Sun 24/7)</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121216] border border-white/10 text-xs">
              <MapPin className="w-5 h-5 text-[#c87d4a]" />
              <div>
                <p className="font-bold text-white">Headquarters Atelier</p>
                <p className="text-white/50">Via Montenapoleone 12, Milan, Italy</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">Send Direct Inquiry</h3>
          <input
            type="text"
            required
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
          />
          <input
            type="email"
            required
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
          />
          <input
            type="text"
            placeholder="Subject (e.g. Order inquiry, Styling consultation)"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
          />
          <textarea
            rows="5"
            required
            placeholder="How can our personal concierge assist you?"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] text-white text-xs font-bold uppercase tracking-wider"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
