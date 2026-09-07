import React, { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { TRY_ON_MODELS } from '../data/products';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useTryOnStore } from '../store/useTryOnStore';
import { runLightXVirtualTryOn, getCachedTryOnResult, prefetchTryOn } from '../services/lightxService';
import CameraCaptureModal from '../Components/CameraCaptureModal';
import ModelSelectionModal from '../Components/ModelSelectionModal';
import { Sparkles, Check, ShoppingBag, Wand2, Loader2, RotateCcw, AlertTriangle, Eye, Camera, User, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const VirtualTryOnPage = () => {
  const addItem = useCartStore((state) => state.addItem);
  const { products } = useProductStore();
  const {
    selectedModelId,
    setModel,
    customUserPhoto,
    setCustomUserPhoto,
    photoSource,
  } = useTryOnStore();

  const [selectedProduct, setSelectedProduct] = useState(products[0] || null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState({ name: 'Standard', hex: '#000000' });

  // Modals for photo & model selection
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // AI Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiResultImage, setAiResultImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showCreditsWarning, setShowCreditsWarning] = useState(false);

  // Active Model
  const currentModel = (TRY_ON_MODELS && TRY_ON_MODELS.find((m) => m.id === selectedModelId)) || TRY_ON_MODELS[0] || {
    id: 'm-arjun',
    name: 'Arjun Sharma',
    fullBody: '/assets/images/tryon/arjun-model.jpg',
    avatar: '/assets/images/tryon/arjun-model.jpg',
  };

  const activePersonImage = customUserPhoto || currentModel.fullBody || currentModel.avatar || '/assets/images/tryon/arjun-model.jpg';

  // Sync initial product selection
  useEffect(() => {
    if (products?.length && (!selectedProduct || !products.some(p => p.id === selectedProduct.id))) {
      setSelectedProduct(products[0]);
      setSelectedSize(products[0].sizes?.[0] || 'M');
      setSelectedColor(products[0].colors?.[0] || { name: 'Standard', hex: '#000000' });
    }
  }, [products]);

  // When active person or product changes, check cache & trigger background prefetch
  useEffect(() => {
    if (selectedProduct) {
      const cached = getCachedTryOnResult(activePersonImage, selectedProduct.id || selectedProduct.name);
      if (cached) {
        setAiResultImage(cached);
      } else {
        setAiResultImage(null);
        // ⚡ Background prefetch
        prefetchTryOn({ personImageUrl: activePersonImage, product: selectedProduct });
      }
      setErrorMessage(null);
      setShowCreditsWarning(false);
    }
  }, [activePersonImage, selectedProduct]);

  // When model changes
  const handleModelChange = (model) => {
    setModel(model);
    setShowOriginal(false);
    setErrorMessage(null);
    setShowCreditsWarning(false);
  };

  // When product changes
  const handleProductChange = (prod) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes?.[0] || 'M');
    setSelectedColor(prod.colors?.[0] || { name: 'Standard', hex: '#000000' });
    setShowOriginal(false);
    setErrorMessage(null);
    setShowCreditsWarning(false);
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
        setAiResultImage(null);
        setErrorMessage(null);
        toast.success('Your photo loaded! Ready for AI Try-On ✨');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // User photo selected via Camera modal
  const handlePhotoSelected = (photoDataUrl) => {
    setCustomUserPhoto(photoDataUrl, 'camera');
    setAiResultImage(null);
    setErrorMessage(null);
    toast.success('Your photo loaded! Ready for AI Try-On ✨');
  };

  // Trigger Real LightX AI Virtual Try-On
  const handleTryOn = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product.');
      return;
    }
    if (isGenerating) return;

    const personUrl = activePersonImage;

    // 1. Check Cache
    const cached = getCachedTryOnResult(personUrl, selectedProduct.id || selectedProduct.name);
    if (cached) {
      setAiResultImage(cached);
      setShowOriginal(false);
      setErrorMessage(null);
      setShowCreditsWarning(false);
      toast.success('Loaded try-on preview from cache!');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(15);
      setErrorMessage(null);
      setShowCreditsWarning(false);
      setShowOriginal(false);

      // 2. Call backend /api/tryon via service
      const res = await runLightXVirtualTryOn({
        personImageUrl: personUrl,
        product: selectedProduct,
        onProgress: ({ progress: p }) => setProgress(p),
      });

      if (res?.outputUrl) {
        setAiResultImage(res.outputUrl);
        setErrorMessage(null);
        toast.success(customUserPhoto ? '✨ Outfit fitted to your photo!' : '✨ Real AI Try-On generated successfully!');
      } else {
        throw new Error('No output URL received from AI.');
      }
    } catch (err) {
      console.error('Virtual Try-On Error:', err);
      const msg = err.message || 'Virtual Try-On generation failed.';
      const isCreditErr = msg.toLowerCase().includes('credit') || msg.includes('402') || msg.includes('5040');
      if (isCreditErr) {
        toast.error('LightX API credits are currently exhausted. Please recharge credits.', {
          id: 'lightx-credit-page-toast',
          duration: 4000,
          style: {
            background: '#18181c',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          },
        });
      } else {
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addItem(selectedProduct, selectedColor, selectedSize, 1);
    toast.success(`Added "${selectedProduct.name}" to cart from Virtual Fitting Studio!`, {
      style: { background: '#18181c', color: '#fff', border: '1px solid #c87d4a' }
    });
  };

  const getGarmentOverlayStyle = (category) => {
    switch (category) {
      case 'pants-trousers':
        return {
          position: 'absolute',
          top: '39%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '45%',
          height: '53%',
          objectFit: 'contain',
        };
      case 't-shirts':
      case 'shirts':
      case 'hoodies-sweatshirts':
      case 'jackets-outerwear':
        return {
          position: 'absolute',
          top: '17%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '58%',
          height: '32%',
          objectFit: 'contain',
        };
      case 'hats':
        return {
          position: 'absolute',
          top: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20%',
          height: '12%',
          objectFit: 'contain',
        };
      case 'shoes-sneakers':
        return {
          position: 'absolute',
          bottom: '2.5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30%',
          height: '10%',
          objectFit: 'contain',
        };
      default:
        return {
          position: 'absolute',
          top: '17%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '52%',
          height: '34%',
          objectFit: 'contain',
        };
    }
  };

  const activeDisplayImage = (aiResultImage && !showOriginal) ? aiResultImage : activePersonImage;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Virtual Fitting Room Studio' }]} />

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
          setAiResultImage(null);
          setErrorMessage(null);
          toast.success(`Selected model: ${model.name}`);
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">AI GENERATIVE STUDIO</span>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">Interactive Virtual Try-On</h1>
          <p className="text-xs text-white/50 font-light mt-0.5">
            Select any garment to wear immediately on your photo or model with LightX AI synthesis.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] text-xs font-bold uppercase">
          <Sparkles className="w-4 h-4 text-[#c87d4a]" />
          <span>Instant Fit & LightX AI</span>
        </div>
      </div>



      {/* Main Studio Interactive Container */}
      <div className="rounded-3xl bg-[#121216] border border-white/10 overflow-hidden flex flex-col lg:flex-row min-h-[600px] shadow-2xl">
        
        {/* LEFT: Canvas Model Display */}
        <div className="lg:w-1/2 bg-[#0b0b0e] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-white/10">
          
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#18181c] group">
            
            {/* Base Model or AI Result */}
            <img
              src={activeDisplayImage}
              alt={currentModel.name}
              onError={() => {
                if (aiResultImage) {
                  setAiResultImage(null);
                  setErrorMessage('Failed to load generated AI image preview.');
                }
              }}
              className="w-full h-full object-contain filter brightness-95 transition-all duration-500"
            />

            {/* Instant Garment Fit on Mannequin when product is selected */}
            {(!aiResultImage || showOriginal) && selectedProduct && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <img
                  src={selectedProduct.tryOnOverlay || selectedProduct.images?.[0] || selectedProduct.image}
                  alt={selectedProduct.name}
                  style={getGarmentOverlayStyle(selectedProduct.category)}
                  className="transition-all duration-300 pointer-events-none drop-shadow-2xl"
                />
              </div>
            )}

            {/* AI Loading State with Scanning Pulse */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-[#c87d4a]/30 border-t-[#c87d4a] animate-spin" />
                  <Wand2 className="w-6 h-6 text-[#c87d4a] absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1.5 w-full max-w-[220px]">
                  <p className="text-sm font-bold text-white">Generating your try-on...</p>
                  <p className="text-[11px] text-white/50">LightX AI is synthesizing natural garment fit</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-3">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-[#c87d4a] h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-[#c87d4a] font-bold">{progress}%</p>
                </div>
              </div>
            )}

            {/* Toggle Original vs AI Result Button if Generated */}
            {aiResultImage && !isGenerating && (
              <button
                type="button"
                onClick={() => setShowOriginal(!showOriginal)}
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
              >
                <Eye className="w-3.5 h-3.5 text-[#c87d4a]" />
                <span>{showOriginal ? 'View AI Fit' : 'View Original Model'}</span>
              </button>
            )}

            {/* Model & Fit Info Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-xs text-white/90 flex items-center justify-between">
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  {customUserPhoto ? (photoSource === 'camera' ? '📷 Live Camera Photo' : '📸 Your Uploaded Photo') : currentModel.name}
                  {aiResultImage && !showOriginal && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      AI Generated
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-white/50">{customUserPhoto ? 'Custom Fit' : `${currentModel.height} • Wearing Size ${selectedSize}`}</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Check className="w-4 h-4" />
                <span>{aiResultImage ? 'AI Tailored' : 'Ready to Try'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Controls & Trigger */}
        <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            {selectedProduct && (
              <div>
                <span className="text-xs font-mono uppercase text-[#c87d4a] tracking-widest">{selectedProduct.category}</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedProduct.name}</h2>
                <p className="text-lg sm:text-xl font-extrabold text-[#c87d4a] mt-1">${selectedProduct.finalPrice || selectedProduct.price}</p>
              </div>
            )}

            {/* 1. Photo Source Selection Bar */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">1. Choose Person / Model Source</label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className={`flex-1 p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    customUserPhoto
                      ? 'bg-[#c87d4a]/20 border-[#c87d4a] text-[#c87d4a]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                  }`}
                >
                  <Camera className="w-4 h-4 text-[#c87d4a]" />
                  <span>{customUserPhoto ? 'Change Photo (Camera/Gallery)' : 'Upload / Camera Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(true)}
                  className={`flex-1 p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !customUserPhoto
                      ? 'bg-[#c87d4a]/20 border-[#c87d4a] text-[#c87d4a]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                  }`}
                >
                  <User className="w-4 h-4 text-[#c87d4a]" />
                  <span>{customUserPhoto ? 'Choose a Ready Model' : `👤 ${currentModel.name}`}</span>
                </button>
              </div>
            </div>

            {/* 2. Avatar Models Quick Selector */}
            {!customUserPhoto && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {TRY_ON_MODELS.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleModelChange(model)}
                      className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer disabled:opacity-50 ${
                        currentModel.id === model.id
                          ? 'bg-[#c87d4a]/20 border-[#c87d4a] text-white font-bold ring-1 ring-[#c87d4a]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <img src={model.avatar} alt={model.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{model.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{model.height}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Select Clothing Garment */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">2. Select Clothing Garment</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleProductChange(prod)}
                    className={`flex-shrink-0 w-20 h-24 rounded-2xl border overflow-hidden transition-all cursor-pointer disabled:opacity-50 ${
                      selectedProduct?.id === prod.id ? 'border-[#c87d4a] ring-2 ring-[#c87d4a]' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={prod.images?.[0] || prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Size Selector */}
            {selectedProduct?.sizes?.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">3. Select Garment Size</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                        selectedSize === size
                          ? 'bg-[#c87d4a] border-[#c87d4a] text-white'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Action: TRY ON with LightX AI */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isGenerating || !selectedProduct}
                onClick={handleTryOn}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-[#c87d4a] to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c87d4a]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating your try-on... ({progress}%)</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-white" />
                    <span>{aiResultImage ? '✨ Re-Generate AI Try-On' : '✨ Try On with LightX AI'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Add Fitted Garment to Cart */}
          <button
            type="button"
            disabled={!selectedProduct || isGenerating}
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4 text-[#c87d4a]" />
            <span>Add Fitted Outfit to Bag - ${selectedProduct?.finalPrice || selectedProduct?.price || 0}</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default VirtualTryOnPage;
