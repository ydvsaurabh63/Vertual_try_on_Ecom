import { create } from 'zustand';
import { PRODUCTS, TRY_ON_MODELS } from '../data/products';
import { persist } from 'zustand/middleware';

export const useTryOnStore = create(
  persist(
    (set, get) => ({
      isOpen: false,
      selectedProduct: null,
      selectedModel: TRY_ON_MODELS[0],
      selectedModelId: 'm-arjun',
      customUserPhoto: null,
      photoSource: 'model', // 'model' | 'gallery' | 'camera'
      selectedSize: 'M',
      selectedColor: null,

      openTryOn: (product = null) => set((state) => ({
        isOpen: true,
        selectedProduct: product || state.selectedProduct || null,
        selectedColor: product?.colors?.[0] || state.selectedColor || null,
        selectedSize: product?.sizes?.[0] || state.selectedSize || 'M',
      })),

      closeTryOn: () => set({ isOpen: false }),

      setModel: (model) => {
        const fullModel = typeof model === 'string' 
          ? (TRY_ON_MODELS.find(m => m.id === model) || TRY_ON_MODELS[0])
          : model;
        set({
          selectedModel: fullModel,
          selectedModelId: fullModel.id,
          customUserPhoto: null,
          photoSource: 'model',
        });
      },

      setCustomUserPhoto: (photoUrl, source = 'gallery') => set({
        customUserPhoto: photoUrl,
        photoSource: source,
      }),

      clearCustomUserPhoto: () => set({
        customUserPhoto: null,
        photoSource: 'model',
      }),

      setProduct: (product) => set({
        selectedProduct: product,
        selectedColor: product?.colors?.[0] || null,
        selectedSize: product?.sizes?.[0] || 'M',
      }),
      setSize: (size) => set({ selectedSize: size }),
      setColor: (color) => set({ selectedColor: color }),
    }),
    {
      name: 'aura_tryon_store',
      partialize: (state) => ({
        selectedModelId: state.selectedModelId,
        customUserPhoto: state.customUserPhoto,
        photoSource: state.photoSource,
        selectedSize: state.selectedSize,
      }),
    }
  )
);
