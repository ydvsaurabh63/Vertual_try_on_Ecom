import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import ProductGrid from '../Components/ProductGrid';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useTryOnStore } from '../store/useTryOnStore';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Shirt, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  ChevronRight,
  Sparkles,
  Ruler
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const openTryOn = useTryOnStore((state) => state.openTryOn);
  const { products } = useProductStore();

  const product = products.find((p) => p.slug === slug || p.id === slug) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error('Please select a size before adding to bag');
      return;
    }
    setSizeError(false);
    addItem(product, selectedColor || product.colors?.[0], selectedSize || product.sizes?.[0], quantity);
    toast.success(`Added "${product.name}" to your bag`, {
      style: { background: '#18181c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error('Please select a size before checkout');
      return;
    }
    addItem(product, selectedColor || product.colors?.[0], selectedSize || product.sizes?.[0], quantity);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    if (added) toast.success('Added to Wishlist');
    else toast('Removed from Wishlist', { icon: '💔' });
  };

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Shop', path: '/shop' }, { label: product.category, path: `/shop?category=${product.category}` }, { label: product.name }]} />

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* LEFT: Product Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#121216] border border-white/10 shadow-2xl">
            
            {/* Badges */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1.5 sm:gap-2">
              {product.isSale && (
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#c87d4a] text-white uppercase shadow-lg">
                  -{product.discount}% OFF
                </span>
              )}
              {product.isNew && (
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white text-black uppercase shadow-lg">
                  NEW SEASON
                </span>
              )}
            </div>

            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-6 sm:p-8 transition-all duration-500"
            />
          </div>

          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx 
                      ? 'border-[#c87d4a] scale-105 shadow-xl' 
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Specs & CTAs */}
        <div className="space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">
              {product.category} • {product.gender}
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-1">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
              <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs sm:text-sm">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-white/40">({product.reviewsCount} reviews)</span>
              </div>
              <span className="text-white/20 hidden sm:inline">•</span>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>In Stock ({product.stock} available)</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121216] border border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#c87d4a]">${product.price}</span>
              {product.originalPrice && (
                <span className="text-base sm:text-lg text-white/40 line-through">${product.originalPrice}</span>
              )}
            </div>
            {product.isSale && (
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#c87d4a]/20 text-[#c87d4a] border border-[#c87d4a]/40">
                Save ${product.originalPrice - product.price} ({product.discount}%)
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors && (
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                Color: <span className="text-white font-bold">{selectedColor?.name || product.colors[0]?.name}</span>
              </label>
              <div className="flex items-center gap-2.5 sm:gap-3">
                {product.colors.map((c, i) => {
                  const isSel = (selectedColor?.name || product.colors[0]?.name) === c.name;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSel ? 'border-[#c87d4a] scale-110 shadow-lg ring-2 ring-[#c87d4a]/50' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {isSel && (
                        <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${c.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector with Validation */}
          {product.sizes && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Select Size <span className="text-rose-400">*</span>
                </label>
                <button
                  onClick={() => toast('Size Guide: Standard European & US tailoring dimensions.', { icon: '📏' })}
                  className="inline-flex items-center gap-1 text-xs text-[#c87d4a] hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSize(s);
                      setSizeError(false);
                    }}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === s
                        ? 'bg-[#c87d4a] border-[#c87d4a] text-white shadow-lg'
                        : 'bg-[#121216] border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {sizeError && (
                <p className="text-xs text-rose-400 font-medium animate-bounce">
                  * Please choose your preferred size before placing order.
                </p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">Quantity</label>
            <div className="inline-flex items-center border border-white/10 rounded-xl bg-[#121216]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 sm:p-3 text-white/60 hover:text-white"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="px-5 sm:px-6 text-xs sm:text-sm font-bold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2.5 sm:p-3 text-white/60 hover:text-white"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="space-y-3 pt-3 sm:pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-xl shadow-[#c87d4a]/25 transition-all transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={() => openTryOn(product)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/10 transition-colors flex-shrink-0"
                title="Try on mannequin model"
                aria-label="Try on mannequin"
              >
                <Shirt className="w-4 h-4 text-[#c87d4a]" />
                <span className="hidden sm:inline">Try On</span>
              </button>

              <button
                onClick={handleWishlist}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-colors flex-shrink-0 ${
                  isWishlisted 
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                    : 'bg-[#121216] border-white/10 text-white hover:bg-white/10'
                }`}
                title="Wishlist"
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-white text-black hover:bg-white/90 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all"
            >
              Buy It Now
            </button>
          </div>

          {/* Value Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#121216] border border-white/5 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#c87d4a] flex-shrink-0" />
              <span>Complimentary Express Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#c87d4a] flex-shrink-0" />
              <span>30-Day Easy Returns</span>
            </div>
          </div>

          {/* Details / Specs Tabs */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'details' ? 'border-[#c87d4a] text-white' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('material')}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'material' ? 'border-[#c87d4a] text-white' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Fabric & Care
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-3 text-xs text-white/70 leading-relaxed font-light">
                <p>{product.description}</p>
                <ul className="list-disc pl-4 space-y-1">
                  {product.details?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-white/70 font-light">
                <p><strong>Composition:</strong> {product.material}</p>
                <p><strong>Origin:</strong> Crafted by master artisans in Italy.</p>
                <p><strong>Care Instructions:</strong> Professional dry clean only. Store in garment cover.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-white/10 space-y-6 pb-20 sm:pb-0">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">
              COMPLETE THE LOOK
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">You May Also Like</h3>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}

      {/* Sticky Mobile Bottom Bar for Fast Try-On & Checkout */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121216]/95 backdrop-blur-xl border-t border-white/10 p-3 pb-safe flex items-center gap-2 shadow-2xl">
        <button
          onClick={() => openTryOn(product)}
          className="p-3 rounded-xl bg-white/10 text-[#c87d4a] border border-white/15 flex items-center justify-center flex-shrink-0"
          title="Virtual Try-On"
          aria-label="Virtual Try-On"
        >
          <Shirt className="w-5 h-5" />
        </button>

        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#c87d4a] active:bg-[#b56d3c] text-white text-xs font-bold shadow-lg shadow-[#c87d4a]/25"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Bag • ${product.price}</span>
        </button>
      </div>

    </div>
  );
};

export default ProductDetailPage;

