import React from 'react';
import { Check, RotateCcw, Star } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';
import { CATEGORIES } from '../data/products';

const FilterSidebar = () => {
  const { filters, setCategory, setGender, setPriceRange, toggleSize, toggleColor, setInStockOnly, setOnSaleOnly, resetFilters } = useFilterStore();

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '30', '32', '34', '36', '40', '41', '42', '43'];
  const colors = [
    { name: 'Black', hex: '#111111' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Camel', hex: '#b58356' },
    { name: 'Tan', hex: '#b86830' },
    { name: 'Grey', hex: '#4a4a52' },
    { name: 'Beige', hex: '#ded4c5' },
    { name: 'Olive', hex: '#3d4734' }
  ];

  return (
    <aside className="w-64 flex-shrink-0 space-y-8 p-6 rounded-3xl bg-[#121216] border border-white/10 text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-sm font-bold tracking-wider uppercase">Category</h3>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-[#c87d4a] hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Category List with Thumbnails matching exact reference screenshot (media_1787765609596.png) */}
      <div className="space-y-1.5">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                isSelected 
                  ? 'bg-[#c87d4a]/20 text-[#c87d4a] font-bold border border-[#c87d4a]/40 shadow-sm' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Category Circle Icon / Thumbnail */}
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center border border-white/10">
                {cat.icon === 'star' ? (
                  <Star className="w-3 h-3 text-[#c87d4a] fill-current" />
                ) : (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                )}
              </div>

              <span className="truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Gender Filter */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Gender</h4>
        <div className="flex gap-2">
          {['all', 'men', 'women'].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 text-center text-xs py-2 rounded-xl border uppercase font-medium transition-all ${
                filters.gender === g
                  ? 'bg-[#c87d4a] border-[#c87d4a] text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <h4 className="font-semibold text-white/60 uppercase tracking-wider">Price</h4>
          <span className="font-mono text-[#c87d4a] font-bold">${filters.minPrice} - ${filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="25"
          value={filters.maxPrice}
          onChange={(e) => setPriceRange(filters.minPrice, Number(e.target.value))}
          className="w-full accent-[#c87d4a] bg-white/10 cursor-pointer h-1.5 rounded-lg"
        />
      </div>

      {/* Size Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Sizes</h4>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => {
            const isSelected = filters.sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-semibold transition-all ${
                  isSelected 
                    ? 'bg-[#c87d4a] border-[#c87d4a] text-white' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock & Sale Toggles */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-[#c87d4a]"
          />
        </label>
        <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
          <span>On Sale Only</span>
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-[#c87d4a]"
          />
        </label>
      </div>

    </aside>
  );
};

export default FilterSidebar;
