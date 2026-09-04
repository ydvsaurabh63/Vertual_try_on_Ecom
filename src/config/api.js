/**
 * Central API Configuration
 * Defaults to live Render Backend URL so Vercel deployment works out of the box!
 */

const FALLBACK_BACKEND_URL = 'https://vertual-try-on-ecom-backend.onrender.com';
const RAW_API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : FALLBACK_BACKEND_URL);

export const API_BASE_URL = RAW_API_URL.replace(/\/$/, '');
export const API_URL = `${API_BASE_URL}/api`;

export default API_URL;
