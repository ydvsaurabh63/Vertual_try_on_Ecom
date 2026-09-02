import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { 
    items, 
    isDrawerOpen, 
    closeDrawer, 
    removeItem, 
    updateQuantity, 
    couponCode, 
    discountPercent,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getGrandTotal
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    if (res.success) {
      toast.success(res.message);
      setInputCoupon('');
    } else {
      toast.error(res.message);
    }
  };

  const handleProceedCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#121216] border-l border-white/10 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 font-serif text-base sm:text-lg font-bold">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#c87d4a]" />
              <span>SHOPPING BAG ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 sm:p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-white/50 py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-medium text-white/80">Your bag is currently empty</p>
                <p className="text-xs text-white/50 max-w-xs">Explore our latest luxury collections and elevate your style today.</p>
                <Link
                  to="/shop"
                  onClick={closeDrawer}
                  className="px-6 py-3 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-contain p-2 rounded-xl bg-[#18181c] border border-white/10"
                  />
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link 
                          to={`/product/${item.slug}`} 
                          onClick={closeDrawer} 
                          className="font-semibold text-sm hover:text-[#c87d4a] line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id, item.selectedColor, item.selectedSize)}
                          className="text-white/40 hover:text-rose-400 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        Color: <span className="text-white/80">{item.selectedColor}</span> • Size: <span className="text-white/80">{item.selectedSize}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-white/10 rounded-lg bg-black/20">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, -1)}
                          className="p-1 text-white/60 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, 1)}
                          className="p-1 text-white/60 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-sm font-bold text-white">
                        ${item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-white/10 space-y-4 bg-[#0e0e12]">
              
              {/* Coupon code input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#c87d4a] text-white text-xs font-semibold transition-colors flex-shrink-0"
                >
                  Apply
                </button>
              </form>

              {/* Coupon status badge */}
              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] px-3 py-1.5 rounded-lg">
                  <span>Coupon <strong>{couponCode}</strong> applied ({discountPercent}%)</span>
                  <button onClick={removeCoupon} className="text-xs underline hover:text-white">Remove</button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-white/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#c87d4a]">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-${discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-medium">
                    {shipping === 0 ? <strong className="text-emerald-400">FREE</strong> : `$${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#c87d4a] text-lg">${grandTotal}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-semibold text-sm tracking-wide shadow-xl shadow-[#c87d4a]/20 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted 256-bit SSL Secure Checkout</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
