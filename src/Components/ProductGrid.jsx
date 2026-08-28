import React from 'react';
import ProductCard from './ProductCard';
import { PackageX, RotateCcw } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';

const ProductGrid = ({ products, isLoading = false }) => {
  const resetFilters = useFilterStore((state) => state.resetFilters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="rounded-2xl bg-[#121216] border border-white/5 p-4 space-y-4 animate-pulse">
            <div className="aspect-[3/4] w-full bg-white/5 rounded-xl" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 rounded-3xl bg-[#121216] border border-white/10 p-8">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30">
          <PackageX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No products found</h3>
        <p className="text-sm text-white/50 max-w-sm">
          We couldn't find any products matching your current filters. Try resetting your criteria or selecting another category.
        </p>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs font-semibold uppercase tracking-wider transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
