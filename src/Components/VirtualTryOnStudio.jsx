import React, { useState, useEffect, useRef } from 'react';
import { X, Shirt, Sparkles, Key, RotateCcw, ZoomIn, ShoppingBag, Cpu } from 'lucide-react';
import { useTryOnStore } from '../store/useTryOnStore';
import { useCartStore } from '../store/useCartStore';
import { generateAiTryOnFitAnalysis } from '../services/geminiService';
import gsap from 'gsap';
import toast from 'react-hot-toast';

const VirtualTryOnStudio = () => {
  const { 
    isOpen, 
    closeTryOn, 
    selectedProduct, 
    setProduct,
  } = useTryOnStore();

  const addItem = useCartStore((state) => state.addItem);

  const [pickedItems, setPickedItems] = useState([]);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  
  // AI Processing & Scanning States
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Interactive Focal Point Mouse Zoom States
  const [isHovered, setIsHovered] = useState(false);
  const [isManualZoom, setIsManualZoom] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');

  const containerRef = useRef(null);
  const garmentRef = useRef(null);
  const scannerRef = useRef(null);

  // Exact 3D Grey Standing Mannequin Image provided by user
  const BASE_MANNEQUIN_IMAGE = "/assets/images/tryon/model-man.jpg";

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setGeminiApiKey(savedKey);
  }, []);

  // Anatomical Body Fitting Positioning according to clothing category
  const getGarmentOverlayStyle = (category) => {
    switch (category) {
      case 'pants-trousers':
        return {
          position: 'absolute',
          top: '36%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '68%',
          height: '62%',
          objectFit: 'contain',
        };
      case 't-shirts':
      case 'shirts':
      case 'hoodies-sweatshirts':
      case 'jackets-outerwear':
        return {
          position: 'absolute',
          top: '16%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '74%',
          height: '46%',
          objectFit: 'contain',
        };
      case 'hats':
        return {
          position: 'absolute',
          top: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '45%',
          height: '22%',
          objectFit: 'contain',
        };
      case 'shoes-sneakers':
        return {
          position: 'absolute',
          bottom: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '62%',
          height: '18%',
          objectFit: 'contain',
        };
      default:
        return {
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '55%',
          objectFit: 'contain',
        };
    }
  };

  // Sync selectedProduct & trigger Google Gemini AI Flow when product changes
  useEffect(() => {
    if (selectedProduct) {
      // Add to picked items list
      setPickedItems((prev) => {
        const exists = prev.some((item) => item.id === selectedProduct.id);
        if (!exists) {
          return [...prev, selectedProduct];
        }
        return prev;
      });

      // 1. GSAP Animated Garment Wear onto Mannequin Body
      if (garmentRef.current) {
        gsap.fromTo(
          garmentRef.current,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }
        );
      }

      // 2. Trigger Google Gemini AI Scanner Beam Flow
      setIsAiProcessing(true);
      if (scannerRef.current) {
        gsap.fromTo(
          scannerRef.current,
          { top: '0%' },
          { top: '100%', duration: 1.5, repeat: 1, yoyo: true, ease: 'power1.inOut' }
        );
      }

      // 3. Call Google Gemini AI Service
      generateAiTryOnFitAnalysis(selectedProduct, geminiApiKey).then(() => {
        setIsAiProcessing(false);
      });
    }
  }, [selectedProduct, geminiApiKey]);

  // Track exact mouse position to zoom in at the exact cursor focal point
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setTransformOrigin(`${x}% ${y}%`);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformOrigin('50% 50%');
  };

  if (!isOpen) return null;

  const currentProduct = selectedProduct || pickedItems[pickedItems.length - 1] || null;

  const handleRemovePick = (productId) => {
    const updated = pickedItems.filter((item) => item.id !== productId);
    setPickedItems(updated);
    if (currentProduct?.id === productId) {
      setProduct(updated[updated.length - 1] || null);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (!tempKeyInput.trim()) {
      toast.error('Please enter a valid Gemini API key');
      return;
    }
    const cleanKey = tempKeyInput.trim();
    localStorage.setItem('gemini_api_key', cleanKey);
    setGeminiApiKey(cleanKey);
    setShowApiKeyModal(false);
    toast.success('Google Gemini API Key saved! AI Drape Flow active.');
  };

  const handleStartOver = () => {
    setPickedItems([]);
    setProduct(null);
    setIsManualZoom(false);
    toast('Fitting room reset to bare mannequin', { icon: '🔄' });
  };

  const handleAddToCart = () => {
    if (!currentProduct) {
      toast.error('No clothing item selected on mannequin');
      return;
    }
    addItem(currentProduct, currentProduct.colors?.[0] || 'Standard', currentProduct.sizes?.[0] || 'M', 1);
    toast.success(`Added fitted "${currentProduct.name}" to shopping bag!`, {
      style: {
        background: '#18181c',
        color: '#ffffff',
        border: '1px solid #c87d4a',
      },
    });
    closeTryOn();
  };

  const activeZoom = isHovered || isManualZoom;

  return (
    <>
      {/* Floating Bottom-Left Widget Dock matching reference screenshot */}
      <div className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 bg-[#16161a] border border-white/10 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl flex flex-col space-y-3 animate-slideUp text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">Fitting room</h2>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] font-bold">
                <Sparkles className="w-3 h-3 animate-spin" />
                Gemini AI Flow
              </span>
            </div>
            <p className="text-xs text-white/50 font-light mt-0.5">
              Tap the hanger on any product to wear it on mannequin.
            </p>
          </div>
          <button
            onClick={closeTryOn}
            className="p-1 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Mannequin Frame */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-[270px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-[#24242a] border border-white/10 shadow-xl cursor-crosshair group"
        >
          <div 
            className="w-full h-full relative transition-transform duration-300 ease-out"
            style={{
              transformOrigin: transformOrigin,
              transform: activeZoom ? 'scale(1.7)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform-origin 0.1s linear'
            }}
          >
            {/* Mannequin Base Image */}
            <img
              alt=""
              aria-hidden="true"
              title="Your mannequin, waiting to be dressed"
              loading="lazy"
              decoding="async"
              src={BASE_MANNEQUIN_IMAGE}
              className="rounded-[inherit] object-cover w-full h-full filter contrast-105 brightness-100"
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                inset: '0px',
                color: 'transparent',
              }}
            />

            {/* GSAP Animated Original Product Image Worn on Mannequin Body with Original Background Intact */}
            {currentProduct && (
              <div 
                ref={garmentRef}
                className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
              >
                <img
                  src={currentProduct.tryOnOverlay || currentProduct.images[0]}
                  alt={currentProduct.name}
                  style={getGarmentOverlayStyle(currentProduct.category)}
                  className="transition-all duration-300 shadow-md rounded-xl"
                />
              </div>
            )}

            {/* Google Gemini AI Scanning Laser Beam Effect */}
            {isAiProcessing && (
              <div 
                ref={scannerRef}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c87d4a] to-transparent shadow-[0_0_15px_#c87d4a] z-20 pointer-events-none"
              />
            )}
          </div>

          {/* Zoom Button Icon on Bottom Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsManualZoom(!isManualZoom);
            }}
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full border text-white flex items-center justify-center shadow-lg transition-all z-20 ${
              activeZoom ? 'bg-[#c87d4a] border-[#c87d4a]' : 'bg-black/70 hover:bg-black/90 border-white/20'
            }`}
            title="Toggle Zoom In/Out"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* "Your picks" Tray */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="font-bold text-white/80">Your picks</span>
            <span className="text-[10px] text-white/40">{pickedItems.length} {pickedItems.length === 1 ? 'piece' : 'pieces'}</span>
          </div>

          {pickedItems.length === 0 ? (
            <p className="text-[10px] text-white/40 italic py-1">No clothes selected yet. Click the hanger on any product to wear!</p>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {pickedItems.map((prod) => (
                <div key={prod.id} className="relative flex-shrink-0 w-12 h-14 rounded-xl border border-white/20 overflow-hidden bg-[#18181c] group">
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePick(prod.id)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 text-white hover:bg-rose-500 flex items-center justify-center transition-colors"
                    title="Remove pick"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gemini AI Status Note */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-white/50 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#c87d4a]" />
            Powered by Google Gemini 1.5 Flash
          </span>
          <button
            onClick={() => {
              setTempKeyInput(geminiApiKey);
              setShowApiKeyModal(true);
            }}
            className="text-[#c87d4a] hover:underline font-bold"
          >
            {geminiApiKey ? '🔑 Active API Key' : 'Add API Key'}
          </button>
        </div>

        {/* Bottom Bar: Configure Key + Start over + Add to Bag */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setTempKeyInput(geminiApiKey);
              setShowApiKeyModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs shadow-lg shadow-[#c87d4a]/20 transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="truncate">{geminiApiKey ? '🔑 Key Active' : 'Add your API key'}</span>
          </button>

          <button
            onClick={handleStartOver}
            className="flex items-center gap-1 px-3 py-2.5 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start over</span>
          </button>

          <button
            onClick={handleAddToCart}
            className="p-2.5 rounded-full bg-white text-black hover:bg-white/90 shadow-md transition-colors"
            title="Add fitted garment to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Gemini API Key Config Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#18181c] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#c87d4a] font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Configure Google Gemini API</span>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 font-light leading-relaxed">
              Enter your Google Gemini API Key below to activate real-time AI drape analysis and neural fitting on the 3D standing mannequin.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs"
                >
                  Save API Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-3 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualTryOnStudio;
