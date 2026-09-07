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

// ─── In-flight Request Registry ───────────────────────────────────────────
// Shared map of active background generation promises to avoid duplicate API calls
// and allow instant hook-in when the user clicks 'Try On'.
const inFlightRequests = new Map();
const inFlightListeners = new Map();

/**
 * Returns true if a background pre-fetch or generation is currently in flight.
 */
export const isTryOnPrefetching = (personImageUrl, garmentId) => {
  const cacheKey = `${personImageUrl}_${garmentId}`;
  return inFlightRequests.has(cacheKey);
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

// ─── Background Pre-fetcher ──────────────────────────────────────────────────

/**
 * Starts background AI generation as soon as a cloth is hung/selected.
 * If already cached or currently processing, does not send duplicate requests.
 *
 * @param {object} params
 * @param {string} params.personImageUrl
 * @param {object} params.product
 * @returns {Promise<string|null>}
 */
export const prefetchTryOn = async ({ personImageUrl, product }) => {
  if (!personImageUrl || !product) return null;
  const garmentId = product?.id || product?.name;
  const cacheKey = `${personImageUrl}_${garmentId}`;

  // 1. If already in cache, do nothing
  if (getCachedTryOnResult(personImageUrl, garmentId)) {
    return getCachedTryOnResult(personImageUrl, garmentId);
  }

  // 2. If already processing in background, return active promise
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Kick off background task
  console.log(`[LightX Pre-Fetch] ⚡ Initiating background pre-fetch for: ${product.name}`);
  const promise = runLightXVirtualTryOn({ personImageUrl, product }).catch((err) => {
    console.debug('[LightX Pre-Fetch] Background pre-fetch notice:', err.message);
    return null;
  });

  return promise;
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Full end-to-end Virtual Try-On runner.
 * Checks cache first, connects to active in-flight pre-fetch if running,
 * or calls backend if needed.
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
  const cacheKey = `${personImageUrl}_${garmentId}`;

  // 1. Check in-memory / localStorage cache (instant 0s return!)
  const cachedUrl = getCachedTryOnResult(personImageUrl, garmentId);
  if (cachedUrl) {
    if (onProgress) onProgress({ progress: 100 });
    return { success: true, outputUrl: cachedUrl, fromCache: true };
  }

  // 2. If already in flight from pre-fetch, hook into the existing promise
  if (inFlightRequests.has(cacheKey)) {
    console.log(`[LightX] ⚡ Attaching to existing in-flight background generation for: ${product?.name}`);
    if (onProgress) {
      if (!inFlightListeners.has(cacheKey)) {
        inFlightListeners.set(cacheKey, new Set());
      }
      inFlightListeners.get(cacheKey).add(onProgress);
    }
    const result = await inFlightRequests.get(cacheKey);
    return result;
  }

  // 3. Emit an initial progress ping
  if (onProgress) onProgress({ progress: 15 });

  const clothImageUrl =
    product?.realDressedModel ||   // public Unsplash URL — preferred
    product?.images?.[0] ||        // local cutout fallback
    product?.image;

  if (!clothImageUrl) {
    throw new Error('No product image found. Cannot perform Virtual Try-On.');
  }

  // 4. Create generation promise and store in inFlightRequests
  let progressValue = 20;
  const notifyListeners = (p) => {
    if (onProgress) onProgress({ progress: p });
    const listeners = inFlightListeners.get(cacheKey);
    if (listeners) {
      listeners.forEach((fn) => {
        try { fn({ progress: p }); } catch {}
      });
    }
  };

  const progressInterval = setInterval(() => {
    progressValue = Math.min(progressValue + 5, 92);
    notifyListeners(progressValue);
  }, 1500);

  const generationPromise = (async () => {
    try {
      const outputUrl = await callBackendTryOn(personImageUrl, clothImageUrl);

      // Cache result persistently
      if (garmentId) {
        setCache(cacheKey, outputUrl);
      }

      notifyListeners(100);
      return { success: true, outputUrl };
    } finally {
      clearInterval(progressInterval);
      inFlightRequests.delete(cacheKey);
      inFlightListeners.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, generationPromise);
  return generationPromise;
};

/**
 * @deprecated — Kept for API compatibility. Use runLightXVirtualTryOn instead.
 */
export const createLightXTryOnJob = async ({ personImageUrl, product }) => {
  return runLightXVirtualTryOn({ personImageUrl, product });
};

/**
 * @deprecated — Kept for API compatibility.
 */
export const pollLightXOrderStatus = async ({ orderId }) => {
  console.warn('[lightxService] pollLightXOrderStatus is deprecated — polling is handled server-side.');
  throw new Error('Direct polling is no longer supported. Use runLightXVirtualTryOn.');
};
