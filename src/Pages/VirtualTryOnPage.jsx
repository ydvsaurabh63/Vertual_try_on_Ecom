import React, { useState } from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { TRY_ON_MODELS, PRODUCTS } from '../data/products';
import { useCartStore } from '../store/useCartStore';
import { Shirt, Sparkles, Check, ShoppingBag, User } from 'lucide-react';
import toast from 'react-hot-toast';

const VirtualTryOnPage = () => {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedModel, setSelectedModel] = useState(TRY_ON_MODELS[0]);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [selectedSize, setSelectedSize] = useState(PRODUCTS[0].sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(PRODUCTS[0].colors?.[0] || { name: 'Standard', hex: '#000000' });

  const handleProductChange = (prod) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes?.[0] || 'M');
    setSelectedColor(prod.colors?.[0] || { name: 'Standard', hex: '#000000' });
  };

  const handleAddToCart = () => {
    addItem(selectedProduct, selectedColor, selectedSize, 1);
    toast.success(`Added "${selectedProduct.name}" to cart from Virtual Fitting Studio!`, {
      style: { background: '#18181c', color: '#fff', border: '1px solid #c87d4a' }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Virtual Fitting Room Studio' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">3D AVATAR FITTING STUDIO</span>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">Interactive Virtual Try-On</h1>
          <p className="text-xs text-white/50 font-light mt-0.5">Select a model avatar and try on tailored coats, suits, dresses & silk tops live.</p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] text-xs font-bold uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Real-time Fit Engine</span>
        </div>
      </div>

      {/* Main Studio Interactive Container */}
      <div className="rounded-3xl bg-[#121216] border border-white/10 overflow-hidden flex flex-col lg:flex-row min-h-[600px] shadow-2xl">
        
        {/* LEFT: Canvas Model Display */}
        <div className="lg:w-1/2 bg-[#0b0b0e] p-8 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-white/10">
          
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#18181c]">
            <img
              src={selectedModel.fullBody}
              alt={selectedModel.name}
              className="w-full h-full object-cover filter brightness-95"
            />

            {/* Clothing Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={selectedProduct.tryOnOverlay || selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-[85%] h-[75%] object-contain mix-blend-multiply opacity-90 transition-all duration-500 transform hover:scale-105"
              />
            </div>

            {/* Model Info Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-xs text-white/90 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{selectedModel.name}</p>
                <p className="text-[10px] text-white/50">{selectedModel.height} • Wearing Size {selectedSize}</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Check className="w-4 h-4" />
                <span>Tailored Fit</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Controls */}
        <div className="lg:w-1/2 p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-[#c87d4a] tracking-widest">{selectedProduct.category}</span>
              <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
              <p className="text-xl font-extrabold text-[#c87d4a] mt-1">${selectedProduct.price}</p>
            </div>

            {/* Avatar Models Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">1. Select Avatar Model</label>
              <div className="grid grid-cols-2 gap-3">
                {TRY_ON_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      selectedModel.id === model.id
                        ? 'bg-[#c87d4a]/20 border-[#c87d4a] text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <img src={model.avatar} alt={model.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{model.name}</p>
                      <p className="text-[10px] text-white/40">{model.height}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Clothing Garment */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">2. Select Garment to Wear</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {PRODUCTS.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductChange(prod)}
                    className={`flex-shrink-0 w-20 h-24 rounded-2xl border overflow-hidden transition-all ${
                      selectedProduct.id === prod.id ? 'border-[#c87d4a] ring-2 ring-[#c87d4a]' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">3. Select Garment Size</label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
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

          </div>

          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c87d4a]/25 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Fitted Outfit to Bag - ${selectedProduct.price}</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default VirtualTryOnPage;
