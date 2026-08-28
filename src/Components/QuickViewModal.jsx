import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Shirt, Check, ShieldCheck } from 'lucide-react';
import { useQuickViewStore } from '../store/useQuickViewStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useTryOnStore } from '../store/useTryOnStore';
import toast from 'react-hot-toast';

const QuickViewModal = () => {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const openTryOn = useTryOnStore((state) => state.openTryOn);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const colorVal = selectedColor || product.colors?.[0] || { name: 'Standard', hex: '#000000' };
  const sizeVal = selectedSize || product.sizes?.[0] || 'M';
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, colorVal, sizeVal, quantity);
    toast.success(`Added "${product.name}" to your bag`, {
      style: {
        background: '#18181c',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    });
    closeQuickView();
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    if (added) toast.success('Added to Wishlist');
    else toast('Removed from Wishlist', { icon: '💔' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn">
      
      <div 
        className="fixed inset-0" 
        onClick={closeQuickView}
      />

      <div className="relative w-full max-w-4xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Image Gallery */}
        <div className="md:w-1/2 p-6 bg-[#0b0b0e] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#18181c] border border-white/10 mb-4">
            <img
              src={product.images[activeImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-14 h-16 rounded-xl overflow-hidden border transition-all ${
                    activeImage === idx ? 'border-[#c87d4a] scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Details & Options */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="uppercase tracking-widest font-mono text-[10px]">{product.category}</span>
              <div className="flex items-center gap-1 text-amber-400 font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating}</span>
                <span className="text-white/30">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Title & Price */}
            <div>
              <h2 className="text-2xl font-bold text-white">{product.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-extrabold text-[#c87d4a]">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-base text-white/40 line-through">${product.originalPrice}</span>
                )}
                {product.isSale && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c87d4a]/20 text-[#c87d4a] border border-[#c87d4a]/30">
                    SAVE {product.discount}%
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Color options */}
            {product.colors && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                  Color: <span className="text-white">{colorVal.name}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        colorVal.name === c.name ? 'border-[#c87d4a] scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {colorVal.name === c.name && (
                        <Check className={`w-3.5 h-3.5 ${c.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size options */}
            {product.sizes && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                  Size: <span className="text-white">{sizeVal}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        sizeVal === s
                          ? 'bg-[#c87d4a] border-[#c87d4a] text-white'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action CTAs */}
          <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white text-sm font-semibold shadow-xl shadow-[#c87d4a]/20 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => {
                  closeQuickView();
                  openTryOn(product);
                }}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
                title="Try on avatar model"
              >
                <Shirt className="w-4 h-4" />
              </button>

              <button
                onClick={handleWishlist}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  isWishlisted 
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Link
              to={`/product/${product.slug}`}
              onClick={closeQuickView}
              className="block text-center text-xs font-semibold text-white/60 hover:text-[#c87d4a] transition-colors py-1"
            >
              View Full Product Details & Specs →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default QuickViewModal;
