import { create } from 'zustand';
import { PRODUCTS, TRY_ON_MODELS } from '../data/products';

export const useTryOnStore = create((set) => ({
  isOpen: true,
  selectedProduct: PRODUCTS[0] || null,
  selectedModel: TRY_ON_MODELS[0],
  selectedSize: 'M',
  selectedColor: null,

  openTryOn: (product = null) => set((state) => ({
    isOpen: true,
    selectedProduct: product || state.selectedProduct || PRODUCTS[0],
    selectedColor: product?.colors?.[0] || state.selectedColor || null,
    selectedSize: product?.sizes?.[0] || state.selectedSize || 'M',
  })),

  closeTryOn: () => set({ isOpen: false }),

  setModel: (model) => set({ selectedModel: model }),
  setProduct: (product) => set({
    selectedProduct: product,
    selectedColor: product?.colors?.[0] || null,
    selectedSize: product?.sizes?.[0] || 'M',
  }),
  setSize: (size) => set({ selectedSize: size }),
  setColor: (color) => set({ selectedColor: color }),
}));
