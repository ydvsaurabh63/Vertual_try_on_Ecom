import { create } from 'zustand';
import { adminApi } from '../services/adminApi';

export const useAdminStore = create((set, get) => ({
  adminUser: (() => {
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('admin_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('admin_token')),
  isLoadingAuth: false,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  login: async (email, password) => {
    set({ isLoadingAuth: true });
    try {
      const data = await adminApi.login(email, password);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      set({
        token: data.token,
        adminUser: data.user,
        isAuthenticated: true,
        isLoadingAuth: false
      });
      return { success: true, user: data.user };
    } catch (err) {
      set({ isLoadingAuth: false });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({
      token: null,
      adminUser: null,
      isAuthenticated: false
    });
  },

  checkTokenValidity: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      set({ isAuthenticated: false, adminUser: null, token: null });
      return false;
    }

    try {
      const res = await adminApi.checkToken();
      if (res.ok && res.user) {
        localStorage.setItem('admin_user', JSON.stringify(res.user));
        set({ adminUser: res.user, isAuthenticated: true, token });
        return true;
      } else {
        get().logout();
        return false;
      }
    } catch {
      get().logout();
      return false;
    }
  },

  updateAdminUser: (updates) => {
    set((state) => {
      const updated = { ...state.adminUser, ...updates };
      localStorage.setItem('admin_user', JSON.stringify(updated));
      return { adminUser: updated };
    });
  }
}));
