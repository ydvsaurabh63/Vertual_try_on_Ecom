import { API_URL } from '../config/api';

/**
 * LightX AI Virtual Try-On — Frontend Service
 *
 * All API calls are routed through the secure Express backend at /api/tryon.
 * The LightX API key is NEVER exposed to the browser.
 *
 * Exported functions keep the same signatures as before so VirtualTryOnStudio.jsx
 * requires zero changes to its call sites.
 */

// ─── In-memory + localStorage Cache ─────────────────────────────────────────

const CACHE_KEY = 'lightx_tryon_cache';

const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setCache = (key, url) => {
  try {
    const cache = getCache();
    cache[key] = url;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.debug('Cache write note:', e);
  }
};

/**
 * Returns a cached AI-generated result URL if one exists for this
 * (personUrl, garmentId) pair, or null if not yet generated.
 */
export const getCachedTryOnResult = (personUrl, garmentId) => {
  const cacheKey = `${personUrl}_${garmentId}`;
  const cache = getCache();
  return cache[cacheKey] || null;
};

// ─── Backend API Call ────────────────────────────────────────────────────────

/**
 * Calls our secure Express backend, which in turn calls the LightX
 * v2/aivirtualtryon endpoint with the API key stored server-side.
 *
 * @param {string} modelImageUrl  - URL/path of the selected model/dummy image
 * @param {string} clothImageUrl  - URL/path of the selected product/cloth image
 * @returns {Promise<string>}     - The AI-generated try-on image URL
 */
const callBackendTryOn = async (modelImageUrl, clothImageUrl) => {
  const response = await fetch(`${API_URL}/tryon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelImageUrl, clothImageUrl }),
  });

  // Always parse the body — it contains the real error message from LightX
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Surface the actual LightX error (e.g. "5040, API_CREDITS_CONSUMED") not just the HTTP code
    const rawMsg = data?.error || '';

    if (response.status === 402 || rawMsg.includes('CREDITS') || rawMsg.includes('5040') || rawMsg.includes('exhausted')) {
      throw new Error(
        'LightX API credits are currently exhausted. Please recharge API credits.'
      );
    }

    throw new Error(rawMsg || `Virtual Try-On API error (HTTP ${response.status}). Check the backend server logs.`);
  }

  if (!data?.outputUrl) {
    throw new Error('No output image was returned by the AI. Please try again.');
  }

  return data.outputUrl;
};

// ─── Public API (matches original signatures) ────────────────────────────────

/**
 * Full end-to-end Virtual Try-On runner.
 * Checks cache first, then calls the backend if needed.
 *
 * @param {object} params
 * @param {string}   params.personImageUrl  - Model/dummy image URL or local path
 * @param {object}   params.product         - Product object (must have images[0] or image)
 * @param {string}   [params.apiKey]        - Ignored — key is managed server-side
 * @param {function} [params.onProgress]    - Progress callback ({ progress: number })
 */
export const runLightXVirtualTryOn = async ({
  personImageUrl,
  product,
  onProgress,
}) => {
  const garmentId = product?.id || product?.name;

  // 1. Check in-memory / localStorage cache to avoid redundant API calls
  const cachedUrl = getCachedTryOnResult(personImageUrl, garmentId);
  if (cachedUrl) {
    return { success: true, outputUrl: cachedUrl, fromCache: true };
  }

  // 2. Emit an initial progress ping
  if (onProgress) onProgress({ progress: 15 });

  // Garment image priority for LightX AI:
  // 1. realDressedModel  — public Unsplash URL of garment worn on a real model  ✅ (best for LightX)
  // 2. images[0]         — local transparent PNG cutout                         ⚠️ (LightX rejects transparent PNGs)
  // LightX AI extracts the clothing style from the reference image regardless of whether
  // it's a cutout or a model photo — using a real photo gives best results.
  const clothImageUrl =
    product?.realDressedModel ||   // public Unsplash URL — preferred
    product?.images?.[0] ||        // local cutout fallback
    product?.image;

  if (!clothImageUrl) {
    throw new Error('No product image found. Cannot perform Virtual Try-On.');
  }

  // 3. Simulate incremental progress while waiting for the backend
  let progressValue = 20;
  const progressInterval = setInterval(() => {
    progressValue = Math.min(progressValue + 5, 90);
    if (onProgress) onProgress({ progress: progressValue });
  }, 3000);

  try {
    // 4. Call the backend — it handles the LightX API key and polling internally
    const outputUrl = await callBackendTryOn(personImageUrl, clothImageUrl);

    // 5. Cache the result
    if (garmentId) {
      setCache(`${personImageUrl}_${garmentId}`, outputUrl);
    }

    if (onProgress) onProgress({ progress: 100 });

    return { success: true, outputUrl };
  } finally {
    clearInterval(progressInterval);
  }
};

/**
 * @deprecated — Kept for API compatibility. Use runLightXVirtualTryOn instead.
 * Creates a try-on job (now handled entirely by the backend).
 */
export const createLightXTryOnJob = async ({ personImageUrl, product }) => {
  const cachedUrl = getCachedTryOnResult(personImageUrl, product?.id || product?.name);
  if (cachedUrl) {
    return { status: 'active', outputUrl: cachedUrl, fromCache: true };
  }
  // Delegate to the full runner
  return runLightXVirtualTryOn({ personImageUrl, product });
};

/**
 * @deprecated — Polling is now handled server-side. Kept for API compatibility.
 */
export const pollLightXOrderStatus = async ({ orderId }) => {
  // Polling is now fully server-side; this is a no-op stub.
  console.warn('[lightxService] pollLightXOrderStatus is deprecated — polling is handled server-side.');
  throw new Error('Direct polling is no longer supported. Use runLightXVirtualTryOn.');
};
