import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import ProductCard from '../Components/ProductCard';
import { useWishlistStore } from '../store/useWishlistStore';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

const WishlistPage = () => {
  const { items, clearWishlist } = useWishlistStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Saved Wishlist' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-[#c87d4a] fill-current" />
            <span>My Saved Wishlist</span>
          </h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            You have saved {items.length} luxury items for later.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-white/50 hover:text-rose-400 underline transition-colors self-start sm:self-auto"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 rounded-3xl bg-[#121216] border border-white/10 p-8">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Your wishlist is empty</h3>
          <p className="text-sm text-white/50 max-w-sm">
            Keep track of items you love by tapping the heart icon on any product card.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
