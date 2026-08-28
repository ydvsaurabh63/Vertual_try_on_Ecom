import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      couponCode: '',
      discountPercent: 0,
      
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (product, selectedColor, selectedSize, quantity = 1) => {
        const currentItems = get().items;
        const colorName = typeof selectedColor === 'object' ? selectedColor.name : selectedColor || product.colors?.[0]?.name || 'Standard';
        const sizeVal = selectedSize || product.sizes?.[0] || 'M';
        
        const existingIndex = currentItems.findIndex(
          (item) => item.id === product.id && item.selectedColor === colorName && item.selectedSize === sizeVal
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += quantity;
          set({ items: updated, isDrawerOpen: true });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images[0],
                selectedColor: colorName,
                selectedSize: sizeVal,
                quantity: quantity,
                material: product.material,
              },
            ],
            isDrawerOpen: true,
          });
        }
      },

      removeItem: (id, selectedColor, selectedSize) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.selectedColor === selectedColor && item.selectedSize === selectedSize)
          ),
        }));
      },

      updateQuantity: (id, selectedColor, selectedSize, delta) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id && item.selectedColor === selectedColor && item.selectedSize === selectedSize) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
          }),
        }));
      },

      applyCoupon: (code) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === 'LUXURY10' || cleanCode === 'WELCOME10') {
          set({ couponCode: cleanCode, discountPercent: 10 });
          return { success: true, message: '10% Discount Applied!' };
        } else if (cleanCode === 'STORE20') {
          set({ couponCode: cleanCode, discountPercent: 20 });
          return { success: true, message: '20% Special Discount Applied!' };
        }
        return { success: false, message: 'Invalid Coupon Code' };
      },

      removeCoupon: () => set({ couponCode: '', discountPercent: 0 }),

      clearCart: () => set({ items: [], couponCode: '', discountPercent: 0 }),

      // Calculated getters
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        return (subtotal * get().discountPercent) / 100;
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal > 300 ? 0 : 25;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'store-cart-storage',
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discountPercent: state.discountPercent,
      }),
    }
  )
);
