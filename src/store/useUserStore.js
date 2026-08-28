import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: {
        id: 'u101',
        name: 'Alexander Pierce',
        email: 'alexander@example.com',
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        memberSince: '2025',
      },
      isAuthenticated: true,

      addresses: [
        {
          id: 'addr-1',
          title: 'Primary Residence',
          fullName: 'Alexander Pierce',
          street: '742 Evergreen Terrace, Apt 4B',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'United States',
          isDefault: true,
        },
      ],

      orders: [
        {
          id: 'ORD-98421',
          date: 'August 24, 2026',
          status: 'Shipped',
          total: 735,
          items: [
            { name: 'Minimalist Cashmere Wool Coat', quantity: 1, price: 495, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80' },
            { name: 'Monochrome Oversized Silk Shirt', quantity: 1, price: 240, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80' }
          ],
          trackingNumber: 'TRK-882910492',
          estimatedDelivery: 'August 28, 2026',
        },
        {
          id: 'ORD-87102',
          date: 'July 15, 2026',
          status: 'Delivered',
          total: 360,
          items: [
            { name: 'Italian Calfskin Chelsea Boots', quantity: 1, price: 360, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80' }
          ],
          trackingNumber: 'TRK-55102914',
          estimatedDelivery: 'July 18, 2026',
        }
      ],

      login: (email, password) => {
        set({
          isAuthenticated: true,
          user: {
            id: 'u101',
            name: email.split('@')[0] || 'Valued Customer',
            email: email,
            phone: '+1 (555) 987-6543',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
            memberSince: '2026',
          },
        });
      },

      register: (userData) => {
        set({
          isAuthenticated: true,
          user: {
            id: 'u-' + Date.now(),
            name: userData.name || 'Valued Customer',
            email: userData.email,
            phone: userData.phone || '',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
            memberSince: '2026',
          },
        });
      },

      logout: () => set({ isAuthenticated: false, user: null }),

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      
      addAddress: (address) => set((state) => ({ addresses: [...state.addresses, address] })),
      
      updateProfile: (updatedData) => set((state) => ({ user: { ...state.user, ...updatedData } })),
    }),
    {
      name: 'store-user-storage',
    }
  )
);
