/**
 * Central API Configuration
 * Reads VITE_API_URL if set (e.g. on Vercel: https://vertual-try-on-ecom-backend.onrender.com)
 * Fallback to empty string for local relative /api proxy
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = RAW_API_URL.replace(/\/$/, '');
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

export default API_URL;
