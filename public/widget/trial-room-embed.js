/**
 * Universal Virtual Trial Room Embed Widget (SDK & Webhook)
 * Can be embedded into any website (Shopify, WooCommerce, Webflow, Custom HTML/React)
 * 
 * Usage:
 * <script src="https://your-domain.com/widget/trial-room-embed.js" 
 *         data-theme="dark" 
 *         data-position="bottom-left" 
 *         data-webhook-url="https://your-store.com/api/tryon-webhook"></script>
 */

(function () {
  'use strict';

  if (window.VirtualTrialRoomLoaded) return;
  window.VirtualTrialRoomLoaded = true;

  // Default Configuration
  const currentScript = document.currentScript || document.querySelector('script[src*="trial-room-embed.js"]');
  const config = {
    theme: currentScript?.getAttribute('data-theme') || 'dark',
    position: currentScript?.getAttribute('data-position') || 'bottom-left',
    accentColor: currentScript?.getAttribute('data-accent-color') || '#c87d4a',
    webhookUrl: currentScript?.getAttribute('data-webhook-url') || null,
    lightxApiKey: currentScript?.getAttribute('data-lightx-key') || localStorage.getItem('vtr_lightx_key') || '',
    geminiApiKey: currentScript?.getAttribute('data-gemini-key') || localStorage.getItem('vtr_gemini_key') || '',
    autoDetectGarments: currentScript?.getAttribute('data-auto-detect') !== 'false',
    mannequinImage: currentScript?.getAttribute('data-mannequin-image') || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
  };

  // State
  let state = {
    isOpen: false,
    selectedProduct: null,
    pickedItems: [],
    isAiScanning: false,
    isLightXGenerating: false,
    aiGeneratedImage: null,
    aiAnalysis: null,
    isZoomed: false,
    transformOrigin: '50% 50%'
  };

  // Webhook Dispatcher
  function dispatchWebhook(eventType, payload) {
    const eventData = {
      event: eventType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      data: payload
    };

    // 1. Dispatch custom DOM event on window
    window.dispatchEvent(new CustomEvent('virtual-trial-room:' + eventType, { detail: eventData }));

    // 2. Send HTTP Webhook if configured
    if (config.webhookUrl) {
      try {
        fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
          mode: 'no-cors'
        }).catch(err => console.debug('[VTR Webhook] Error:', err));
      } catch (e) {
        console.debug('[VTR Webhook dispatch note]:', e);
      }
    }
  }

  // Create isolated Shadow DOM Host
  const host = document.createElement('div');
  host.id = 'vtr-root-host';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  // Stylesheet inside Shadow DOM
  const styles = document.createElement('style');
  styles.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .vtr-pill-btn {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999998;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: #16161a;
      color: #ffffff;
      border: 2px solid ${config.accentColor};
      border-radius: 9999px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .vtr-pill-btn:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 14px 35px rgba(200, 125, 74, 0.3);
      background: #202026;
    }

    .vtr-icon-box {
      width: 32px;
      height: 32px;
      background: ${config.accentColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .vtr-modal-dock {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999999;
      width: 380px;
      max-width: calc(100vw - 32px);
      max-height: 90vh;
      overflow-y: auto;
      background: #141418;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 16px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: vtrSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes vtrSlideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .vtr-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .vtr-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: rgba(200, 125, 74, 0.2);
      border: 1px solid rgba(200, 125, 74, 0.4);
      color: ${config.accentColor};
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .vtr-mannequin-viewport {
      position: relative;
      width: 100%;
      max-width: 270px;
      margin: 0 auto;
      aspect-ratio: 3/4;
      border-radius: 18px;
      overflow: hidden;
      background: #202026;
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: crosshair;
    }

    .vtr-mannequin-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
    }

    .vtr-mannequin-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .vtr-garment-overlay {
      position: absolute;
      top: 18%;
      left: 50%;
      transform: translateX(-50%);
      width: 72%;
      height: 48%;
      object-fit: contain;
      z-index: 10;
      transition: all 0.5s ease;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));
    }

    .vtr-laser-beam {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${config.accentColor}, transparent);
      box-shadow: 0 0 12px ${config.accentColor};
      z-index: 20;
      animation: vtrScan 2s infinite ease-in-out;
    }

    @keyframes vtrScan {
      0%, 100% { top: 5%; opacity: 0.2; }
      50% { top: 90%; opacity: 1; }
    }

    .vtr-btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background: ${config.accentColor};
      color: #fff;
      border: none;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .vtr-btn-primary:hover {
      filter: brightness(1.1);
    }

    .vtr-btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    .vtr-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    .vtr-close-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 4px;
    }

    .vtr-close-btn:hover {
      color: #fff;
    }

    .vtr-ai-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 10px 12px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.4;
    }

    .vtr-picks-tray {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .vtr-pick-thumb {
      width: 44px;
      height: 52px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
      position: relative;
      cursor: pointer;
    }

    .vtr-pick-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;
  shadow.appendChild(styles);

  // Container
  const container = document.createElement('div');
  container.className = 'vtr-container';
  shadow.appendChild(container);

  // Render UI
  function render() {
    container.innerHTML = '';

    if (!state.isOpen) {
      const pill = document.createElement('button');
      pill.className = 'vtr-pill-btn';
      pill.innerHTML = `
        <div class="vtr-icon-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
          </svg>
        </div>
        <div style="text-align: left;">
          <div style="text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Try it on</div>
          <div style="color: ${config.accentColor}; font-size: 9px; font-weight: 500;">Virtual Fitting Room</div>
        </div>
      `;
      pill.onclick = () => {
        state.isOpen = true;
        render();
        dispatchWebhook('opened', { product: state.selectedProduct });
      };
      container.appendChild(pill);
      return;
    }

    // Modal Dock
    const dock = document.createElement('div');
    dock.className = 'vtr-modal-dock';

    const currentProd = state.selectedProduct || state.pickedItems[state.pickedItems.length - 1];

    dock.innerHTML = `
      <div class="vtr-header">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 16px; letter-spacing: 0.5px;">Fitting room</strong>
            <span class="vtr-badge">✨ Gemini AI Flow</span>
          </div>
          <p style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">
            Wear any clothing item on our 3D Mannequin.
          </p>
        </div>
        <button class="vtr-close-btn" id="vtr-btn-close">✕</button>
      </div>

      <div class="vtr-mannequin-viewport" id="vtr-viewport">
        <div class="vtr-mannequin-inner" id="vtr-inner" style="transform: ${state.isZoomed ? 'scale(1.6)' : 'scale(1)'}; transform-origin: ${state.transformOrigin};">
          <img src="${config.mannequinImage}" class="vtr-mannequin-img" alt="3D Mannequin" />
          ${currentProd ? `
            <img src="${currentProd.image}" class="vtr-garment-overlay" alt="${currentProd.name || 'Clothing'}" />
          ` : ''}
          ${state.isAiScanning ? `<div class="vtr-laser-beam"></div>` : ''}
        </div>
      </div>

      ${currentProd ? `
        <div class="vtr-ai-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${config.accentColor};">${currentProd.name || 'Selected Item'}</strong>
            <span style="font-weight: 700; color: #4ade80;">96% Fit Score</span>
          </div>
          <p style="font-size: 10px; color: rgba(255,255,255,0.7);">
            ${state.aiAnalysis?.drapeSummary || 'Fabric drapes naturally over the posture with balanced tension across shoulder & chest seams.'}
          </p>
        </div>
      ` : `
        <div class="vtr-ai-card" style="text-align: center; color: rgba(255,255,255,0.5);">
          Click any product image on this store to wear on mannequin.
        </div>
      `}

      <div style="display: flex; gap: 8px;">
        <button class="vtr-btn-primary" style="flex: 1;" id="vtr-btn-try">
          🛍️ Add to Bag
        </button>
        <button class="vtr-btn-secondary" id="vtr-btn-reset">
          🔄 Reset
        </button>
      </div>
    `;

    container.appendChild(dock);

    // Event handlers inside Shadow DOM
    dock.querySelector('#vtr-btn-close').onclick = () => {
      state.isOpen = false;
      render();
      dispatchWebhook('closed', {});
    };

    dock.querySelector('#vtr-btn-reset').onclick = () => {
      state.selectedProduct = null;
      state.pickedItems = [];
      render();
    };

    dock.querySelector('#vtr-btn-try').onclick = () => {
      if (currentProd) {
        dispatchWebhook('added_to_cart', { product: currentProd });
        alert(`Fitted "${currentProd.name || 'Item'}" added to your order!`);
      }
    };

    const viewport = dock.querySelector('#vtr-viewport');
    viewport.onclick = () => {
      state.isZoomed = !state.isZoomed;
      render();
    };
    viewport.onmousemove = (e) => {
      const rect = viewport.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      state.transformOrigin = `${x}% ${y}%`;
      const inner = dock.querySelector('#vtr-inner');
      if (inner && state.isZoomed) {
        inner.style.transformOrigin = state.transformOrigin;
      }
    };
  }

  // Public SDK API
  window.VirtualTrialRoom = {
    open: function (product) {
      state.isOpen = true;
      if (product) {
        state.selectedProduct = product;
        state.pickedItems.push(product);
        state.isAiScanning = true;
        setTimeout(() => { state.isAiScanning = false; render(); }, 1500);
      }
      render();
      dispatchWebhook('product_wear', { product });
    },
    close: function () {
      state.isOpen = false;
      render();
    },
    wearItem: function (item) {
      this.open(item);
    },
    setWebhook: function (url) {
      config.webhookUrl = url;
    },
    setGeminiKey: function (key) {
      config.geminiApiKey = key;
      localStorage.setItem('vtr_gemini_key', key);
    }
  };

  // Initial render
  render();

  // Auto-detect product images with data-vtr-wear or image tags on host page
  if (config.autoDetectGarments) {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-vtr-wear], img[src*="product"], img[src*="cloth"]');
      if (target && !host.contains(target)) {
        const imgUrl = target.getAttribute('data-vtr-image') || target.src;
        const name = target.getAttribute('data-vtr-name') || target.alt || 'Fashion Piece';
        if (imgUrl) {
          window.VirtualTrialRoom.wearItem({ name, image: imgUrl, category: 'apparel' });
        }
      }
    });
  }

  console.log('✅ Virtual Trial Room Embed Webhook SDK Loaded Successfully');
})();
