import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { TRY_ON_MODELS } from '../data/products';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { runLightXVirtualTryOn, getCachedTryOnResult } from '../services/lightxService';
import { Sparkles, Check, ShoppingBag, Wand2, Loader2, RotateCcw, AlertTriangle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const VirtualTryOnPage = () => {
  const addItem = useCartStore((state) => state.addItem);
  const { products } = useProductStore();

  const [selectedModel, setSelectedModel] = useState(TRY_ON_MODELS[0]);
  const [selectedProduct, setSelectedProduct] = useState(products[0] || null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState({ name: 'Standard', hex: '#000000' });

  // AI Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiResultImage, setAiResultImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showCreditsWarning, setShowCreditsWarning] = useState(false);

  // Sync initial product selection
  useEffect(() => {
    if (products?.length && (!selectedProduct || !products.some(p => p.id === selectedProduct.id))) {
      setSelectedProduct(products[0]);
      setSelectedSize(products[0].sizes?.[0] || 'M');
      setSelectedColor(products[0].colors?.[0] || { name: 'Standard', hex: '#000000' });
    }
  }, [products]);

  // When model changes, check cache
  const handleModelChange = (model) => {
    setSelectedModel(model);
    setShowOriginal(false);
    setErrorMessage(null);
    setShowCreditsWarning(false);
    if (selectedProduct) {
      const personUrl = model.fullBody || model.avatar;
      const cached = getCachedTryOnResult(personUrl, selectedProduct.id || selectedProduct.name);
      setAiResultImage(cached || null);
    }
  };

  // When product changes, check cache
  const handleProductChange = (prod) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes?.[0] || 'M');
    setSelectedColor(prod.colors?.[0] || { name: 'Standard', hex: '#000000' });
    setShowOriginal(false);
    setErrorMessage(null);
    setShowCreditsWarning(false);

    if (selectedModel) {
      const personUrl = selectedModel.fullBody || selectedModel.avatar;
      const cached = getCachedTryOnResult(personUrl, prod.id || prod.name);
      setAiResultImage(cached || null);
    }
  };

  // Trigger Real LightX AI Virtual Try-On
  const handleTryOn = async () => {
    if (!selectedProduct || !selectedModel) {
      toast.error('Please select both a model and a product.');
      return;
    }
    if (isGenerating) return;

    const personUrl = selectedModel.fullBody || selectedModel.avatar;

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
        toast.success('✨ Real AI Try-On generated successfully!');
      } else {
        throw new Error('No output URL received from AI.');
      }
    } catch (err) {
      console.error('Virtual Try-On Error:', err);
      const msg = err.message || 'Virtual Try-On generation failed.';
      setErrorMessage(msg);

      if (msg.includes('credits') || msg.includes('Credits') || msg.includes('402') || msg.includes('5040')) {
        setShowCreditsWarning(true);
      }
      toast.error(msg);
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

  const currentModel = selectedModel || TRY_ON_MODELS[0] || {
    id: 'm-arjun',
    name: 'Arjun Sharma',
    fullBody: '/assets/images/tryon/arjun-model.jpg',
    avatar: '/assets/images/tryon/arjun-model.jpg',
  };

  const activeDisplayImage = (aiResultImage && !showOriginal) ? aiResultImage : (currentModel.fullBody || currentModel.avatar);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Virtual Fitting Room Studio' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">AI GENERATIVE STUDIO</span>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">Interactive Virtual Try-On</h1>
          <p className="text-xs text-white/50 font-light mt-0.5">
            Select any garment to wear immediately on the model, or generate photorealistic AI fusion.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] text-xs font-bold uppercase">
          <Sparkles className="w-4 h-4 text-[#c87d4a]" />
          <span>Instant Fit & LightX AI</span>
        </div>
      </div>

      {/* Credits Warning Banner if exhausted */}
      {showCreditsWarning && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-white">LightX API credits are currently exhausted. Please recharge API credits.</p>
            <p className="text-amber-200/80">
              Your API key is configured correctly, but needs credits on <a href="https://app.lightxeditor.com" target="_blank" rel="noreferrer" className="underline font-semibold text-white hover:text-amber-300">LightX Editor Dashboard</a> to generate new synthesized images.
            </p>
          </div>
        </div>
      )}

      {/* Main Studio Interactive Container */}
      <div className="rounded-3xl bg-[#121216] border border-white/10 overflow-hidden flex flex-col lg:flex-row min-h-[600px] shadow-2xl">
        
        {/* LEFT: Canvas Model Display */}
        <div className="lg:w-1/2 bg-[#0b0b0e] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-white/10">
          
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#18181c] group">
            
            {/* Base Model or AI Result */}
            <img
              src={activeDisplayImage}
              alt={currentModel.name}
              className="w-full h-full object-cover filter brightness-95 transition-all duration-500"
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
                  <p className="text-[11px] text-white/50">LightX AI is fitting the garment to the mannequin</p>
                  
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
                  {currentModel.name}
                  {aiResultImage && !showOriginal && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      AI Generated
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-white/50">{currentModel.height} • Wearing Size {selectedSize}</p>
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

            {/* 1. Avatar Models Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">1. Select Dummy Person / Mannequin</label>
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

            {/* 2. Select Clothing Garment */}
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

            {/* 3. Size Selector */}
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

            {/* 4. Action: TRY ON with LightX AI */}
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
