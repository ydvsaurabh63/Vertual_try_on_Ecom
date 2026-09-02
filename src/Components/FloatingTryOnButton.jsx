import React from 'react';
import { Shirt, X } from 'lucide-react';
import { useTryOnStore } from '../store/useTryOnStore';

const FloatingTryOnButton = () => {
  const { isOpen, openTryOn, closeTryOn } = useTryOnStore();

  if (isOpen) return null;

  const handleToggle = () => {
    openTryOn(null);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-bounce-subtle">
      <button
        onClick={handleToggle}
        className="group flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#18181c] hover:bg-[#222228] border-2 border-[#c87d4a] text-white shadow-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
        title="Virtual Fitting Room Studio"
      >
        <div className="w-8 h-8 rounded-full bg-[#c87d4a] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
          {isOpen ? <X className="w-4 h-4" /> : <Shirt className="w-4 h-4" />}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-black tracking-wider uppercase text-white">
            {isOpen ? 'Close Try On' : 'Try it on'}
          </span>
          <span className="text-[10px] text-[#c87d4a] font-medium">Virtual Fitting Room</span>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-[#c87d4a] animate-pulse ml-1" />
      </button>
    </div>
  );
};

export default FloatingTryOnButton;
