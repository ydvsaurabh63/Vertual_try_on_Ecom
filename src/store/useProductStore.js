import { create } from 'zustand';
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from '../data/products';
import { API_URL } from '../config/api';

export const useProductStore = create((set, get) => ({
  products: FALLBACK_PRODUCTS,
  categories: FALLBACK_CATEGORIES,
  isLoadingProducts: false,
  isLoadingCategories: false,

  fetchProducts: async (params = {}) => {
    set({ isLoadingProducts: true });
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/products${query ? `?${query}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          set({ products: data.products, isLoadingProducts: false });
          return data.products;
        }
      }
    } catch (err) {
      console.warn('[useProductStore] Fallback to local products:', err.message);
    }
    set({ isLoadingProducts: false });
    return get().products;
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          set({ categories: data.categories, isLoadingCategories: false });
          return data.categories;
        }
      }
    } catch (err) {
      console.warn('[useProductStore] Fallback to local categories:', err.message);
    }
    set({ isLoadingCategories: false });
    return get().categories;
  },

  getProductBySlug: (slug) => {
    const list = get().products;
    return list.find((p) => p.slug === slug || p.id === slug) || list[0] || null;
  },

  getProductsByCategory: (cat) => {
    const list = get().products;
    if (!cat || cat === 'all') return list;
    return list.filter((p) => p.category === cat || p.category === cat.toLowerCase());
  },

  getFeaturedProducts: () => {
    const list = get().products;
    const featured = list.filter((p) => p.featured || p.isFeatured);
    return featured.length > 0 ? featured.slice(0, 4) : list.slice(0, 4);
  },

  getBestSellers: () => {
    const list = get().products;
    return list.slice(0, 4);
  }
}));
