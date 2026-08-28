import { create } from 'zustand';

const initialFilters = {
  category: 'all',
  gender: 'all',
  minPrice: 0,
  maxPrice: 1000,
  sizes: [],
  colors: [],
  inStockOnly: false,
  onSaleOnly: false,
  sortBy: 'featured', // featured, price-asc, price-desc, rating, newest
};

export const useFilterStore = create((set) => ({
  filters: { ...initialFilters },
  isMobileFilterOpen: false,

  setCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  setGender: (gender) => set((state) => ({ filters: { ...state.filters, gender } })),
  setPriceRange: (minPrice, maxPrice) => set((state) => ({ filters: { ...state.filters, minPrice, maxPrice } })),
  
  toggleSize: (size) => set((state) => {
    const exists = state.filters.sizes.includes(size);
    const sizes = exists 
      ? state.filters.sizes.filter((s) => s !== size)
      : [...state.filters.sizes, size];
    return { filters: { ...state.filters, sizes } };
  }),

  toggleColor: (color) => set((state) => {
    const exists = state.filters.colors.includes(color);
    const colors = exists
      ? state.filters.colors.filter((c) => c !== color)
      : [...state.filters.colors, color];
    return { filters: { ...state.filters, colors } };
  }),

  setInStockOnly: (inStockOnly) => set((state) => ({ filters: { ...state.filters, inStockOnly } })),
  setOnSaleOnly: (onSaleOnly) => set((state) => ({ filters: { ...state.filters, onSaleOnly } })),
  setSortBy: (sortBy) => set((state) => ({ filters: { ...state.filters, sortBy } })),

  resetFilters: () => set({ filters: { ...initialFilters } }),

  openMobileFilter: () => set({ isMobileFilterOpen: true }),
  closeMobileFilter: () => set({ isMobileFilterOpen: false }),
}));
