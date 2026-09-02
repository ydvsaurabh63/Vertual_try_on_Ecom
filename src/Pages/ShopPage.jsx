import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import FilterSidebar from '../Components/FilterSidebar';
import MobileFilterDrawer from '../Components/MobileFilterDrawer';
import ProductGrid from '../Components/ProductGrid';
import { useFilterStore } from '../store/useFilterStore';
import { useProductStore } from '../store/useProductStore';
import { SlidersHorizontal, ChevronDown, X, RotateCcw } from 'lucide-react';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const saleParam = searchParams.get('onSaleOnly');

  const { filters, setSortBy, openMobileFilter, resetFilters, setCategory, setOnSaleOnly } = useFilterStore();
  const { products } = useProductStore();

  // Sync URL search params on load if provided
  React.useEffect(() => {
    if (categoryParam) setCategory(categoryParam);
    if (saleParam === 'true') setOnSaleOnly(true);
  }, [categoryParam, saleParam, setCategory, setOnSaleOnly]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category && product.slug !== filters.category) {
        return false;
      }
      // Gender filter
      if (filters.gender !== 'all' && product.gender !== filters.gender) {
        return false;
      }
      // Price range
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      // Size filter
      if (filters.sizes.length > 0) {
        const hasSize = product.sizes?.some((s) => filters.sizes.includes(s));
        if (!hasSize) return false;
      }
      // Color filter
      if (filters.colors.length > 0) {
        const hasColor = product.colors?.some((c) => filters.colors.includes(c.name));
        if (!hasColor) return false;
      }
      // In stock filter
      if (filters.inStockOnly && !product.inStock) {
        return false;
      }
      // On sale filter
      if (filters.onSaleOnly && !product.isSale) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // featured default
    });
  }, [filters]);

  const activeChips = [];
  if (filters.category !== 'all') activeChips.push({ key: 'category', label: `Category: ${filters.category}` });
  if (filters.gender !== 'all') activeChips.push({ key: 'gender', label: `Gender: ${filters.gender}` });
  if (filters.maxPrice < 1000) activeChips.push({ key: 'price', label: `Max $${filters.maxPrice}` });
  if (filters.sizes.length > 0) activeChips.push({ key: 'sizes', label: `Sizes (${filters.sizes.length})` });
  if (filters.colors.length > 0) activeChips.push({ key: 'colors', label: `Colors (${filters.colors.length})` });
  if (filters.onSaleOnly) activeChips.push({ key: 'sale', label: 'On Sale' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Shop Catalog' }]} />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Luxury Fashion Shop
            </h1>
            <p className="text-xs text-white/50 mt-1 font-light">
              Showing {filteredProducts.length} premium pieces curated for elevated wardrobes.
            </p>
          </div>

          {/* Controls: Mobile Filter Button & Sort Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={openMobileFilter}
              className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-[#121216] border border-white/10 text-xs font-semibold text-white"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c87d4a]" />
              <span>Filters ({activeChips.length})</span>
            </button>

            {/* Sort Selector */}
            <div className="relative flex items-center">
              <select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#121216] border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 pr-7 sm:pr-8 text-xs font-semibold text-white focus:outline-none focus:border-[#c87d4a] cursor-pointer"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50 absolute right-2.5 sm:right-3 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <span className="text-xs text-white/40 mr-1">Active Filters:</span>
          {activeChips.map((chip, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] text-xs font-semibold">
              {chip.label}
            </span>
          ))}
          <button
            onClick={resetFilters}
            className="text-xs text-white/50 hover:text-white underline ml-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Main Layout: Desktop Sidebar + Product Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        {/* Product Listing */}
        <div className="flex-1">
          <ProductGrid products={filteredProducts} />
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileFilterDrawer />

    </div>
  );
};

export default ShopPage;
