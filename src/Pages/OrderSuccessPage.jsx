import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Calendar, MapPin } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order || {
    id: 'ORD-98421',
    date: 'August 26, 2026',
    status: 'Confirmed',
    total: 495,
    items: [
      { name: 'Minimalist Cashmere Wool Coat', quantity: 1, price: 495, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80' }
    ],
    shippingAddress: '742 Evergreen Terrace, New York, NY 10001',
    trackingNumber: 'TRK-882910492',
    estimatedDelivery: '3-5 Business Days',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 text-center space-y-6 sm:space-y-8">
      
      {/* Success Badge */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 flex items-center justify-center text-[#c87d4a] animate-bounce">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#c87d4a]">
          THANK YOU FOR YOUR PURCHASE
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
          Order Confirmed #{order.id}
        </h1>
        <p className="text-xs sm:text-sm text-white/60 max-w-md font-light">
          We've received your order and sent a confirmation receipt to your email. Your items are being prepared for express dispatch.
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#121216] border border-white/10 text-left space-y-5 sm:space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-white/10 text-xs">
          <div>
            <span className="text-white/40 block">Order ID</span>
            <strong className="text-white font-mono">{order.id}</strong>
          </div>
          <div>
            <span className="text-white/40 block">Estimated Delivery</span>
            <strong className="text-emerald-400 font-semibold">{order.estimatedDelivery}</strong>
          </div>
          <div>
            <span className="text-white/40 block">Tracking Number</span>
            <strong className="text-[#c87d4a] font-mono">{order.trackingNumber}</strong>
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ordered Items</h4>
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-xl bg-[#18181c]" />
                <div>
                  <p className="text-xs font-bold text-white">{item.name}</p>
                  <p className="text-[10px] text-white/50">Qty: {item.quantity} • ${item.price} each</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#c87d4a]">${item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Address & Total */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#c87d4a]" />
            <span>Shipping to: <strong>{order.shippingAddress}</strong></span>
          </div>
          <div className="text-base font-bold text-white">
            Total Paid: <span className="text-[#c87d4a]">${order.total}</span>
          </div>
        </div>

      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c87d4a]/25 transition-all"
        >
          <Truck className="w-4 h-4" />
          <span>Track Delivery Status</span>
        </Link>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccessPage;
