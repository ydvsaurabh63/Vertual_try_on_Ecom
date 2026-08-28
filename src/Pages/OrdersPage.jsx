import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useUserStore } from '../store/useUserStore';
import { Package, Truck, ArrowRight, ChevronRight, Clock } from 'lucide-react';

const OrdersPage = () => {
  const { orders } = useUserStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Account', path: '/account' }, { label: 'Order History' }]} />

      <div>
        <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
          <Package className="w-7 h-7 text-[#c87d4a]" />
          <span>My Order History</span>
        </h1>
        <p className="text-xs text-white/50 mt-1 font-light">
          Track active shipments and view past receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 rounded-3xl bg-[#121216] border border-white/10 p-8">
          <Package className="w-12 h-12 text-white/30" />
          <h3 className="text-lg font-bold text-white">No orders placed yet</h3>
          <p className="text-xs text-white/50">When you purchase items, your order history will appear here.</p>
          <Link to="/shop" className="px-6 py-3 rounded-full bg-[#c87d4a] text-white text-xs font-bold uppercase">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
              
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">{order.id}</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#c87d4a]/20 text-[#c87d4a] border border-[#c87d4a]/40">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Placed on {order.date}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-white/40 block">Total Amount</span>
                    <span className="text-base font-bold text-white">${order.total}</span>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#c87d4a]" />
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5">
                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-xl bg-[#18181c]" />
                    <div className="text-xs">
                      <p className="font-semibold text-white line-clamp-1">{item.name}</p>
                      <p className="text-white/50 text-[10px]">Qty: {item.quantity} • ${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
