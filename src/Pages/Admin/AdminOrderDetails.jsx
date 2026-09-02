import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, XCircle, AlertCircle, Save } from 'lucide-react';
import Loader from '../../Components/Admin/Loader';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getOrderById(id);
      if (res.order) {
        setOrder(res.order);
        setNewStatus(res.order.status || 'Pending');
        setTrackingNumber(res.order.trackingNumber || '');
      }
    } catch (err) {
      toast.error('Failed to load order');
      navigate('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await adminApi.updateOrderStatus(id, newStatus, statusNote, trackingNumber);
      toast.success(`Order status updated to ${newStatus}`);
      setOrder(res.order);
      setStatusNote('');
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading order details..." />;
  }

  if (!order) return null;

  const STATUS_STEPS = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIdx = STATUS_STEPS.indexOf(order.status === 'Pending' ? 'Order Placed' : order.status);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Order #{order.id}</h1>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">Fulfillment Progress</h3>
        
        <div className="relative flex items-center justify-between">
          {/* Progress bar background line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-zinc-800 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 to-emerald-500 z-0 transition-all duration-500"
            style={{
              width: `${currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%`
            }}
          />

          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-amber-400 font-bold' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4">Ordered Items</h3>

            <div className="divide-y divide-zinc-800/80">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={item.image || '/assets/images/cutouts/tshirt-black.png'}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Quantity: <span className="font-semibold text-zinc-200">{item.quantity || 1}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">${item.price}</p>
                    <p className="text-[11px] text-zinc-500">Total: ${item.price * (item.quantity || 1)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculation */}
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${order.subtotal || order.total}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Complimentary' : `$${order.shipping || 0}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Amount Paid</span>
                <span className="text-amber-400 text-base">${order.total}</span>
              </div>
            </div>
          </div>

          {/* Activity Log / Timeline notes */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4">Status Update History</h3>
            <div className="space-y-4">
              {(order.timeline || []).map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-zinc-200">{event.status}</p>
                      <span className="text-zinc-500 text-[10px]">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-zinc-400 mt-0.5">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details & Status Control */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Information</h3>
            <div>
              <p className="text-sm font-bold text-white">{order.customer?.name || 'Alexander Pierce'}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{order.customer?.email || 'alexander@example.com'}</p>
              <p className="text-xs text-zinc-400">{order.customer?.phone || '+1 (555) 234-5678'}</p>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Shipping Address</p>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {order.customer?.address || '742 Evergreen Terrace, Apt 4B, New York, NY 10001'}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Payment Details</p>
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                ✓ {order.paymentMethod || 'Credit Card'} • Paid
              </p>
            </div>
          </div>

          {/* Update Status Control */}
          <form onSubmit={handleUpdateStatus} className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Update Order Status</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Change Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-882910492"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Timeline Note (Optional)</label>
              <textarea
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Package picked up by courier service."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isUpdating ? 'Updating...' : 'Update Status'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
