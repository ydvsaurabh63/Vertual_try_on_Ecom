import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';
import FilterSidebar from './FilterSidebar';

const MobileFilterDrawer = () => {
  const { isMobileFilterOpen, closeMobileFilter, resetFilters } = useFilterStore();

  if (!isMobileFilterOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
        onClick={closeMobileFilter}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs bg-[#121216] border-r border-white/10 text-white shadow-2xl flex flex-col justify-between p-4 overflow-y-auto">
          
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <h3 className="text-base font-bold uppercase tracking-wider">Refine Products</h3>
            <button
              onClick={closeMobileFilter}
              className="p-2 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 pr-1">
            <FilterSidebar isDrawer={true} />
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 pb-safe">
            <button
              onClick={closeMobileFilter}
              className="w-full py-3 rounded-xl bg-[#c87d4a] text-white font-semibold text-xs tracking-wider uppercase"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;
