import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useCartStore } from '../store/useCartStore';
import { ShoppingBag, Trash2, Plus, Minus, Tag, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />

      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[#c87d4a]" />
            <span>Shopping Bag</span>
          </h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            Review your selected items before moving to secure checkout.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-white/50 hover:text-rose-400 underline transition-colors"
          >
            Empty Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 rounded-3xl bg-[#121216] border border-white/10 p-8">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Your bag is currently empty</h3>
          <p className="text-sm text-white/50 max-w-sm">
            Explore our curated luxury collections and add your favorite pieces to the bag.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <div 
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#121216] border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-2xl bg-[#18181c] border border-white/10"
                  />
                  <div className="space-y-1">
                    <Link to={`/product/${item.slug}`} className="font-semibold text-base text-white hover:text-[#c87d4a] transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-xs text-white/50">
                      Color: <span className="text-white font-medium">{item.selectedColor}</span> • Size: <span className="text-white font-medium">{item.selectedSize}</span>
                    </p>
                    <p className="text-sm font-bold text-[#c87d4a] sm:hidden">${item.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  {/* Quantity */}
                  <div className="flex items-center border border-white/10 rounded-xl bg-black/30">
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, -1)}
                      className="p-2 text-white/60 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, 1)}
                      className="p-2 text-white/60 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="hidden sm:block text-base font-bold text-white">${item.price * item.quantity}</p>

                  <button
                    onClick={() => removeItem(item.id, item.selectedColor, item.selectedSize)}
                    className="p-2 text-white/40 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT: Order Summary Card */}
          <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider pb-3 border-b border-white/10">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Apply
              </button>
            </form>

            {couponCode && (
              <div className="flex items-center justify-between text-xs bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] px-3 py-2 rounded-xl">
                <span>Code <strong>{couponCode}</strong> applied</span>
                <button onClick={removeCoupon} className="text-xs underline hover:text-white">Remove</button>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-3 text-xs text-white/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-semibold">${subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#c87d4a]">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-white font-semibold">
                  {shipping === 0 ? <strong className="text-emerald-400">Complimentary FREE</strong> : `$${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-white/10">
                <span>Grand Total</span>
                <span className="text-[#c87d4a] text-xl">${grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c87d4a]/25 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 pt-2 border-t border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Complimentary Returns • SSL 256-bit Encrypted</span>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;
