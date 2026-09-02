import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import { ShieldCheck, CreditCard, Banknote, Smartphone, Check, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getDiscountAmount, getShippingFee, getGrandTotal, clearCart } = useCartStore();
  const { user, addOrder } = useUserStore();

  const [formData, setFormData] = useState({
    fullName: user?.name || 'Alexander Pierce',
    email: user?.email || 'alexander@example.com',
    phone: user?.phone || '+1 (555) 234-5678',
    address: '742 Evergreen Terrace',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    paymentMethod: 'card', // 'card' | 'upi' | 'cod'
    cardNumber: '4532 •••• •••• 8892',
    cardExpiry: '12/28',
    cardCvc: '•••',
  });

  const [errors, setErrors] = useState({});

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const grandTotal = getGrandTotal();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // Simple Validation check
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.address.trim()) newErrors.address = 'Shipping address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zip.trim()) newErrors.zip = 'Postal code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please complete all required shipping fields');
      return;
    }

    // Create Order Object
    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Confirmed',
      total: grandTotal,
      subtotal: subtotal,
      shipping: shippingFee,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        color: item.selectedColor,
        size: item.selectedSize
      })),
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.apartment ? formData.apartment + ', ' : ''}${formData.city}, ${formData.state} ${formData.zip}`
      },
      shippingAddress: `${formData.address}, ${formData.apartment ? formData.apartment + ', ' : ''}${formData.city}, ${formData.state} ${formData.zip}`,
      paymentMethod: formData.paymentMethod.toUpperCase(),
      trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
      estimatedDelivery: '3-5 Business Days',
    };

    // Save to Backend DB dynamically
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch(err => console.warn('Order sync note:', err));
    } catch (e) {
      console.warn('Backend order sync note:', e);
    }

    addOrder(newOrder);
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/order-success', { state: { order: newOrder } });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your bag is empty</h2>
        <p className="text-xs text-white/50">Add items to your shopping bag before proceeding to checkout.</p>
        <button onClick={() => navigate('/shop')} className="px-6 py-3 rounded-full bg-[#c87d4a] text-white text-xs font-bold uppercase">
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Bag', path: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-3xl font-serif font-bold text-white">Express Luxury Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT: Multi-step Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Contact Information */}
          <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#c87d4a] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Contact Information</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-white/40 focus:outline-none ${
                    errors.fullName ? 'border-rose-500' : 'border-white/10 focus:border-[#c87d4a]'
                  }`}
                />
                {errors.fullName && <p className="text-[10px] text-rose-400 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-white/40 focus:outline-none ${
                    errors.email ? 'border-rose-500' : 'border-white/10 focus:border-[#c87d4a]'
                  }`}
                />
                {errors.email && <p className="text-[10px] text-rose-400 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#c87d4a] text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Shipping Address</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-white/40 focus:outline-none ${
                    errors.address ? 'border-rose-500' : 'border-white/10 focus:border-[#c87d4a]'
                  }`}
                />
                {errors.address && <p className="text-[10px] text-rose-400 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase block mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase block mb-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#c87d4a] text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Payment Option</span>
            </h3>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-row xs:flex-col items-center justify-center gap-2 transition-all ${
                  formData.paymentMethod === 'card'
                    ? 'bg-[#c87d4a]/20 border-[#c87d4a] text-white font-bold'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#c87d4a]" />
                <span className="text-xs">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-row xs:flex-col items-center justify-center gap-2 transition-all ${
                  formData.paymentMethod === 'upi'
                    ? 'bg-[#c87d4a]/20 border-[#c87d4a] text-white font-bold'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#c87d4a]" />
                <span className="text-xs">UPI / Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-row xs:flex-col items-center justify-center gap-2 transition-all ${
                  formData.paymentMethod === 'cod'
                    ? 'bg-[#c87d4a]/20 border-[#c87d4a] text-white font-bold'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-[#c87d4a]" />
                <span className="text-xs">Cash on Delivery</span>
              </button>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                  placeholder="Card Number"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    name="cardCvc"
                    value={formData.cardCvc}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    placeholder="CVC"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Order Summary & Place Order CTA */}
        <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-white/10">
            Order Review ({items.length} Items)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-white/80">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-12 rounded-lg object-cover bg-[#18181c]" />
                  <div>
                    <p className="font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-white/50">Qty: {item.quantity} • {item.selectedSize}</p>
                  </div>
                </div>
                <span className="font-bold text-white">${item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-white/60 pt-3 border-t border-white/10">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white font-semibold">${subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#c87d4a]">
                <span>Discount</span>
                <span>-${discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
              <span>Total Pay</span>
              <span className="text-[#c87d4a] text-xl">${grandTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c87d4a]/25 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Confirm & Place Order (${grandTotal})</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed 256-bit Encrypted Checkout</span>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;
