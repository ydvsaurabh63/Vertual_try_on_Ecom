import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import StatCard from '../../Components/Admin/StatCard';
import { RevenueLineChart, ActivityBarChart, CategoryDistribution } from '../../Components/Admin/AdminCharts';
import Loader from '../../Components/Admin/Loader';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDashboardStats();
      setData(res);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <Loader message="Loading dashboard metrics..." />;
  }

  const { stats, monthlyRevenue, weeklySales, categoryStats, recentOrders, recentUsers, lowStockProducts } = data || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time overview of orders, inventory, and Virtual Try-On activity.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products/new')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            + Add Product
          </button>
          <button
            onClick={() => navigate('/admin/try-on')}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-amber-400 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try-On Logs</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">
                {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's are' : ' is'} Running Low on Stock
              </p>
              <p className="text-xs text-zinc-400">
                {lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/products?stock=low-stock')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold shrink-0 cursor-pointer"
          >
            Manage Stock
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend="+18.4%"
          trendLabel="vs last month"
          colorScheme="amber"
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          trend={`+${stats?.todayOrders || 0} today`}
          subtitle={`${stats?.pendingOrders || 0} pending`}
          colorScheme="emerald"
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          title="Active Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          subtitle={`${stats?.totalCategories || 0} categories`}
          colorScheme="blue"
          onClick={() => navigate('/admin/products')}
        />
        <StatCard
          title="Virtual Try-Ons"
          value={stats?.totalTryOns || 0}
          icon={Sparkles}
          trend="AI Engine"
          subtitle="Real-time photorealistic sessions"
          colorScheme="purple"
          onClick={() => navigate('/admin/try-on')}
        />
      </div>

      {/* Secondary Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 uppercase font-semibold">Pending Orders</p>
            <p className="text-lg font-bold text-white">{stats?.pendingOrders || 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 uppercase font-semibold">Processing</p>
            <p className="text-lg font-bold text-white">{stats?.processingOrders || 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 uppercase font-semibold">Delivered</p>
            <p className="text-lg font-bold text-white">{stats?.deliveredOrders || 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 uppercase font-semibold">Registered Users</p>
            <p className="text-lg font-bold text-white">{stats?.totalUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Revenue Analytics</h3>
              <p className="text-xs text-zinc-400">Sales performance over time</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              USD ($)
            </span>
          </div>
          <RevenueLineChart data={monthlyRevenue} height={230} />
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Inventory by Category</h3>
              <Layers className="w-4 h-4 text-zinc-400" />
            </div>
            <CategoryDistribution categories={categoryStats} />
          </div>
          <button
            onClick={() => navigate('/admin/categories')}
            className="mt-6 w-full py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Manage Categories →
          </button>
        </div>
      </div>

      {/* Weekly Try-On vs Sales Activity */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Weekly AI Try-On & Sales Correlation</h3>
            <p className="text-xs text-zinc-400">Correlation between virtual try-on requests and garment orders</p>
          </div>
          <button
            onClick={() => navigate('/admin/api-usage')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>API Usage Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <ActivityBarChart data={weeklySales} height={200} />
      </div>

      {/* Tables Row: Recent Orders & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Orders</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              View All ({stats?.totalOrders || 0})
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {(recentOrders || []).map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-800/30 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{order.id}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'Shipped'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{order.customer?.name} • {order.items?.length || 1} items</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-400">${order.total}</p>
                  <p className="text-[10px] text-zinc-500">{order.createdAt?.split('T')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Customers</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              View All ({stats?.totalUsers || 0})
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {(recentUsers || []).map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-800/30 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover border border-zinc-700"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-semibold text-zinc-300">
                    {user.totalOrders} Orders
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-1">{user.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
