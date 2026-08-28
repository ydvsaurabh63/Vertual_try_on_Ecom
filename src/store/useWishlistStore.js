import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);

        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
          return false; // Removed
        } else {
          set({ items: [...items, product] });
          return true; // Added
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      removeFromWishlist: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'store-wishlist-storage',
    }
  )
);
