import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSearchStore = create(
  persist(
    (set) => ({
      isOpen: false,
      query: '',
      history: ['Cashmere Wool Coat', 'Silk Shirt', 'Leather Boots', 'Aviator Sunglasses'],
      
      openSearch: () => set({ isOpen: true }),
      closeSearch: () => set({ isOpen: false, query: '' }),
      setQuery: (query) => set({ query }),
      
      addHistory: (term) => {
        if (!term.trim()) return;
        set((state) => ({
          history: Array.from(new Set([term.trim(), ...state.history])).slice(0, 6),
        }));
      },
      
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'store-search-storage',
    }
  )
);
