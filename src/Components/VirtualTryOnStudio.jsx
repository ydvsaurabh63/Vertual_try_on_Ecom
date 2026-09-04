import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, RotateCcw, ZoomIn, ShoppingBag, Cpu, Wand2, Check, Server, Upload, Camera, User, Image as ImageIcon } from 'lucide-react';
import { useTryOnStore } from '../store/useTryOnStore';
import { useCartStore } from '../store/useCartStore';
import { generateAiTryOnFitAnalysis } from '../services/geminiService';
import { runLightXVirtualTryOn, getCachedTryOnResult } from '../services/lightxService';
import { TRY_ON_MODELS } from '../data/products';
import CameraCaptureModal from './CameraCaptureModal';
import ModelSelectionModal from './ModelSelectionModal';
import toast from 'react-hot-toast';

const VirtualTryOnStudio = () => {
  const { 
    isOpen, 
    closeTryOn, 
    selectedProduct, 
    setProduct,
    selectedModelId,
    setModel,
    customUserPhoto,
    setCustomUserPhoto,
    photoSource,
  } = useTryOnStore();

  const addItem = useCartStore((state) => state.addItem);

  const [pickedItems, setPickedItems] = useState([]);

  // Try-On Engine States
  const [isLightXGenerating, setIsLightXGenerating] = useState(false);
  const [lightXProgress, setLightXProgress] = useState(0);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fitInsights, setFitInsights] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  // Interactive Focal Point Mouse Zoom States
  const [isHovered, setIsHovered] = useState(false);
  const [isManualZoom, setIsManualZoom] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Active Person / Model Image
  const activeModel = (TRY_ON_MODELS && TRY_ON_MODELS.find((m) => m.id === selectedModelId)) || (TRY_ON_MODELS && TRY_ON_MODELS[0]) || {
    id: 'm-arjun',
    name: 'Arjun Sharma',
    fullBody: '/assets/images/tryon/arjun-model.jpg',
    avatar: '/assets/images/tryon/arjun-model.jpg',
  };
  const activePersonImage = customUserPhoto || activeModel?.fullBody || '/assets/images/tryon/arjun-model.jpg';

  useEffect(() => {
    // Clear stale try-on cache on mount so old results don't linger
    localStorage.removeItem('lightx_tryon_cache');
  }, []);

  // Trigger LightX 100% Real Generative AI Virtual Try-On
  // The API key is stored securely in server/.env — never exposed to the browser.
  const triggerLightXSynthesis = async (product, personImage) => {
    if (!product) return;
    if (isLightXGenerating) return; // Prevent duplicate requests

    const targetPerson = personImage || customUserPhoto || activeModel.fullBody || '/assets/images/tryon/arjun-model.jpg';

    // Check if result is already cached for this product to avoid redundant API calls
    const cached = getCachedTryOnResult(targetPerson, product.id || product.name);
    if (cached) {
      setAiGeneratedImage(cached);
      setErrorMessage(null);
      toast.success('Loaded try-on preview from cache!');
      return;
    }

    try {
      setIsLightXGenerating(true);
      setLightXProgress(10);
      setErrorMessage(null);

      // Backend receives model image URL + product cloth image URL,
      // calls LightX v2/aivirtualtryon with the server-side API key,
      // polls until done, and returns the AI-generated output URL.
      const result = await runLightXVirtualTryOn({
        personImageUrl: targetPerson,
        product: product,
        onProgress: ({ progress }) => setLightXProgress(progress)
      });

      if (result.outputUrl) {
        setAiGeneratedImage(result.outputUrl);
        setErrorMessage(null);
        toast.success(customUserPhoto ? 'Outfit successfully fitted on your photo!' : 'Try-On generated successfully with LightX AI!');
      }
    } catch (err) {
      console.error('LightX Virtual Try-On Error:', err);
      const msg = err.message || 'Virtual Try-On failed. Ensure the backend server is running.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLightXGenerating(false);
    }
  };

  // When a product is selected → check cache first, DO NOT auto-trigger to save API credits
  useEffect(() => {
    if (selectedProduct) {
      // Add to picked history list
      setPickedItems((prev) => {
        const exists = prev.some((item) => item.id === selectedProduct.id);
        return exists ? prev : [...prev, selectedProduct];
      });

      const targetPerson = customUserPhoto || activeModel.fullBody || '/assets/images/tryon/arjun-model.jpg';

      // Check if this product was already generated and cached
      const cached = getCachedTryOnResult(targetPerson, selectedProduct.id || selectedProduct.name);
      if (cached) {
        setAiGeneratedImage(cached);
      } else {
        setAiGeneratedImage(null);
      }
      setErrorMessage(null);

      // Optional background fit insights
      generateAiTryOnFitAnalysis(selectedProduct, '').then((res) => {
        setFitInsights(res);
      }).catch(() => {});
    }
  }, [selectedProduct, customUserPhoto, selectedModelId]);

  const currentProduct = selectedProduct || (pickedItems.length > 0 ? pickedItems[pickedItems.length - 1] : null);

  // Mouse move zoom coordinates
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
    setIsHovered(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleStartOver = () => {
    setPickedItems([]);
    setProduct(null);
    setAiGeneratedImage(null);
    setCustomUserPhoto(null);
    toast.success('Fitting room cleared');
  };

  const handleRemovePick = (productId) => {
    setPickedItems((prev) => prev.filter((item) => item.id !== productId));
    if (selectedProduct?.id === productId) {
      const remaining = pickedItems.filter((item) => item.id !== productId);
      setProduct(remaining.length > 0 ? remaining[remaining.length - 1] : null);
      setAiGeneratedImage(null);
    }
  };



  // User photo upload from gallery / device
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('Image size must be less than 15MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const photoUrl = uploadEvent.target.result;
        setCustomUserPhoto(photoUrl, 'gallery');
        setAiGeneratedImage(null);
        setErrorMessage(null);
        toast.success('Your photo loaded! Ready for AI Try-On ✨');
        if (currentProduct) {
          triggerLightXSynthesis(currentProduct, photoUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // User photo selected via Camera modal (Capture or Gallery)
  const handlePhotoSelected = (photoDataUrl) => {
    setCustomUserPhoto(photoDataUrl, 'camera');
    setAiGeneratedImage(null);
    setErrorMessage(null);
    toast.success('Your photo loaded! Ready for AI Try-On ✨');
    if (currentProduct) {
      triggerLightXSynthesis(currentProduct, photoDataUrl);
    }
  };

  const handleAddAllToCart = () => {
    if (pickedItems.length === 0) {
      if (currentProduct) {
        addItem(currentProduct, 1, currentProduct.sizes?.[0] || 'M', currentProduct.colors?.[0] || null);
        toast.success(`Added ${currentProduct.name} to your bag!`);
        closeTryOn();
      } else {
        toast.error('Please pick clothes first');
      }
      return;
    }
    pickedItems.forEach((item) => {
      addItem(item, 1, item.sizes?.[0] || 'M', item.colors?.[0] || null);
    });
    toast.success(`Added ${pickedItems.length} outfit pieces to bag!`);
    closeTryOn();
  };

  const activeZoom = isHovered || isManualZoom;

  if (!isOpen) return null;

  return (
    <>
      {/* Hidden File Input for Gallery Photo Upload */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handlePhotoUpload} 
      />

      {/* Choice & Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoSelected={handlePhotoSelected}
        onOpenGallery={() => fileInputRef.current?.click()}
      />

      {/* Choose a Model Modal (6 Indian Models) */}
      <ModelSelectionModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        selectedModelId={selectedModelId}
        onSelectModel={(model) => {
          setModel(model);
          setAiGeneratedImage(null);
          setErrorMessage(null);
          toast.success(`Selected model: ${model.name}`);
        }}
      />

      {/* Floating Widget Dock (Top-Left on Mobile / Compact Bottom-Left on Desktop) */}
      <div className="fixed top-18 left-3 bottom-auto sm:top-auto sm:bottom-6 sm:left-6 z-50 w-[235px] xs:w-[250px] sm:w-[275px] md:w-[290px] max-w-[calc(100vw-24px)] max-h-[52vh] sm:max-h-[86vh] overflow-y-auto bg-[#16161a]/95 sm:bg-[#16161a] border border-white/15 sm:border-white/10 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-2xl flex flex-col space-y-2 sm:space-y-2.5 animate-slideDown sm:animate-slideUp text-white scrollbar-thin scrollbar-thumb-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">Fitting room</h2>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setPickedItems([]);
                setAiGeneratedImage(null);
                setErrorMessage(null);
                setProduct(null);
                toast('Fitting room cleared', { icon: '🧹' });
              }}
              className="p-1 sm:p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={closeTryOn}
              className="p-1 sm:p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Close fitting room"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>


        {/* Studio Center Canvas */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-inner group cursor-crosshair select-none"
        >
          {/* Zoomable Viewport */}
          <div 
            className="w-full h-full relative transition-transform duration-300 ease-out"
            style={{
              transformOrigin: transformOrigin,
              transform: activeZoom ? 'scale(1.7)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform-origin 0.1s linear'
            }}
          >
            {/* 1. Base Model Preview / User Custom Photo / AI Generated Fit */}
            <img
              alt="Person / Model"
              loading="lazy"
              src={aiGeneratedImage || activePersonImage}
              onError={() => {
                if (aiGeneratedImage) {
                  setAiGeneratedImage(null);
                  setErrorMessage('Failed to load generated try-on image preview.');
                }
              }}
              className="rounded-[inherit] object-contain w-full h-full filter contrast-105 brightness-100 transition-all duration-500"
            />

            {/* 2. Loading State while LightX API is processing */}
            {isLightXGenerating && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-3 sm:p-5 text-center space-y-2 sm:space-y-3 animate-fadeIn">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-[#c87d4a]/20 border-t-[#c87d4a] animate-spin" />
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#c87d4a] absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-white tracking-wide">Trying on outfit...</p>
                  <p className="text-[10px] sm:text-xs text-white/60">LightX AI synthesizing fit</p>
                </div>
                <div className="w-32 sm:w-40 bg-white/10 h-1.5 sm:h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#c87d4a] to-[#e09865] h-full transition-all duration-300 rounded-full" 
                    style={{ width: `${lightXProgress}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-[#c87d4a] font-bold">{lightXProgress}%</span>
              </div>
            )}
          </div>

          {/* Model Tag on Top Left */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10 text-[8px] sm:text-[9px] text-white/80">
            {customUserPhoto ? (photoSource === 'camera' ? '📷 Camera' : '📸 Photo') : `👤 ${activeModel.name}`}
          </div>

          {/* Quick Upload / Camera Button on Canvas Top Right */}
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1 bg-black/75 hover:bg-black/90 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/20 hover:border-[#c87d4a] text-[9px] sm:text-[10px] text-white/90 hover:text-[#c87d4a] transition-all cursor-pointer shadow-lg"
            title="Upload from gallery or take photo with camera"
          >
            <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#c87d4a]" />
            <span>{customUserPhoto ? 'Change' : 'Photo'}</span>
          </button>

          {/* Zoom Button Icon on Bottom Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsManualZoom(!isManualZoom);
            }}
            className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border text-white flex items-center justify-center shadow-lg transition-all z-20 cursor-pointer ${
              activeZoom ? 'bg-[#c87d4a] border-[#c87d4a]' : 'bg-black/70 hover:bg-black/90 border-white/20'
            }`}
            title="Toggle Zoom In/Out"
          >
            <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Error Banner if API error occurs */}
        {errorMessage && (
          <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] sm:text-[11px] flex items-start gap-1.5 sm:gap-2 animate-fadeIn">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">
                {errorMessage.includes('credit') || errorMessage.includes('Credit') || errorMessage.includes('402') || errorMessage.includes('5040')
                  ? 'LightX API credits are currently exhausted.'
                  : errorMessage}
              </p>
              {errorMessage.includes('credit') || errorMessage.includes('Credit') || errorMessage.includes('402') || errorMessage.includes('5040') ? (
                <p className="text-[9px] sm:text-[10px] text-amber-200/80 mt-0.5">
                  Please recharge credits at <a href="https://app.lightxeditor.com" target="_blank" rel="noreferrer" className="underline font-bold text-white">app.lightxeditor.com</a>.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Change Your Photo & Choose a Model Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Button 1: Change Your Photo */}
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-md ${
              customUserPhoto
                ? 'bg-[#c87d4a]/20 border-[#c87d4a]/60 text-[#c87d4a] hover:bg-[#c87d4a]/30'
                : 'bg-white/10 hover:bg-white/15 border-white/20 hover:border-[#c87d4a]/50 text-white'
            }`}
          >
            <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c87d4a]" />
            <span className="truncate">{customUserPhoto ? 'Change Photo' : 'Your Photo'}</span>
          </button>

          {/* Button 2: Choose a Model */}
          <button
            onClick={() => setIsModelModalOpen(true)}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-md ${
              !customUserPhoto
                ? 'bg-[#c87d4a]/20 border-[#c87d4a]/60 text-[#c87d4a] hover:bg-[#c87d4a]/30'
                : 'bg-white/10 hover:bg-white/15 border-white/20 hover:border-[#c87d4a]/50 text-white'
            }`}
          >
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c87d4a]" />
            <span className="truncate">{customUserPhoto ? 'Models' : activeModel.name}</span>
          </button>
        </div>

        {/* Action Button: Try On (Disabled while generating, uses cache if already available) */}
        {currentProduct && !aiGeneratedImage && (
          <button
            onClick={() => triggerLightXSynthesis(currentProduct, activePersonImage)}
            disabled={isLightXGenerating}
            className="w-full py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#c87d4a] to-[#e09b67] text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-[#c87d4a]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate">{isLightXGenerating ? 'Trying on outfit...' : `Try On ${currentProduct.name}`}</span>
          </button>
        )}

        {aiGeneratedImage && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex-1 py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm truncate">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">100% LightX AI Generated Fit</span>
            </div>
            <button
              onClick={() => setAiGeneratedImage(null)}
              className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-[10px] sm:text-xs font-medium transition-all"
            >
              Reset
            </button>
          </div>
        )}

        {/* "Your picks" Tray */}
        <div className="space-y-1.5 sm:space-y-2 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/60">
            <span className="font-bold text-white/80">Your picks</span>
            <span className="text-[9px] sm:text-[10px] text-white/40">{pickedItems.length} {pickedItems.length === 1 ? 'piece' : 'pieces'}</span>
          </div>

          {pickedItems.length === 0 ? (
            <p className="text-[9px] sm:text-[10px] text-white/40 italic py-0.5 sm:py-1">No clothes selected yet. Click hanger on any product to wear!</p>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {pickedItems.map((prod) => (
                <div 
                  key={prod.id} 
                  onClick={() => setProduct(prod)}
                  className={`relative flex-shrink-0 w-10 h-12 sm:w-11 sm:h-13 rounded-lg sm:rounded-xl border overflow-hidden bg-[#18181c] group cursor-pointer transition-all ${
                    selectedProduct?.id === prod.id ? 'border-[#c87d4a] ring-2 ring-[#c87d4a]/50' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePick(prod.id);
                    }}
                    className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/80 text-white hover:bg-rose-500 flex items-center justify-center transition-colors"
                    title="Remove pick"
                  >
                    <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar: Add to Bag */}
        <div className="pt-0.5 sm:pt-1">
          <button
            onClick={handleAddAllToCart}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-lg sm:rounded-xl bg-[#c87d4a] hover:bg-[#d28a57] text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-lg shadow-[#c87d4a]/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Add to bag</span>
          </button>
        </div>

      </div>

    </>
  );
};

export default VirtualTryOnStudio;
