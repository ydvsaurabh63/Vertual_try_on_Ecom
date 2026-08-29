import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, ArrowUpRight, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#08080a] border-t border-white/10 text-white/70 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-serif tracking-[0.25em] font-bold text-white uppercase">
                STORE
              </span>
            </Link>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              Contemporary luxury fashion platform dedicated to timeless craftsmanship, sustainable fabrics, and minimalist aesthetic design.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#c87d4a] text-white/70 hover:text-white flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#c87d4a] text-white/70 hover:text-white flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#c87d4a] text-white/70 hover:text-white flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2 text-white/60">
              <li><Link to="/shop?category=men" className="hover:text-[#c87d4a] transition-colors">Men's Wardrobe</Link></li>
              <li><Link to="/shop?category=women" className="hover:text-[#c87d4a] transition-colors">Women's Couture</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-[#c87d4a] transition-colors">Fine Accessories</Link></li>
              <li><Link to="/shop?category=shoes" className="hover:text-[#c87d4a] transition-colors">Leather Footwear</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-[#c87d4a] transition-colors">New Arrivals</Link></li>
              <li><Link to="/sale" className="hover:text-[#c87d4a] transition-colors text-[#c87d4a]">Sale Collection</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-white/60">
              <li><Link to="/faq" className="hover:text-[#c87d4a] transition-colors">FAQ & Help Center</Link></li>
              <li><Link to="/shipping" className="hover:text-[#c87d4a] transition-colors">Shipping Information</Link></li>
              <li><Link to="/returns" className="hover:text-[#c87d4a] transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/orders" className="hover:text-[#c87d4a] transition-colors">Order Tracking</Link></li>
              <li><Link to="/contact" className="hover:text-[#c87d4a] transition-colors">Contact Concierge</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Corporate */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-white/60">
              <li><Link to="/about" className="hover:text-[#c87d4a] transition-colors">About STORE</Link></li>
              <li><Link to="/privacy" className="hover:text-[#c87d4a] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#c87d4a] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & payment icons */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40">
          <p>© 2026 STORE | Premium Fashion Platform. All rights reserved by saurabh singh yadav.</p>
          <div className="flex items-center space-x-3 text-xs">
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-white/70">VISA</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-white/70">MASTERCARD</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-white/70">AMEX</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-white/70">APPLE PAY</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
