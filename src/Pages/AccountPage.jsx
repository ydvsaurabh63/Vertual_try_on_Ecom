import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useUserStore } from '../store/useUserStore';
import { User, Package, MapPin, Heart, LogOut, Shield, ChevronRight, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navCards = [
    { title: 'Order History', desc: 'Track active orders and view past receipts', icon: Package, path: '/orders' },
    { title: 'Personal Profile', desc: 'Update name, email, phone and preferences', icon: User, path: '/account/profile' },
    { title: 'Saved Addresses', desc: 'Manage primary and secondary shipping locations', icon: MapPin, path: '/account/addresses' },
    { title: 'Saved Wishlist', desc: 'View your bookmarked luxury fashion pieces', icon: Heart, path: '/wishlist' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'My Account' }]} />

      {/* User Info Header */}
      <div className="p-5 sm:p-8 rounded-3xl bg-[#121216] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#c87d4a]"
          />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c87d4a]/20 text-[#c87d4a] uppercase">VIP Member</span>
            </div>
            <p className="text-xs text-white/50 mt-1">{user?.email} • Member since {user?.memberSince}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 text-xs font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.path}
              className="group p-6 rounded-3xl bg-[#121216] border border-white/10 hover:border-[#c87d4a]/50 flex items-center justify-between transition-all hover:shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-[#c87d4a] text-white/70 group-hover:text-white flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#c87d4a] transition-colors">{card.title}</h3>
                  <p className="text-xs text-white/50 font-light mt-0.5">{card.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#c87d4a] transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AccountPage;
