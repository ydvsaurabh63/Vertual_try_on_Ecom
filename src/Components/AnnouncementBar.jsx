import React, { useState } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#121216] border-b border-white/10 text-white/90 text-xs py-2 px-4 relative flex items-center justify-center transition-all">
      <div className="flex items-center gap-2 font-medium tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-[#c87d4a] animate-pulse" />
        <span>COMPLIMENTARY WORLDWIDE SHIPPING ON ORDERS OVER $300</span>
        <span className="hidden sm:inline-block text-white/30">•</span>
        <Link 
          to="/shop?onSaleOnly=true" 
          className="hidden sm:inline-flex items-center gap-1 text-[#c87d4a] hover:underline font-semibold"
        >
          USE CODE <span className="underline decoration-1">WELCOME10</span> FOR 10% OFF
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default AnnouncementBar;
