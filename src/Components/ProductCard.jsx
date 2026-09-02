import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star, Shirt } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useQuickViewStore } from '../store/useQuickViewStore';
import { useTryOnStore } from '../store/useTryOnStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const openQuickView = useQuickViewStore((state) => state.openQuickView);
  const { openTryOn } = useTryOnStore();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors?.[0] || 'Standard', product.sizes?.[0] || 'M', 1);
    toast.success(`Added "${product.name}" to bag`, {
      style: {
        background: '#18181c',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success('Saved to Wishlist');
    } else {
      toast('Removed from Wishlist', { icon: '💔' });
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleTryOnHangerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openTryOn(product);
    toast.success(`Wearing "${product.name}" on mannequin!`, {
      icon: '👕',
      style: {
        background: '#18181c',
        color: '#ffffff',
        border: '1px solid #c87d4a',
      },
    });
  };

  return (
    <div 
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl bg-[#16161a] border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/25 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container matching reference Next.js Image fill layout and CSS */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#16161a] p-2 sm:p-4 flex items-center justify-center">
        
        {/* Top Left: Wishlist Heart Icon */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isWishlisted 
              ? 'bg-rose-500 text-white shadow-lg' 
              : 'bg-black/40 text-white/80 hover:bg-black/80 hover:text-white'
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Top Left (Below Heart): Copper Hanger Button */}
        <button
          onClick={handleTryOnHangerClick}
          className="absolute top-10 left-2 sm:top-14 sm:left-3 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#c87d4a] text-white hover:bg-[#d28a57] shadow-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
          title="Tap hanger to wear on mannequin"
          aria-label="Try on garment on mannequin"
        >
          <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Top Right: Star Rating Pill Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] sm:text-xs font-bold">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          <span className="text-white text-[10px] sm:text-xs">{product.rating}</span>
        </div>

        {/* Image Tag matching exact Next.js Image Fill layout structure & inline CSS provided by user */}
        <Link to={`/product/${product.slug}`} className="w-full h-full relative block">
          <img
            alt={product.name}
            loading="lazy"
            decoding="async"
            src={product.images[0]}
            className="object-contain p-2 sm:p-3 transition-transform duration-500 group-hover:scale-105"
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              inset: '0px',
              color: 'transparent',
            }}
          />
        </Link>

        {/* Hover / Touch Quick View Button */}
        <div className={`absolute bottom-2 left-2 right-11 sm:bottom-3 sm:left-3 sm:right-14 z-10 hidden xs:flex items-center justify-center transition-all duration-300 transform ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}>
          <button
            onClick={handleQuickView}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl bg-white/90 text-black text-[10px] sm:text-xs font-semibold hover:bg-white shadow-lg transition-colors"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="truncate">Quick View</span>
          </button>
        </div>

      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex items-center justify-between gap-1 sm:gap-2 bg-[#16161a]">
        
        <div className="min-w-0 flex-1">
          <Link 
            to={`/product/${product.slug}`} 
            className="block text-[11px] sm:text-xs font-semibold text-white/90 hover:text-[#c87d4a] truncate transition-colors"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold text-white">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-white/40 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Right: Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-[#c87d4a] text-white flex items-center justify-center border border-white/10 transition-colors flex-shrink-0"
          title="Add to cart"
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

      </div>
    </div>
  );
};

export default ProductCard;
