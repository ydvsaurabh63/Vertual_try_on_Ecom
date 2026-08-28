import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useUserStore } from '../store/useUserStore';
import { Truck, CheckCircle2, Clock, MapPin, Package, ArrowLeft, ShieldCheck } from 'lucide-react';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { orders } = useUserStore();

  const order = orders.find((o) => o.id === id) || {
    id: id || 'ORD-98421',
    date: 'August 24, 2026',
    status: 'Shipped',
    total: 735,
    items: [
      { name: 'Minimalist Cashmere Wool Coat', quantity: 1, price: 495, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80' },
      { name: 'Monochrome Oversized Silk Shirt', quantity: 1, price: 240, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80' }
    ],
    trackingNumber: 'TRK-882910492',
    estimatedDelivery: 'August 28, 2026',
  };

  const steps = [
    { title: 'Order Placed', time: 'August 24, 09:30 AM', completed: true },
    { title: 'Confirmed & Quality Check', time: 'August 24, 11:15 AM', completed: true },
    { title: 'Packed at Milan Hub', time: 'August 25, 02:40 PM', completed: true },
    { title: 'Shipped via Express', time: 'August 26, 06:00 AM', completed: true },
    { title: 'Out for Delivery', time: 'Expected Tomorrow', completed: false },
    { title: 'Delivered', time: 'Pending', completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Orders', path: '/orders' }, { label: `Tracking ${order.id}` }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#c87d4a] tracking-widest">LIVE PACKAGE TRACKING</span>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">Order #{order.id}</h1>
          <p className="text-xs text-white/50 font-light mt-0.5">Tracking Number: <strong className="text-white font-mono">{order.trackingNumber}</strong></p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4" />
          <span>Status: {order.status}</span>
        </div>
      </div>

      {/* Timeline Steps Component */}
      <div className="p-8 rounded-3xl bg-[#121216] border border-white/10 space-y-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shipment Milestone Progress</h3>

        <div className="relative border-l-2 border-white/10 ml-4 space-y-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative pl-8">
              {/* Dot */}
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                step.completed 
                  ? 'bg-[#c87d4a] border-[#c87d4a] text-white shadow-lg' 
                  : 'bg-[#121216] border-white/20'
              }`}>
                {step.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>

              <div>
                <p className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-white/40'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-white/40 mt-0.5 font-light">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courier & Items Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Courier Information</h4>
          <p className="text-xs text-white/70">Carrier: <strong>FedEx International Express</strong></p>
          <p className="text-xs text-white/70">Estimated Delivery: <strong className="text-emerald-400">{order.estimatedDelivery}</strong></p>
          <p className="text-xs text-white/50">Signature required upon delivery.</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Package Contents</h4>
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs text-white/80">
              <Package className="w-4 h-4 text-[#c87d4a]" />
              <span>{item.name} (x{item.quantity})</span>
            </div>
          ))}
        </div>

      </div>

      <div className="pt-4 text-center">
        <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

    </div>
  );
};

export default OrderTrackingPage;
