import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, ShoppingBag, Sparkles, Shield, Mail, Phone, Calendar } from 'lucide-react';
import Loader from '../../Components/Admin/Loader';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUserById(id);
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      toast.error('Failed to load customer details');
      navigate('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  if (isLoading) {
    return <Loader message="Loading customer profile..." />;
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer Profile: {user.name}</h1>
          <p className="text-xs text-zinc-400">Detailed overview of order transactions and AI fitting room activity.</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs uppercase border border-amber-500/20">
                  {user.role}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {user.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order History */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-white">Purchase History ({user.orders?.length || 0})</h3>
            </div>
          </div>

          {(!user.orders || user.orders.length === 0) ? (
            <p className="text-xs text-zinc-500 py-4">No order history recorded for this user.</p>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-800/30 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-white">{order.id}</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{order.items?.length || 1} items • {order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">${order.total}</p>
                    <p className="text-[10px] text-zinc-500">{order.createdAt?.split('T')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Virtual Try-On Activity */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h3 className="text-base font-bold text-white">Virtual Try-On Sessions ({user.tryonHistory?.length || 0})</h3>
            </div>
          </div>

          {(!user.tryonHistory || user.tryonHistory.length === 0) ? (
            <p className="text-xs text-zinc-500 py-4">No virtual try-on activity logged for this user.</p>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {user.tryonHistory.map((tryon) => (
                <div key={tryon.id} className="py-3.5 flex items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={tryon.clothImageUrl || '/assets/images/cutouts/tshirt-black.png'}
                      alt="Garment"
                      className="w-10 h-10 object-contain rounded-lg bg-zinc-950 border border-zinc-800 p-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{tryon.productName}</p>
                      <p className="text-[11px] text-zinc-500">Model: {tryon.modelName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tryon.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {tryon.status}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1">{new Date(tryon.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
