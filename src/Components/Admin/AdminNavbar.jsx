import React, { useState, useEffect } from 'react';
import { Menu, Bell, Sparkles, User, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';

export const AdminNavbar = () => {
  const { setMobileSidebarOpen, adminUser, logout } = useAdminStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tunnelHealthy, setTunnelHealthy] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check backend health & tunnel
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setTunnelHealthy(Boolean(data.ok));
      })
      .catch(() => setTunnelHealthy(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Toggle & Left Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
            AURA ENGINE
          </span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400 font-medium">Virtual Try-On Management System</span>
        </div>
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Backend & AI Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tunnelHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${tunnelHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-zinc-300 font-medium">
            {tunnelHealthy ? 'AI Try-On Active' : 'Connecting Engine...'}
          </span>
        </div>

        {/* Try-On Studio Quick Jump */}
        <button
          onClick={() => navigate('/admin/try-on')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Try-On Studio</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <img
              src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt="Admin"
              className="w-8 h-8 rounded-xl object-cover border border-amber-500/30"
            />
            <span className="hidden sm:inline text-xs font-semibold text-zinc-200">{adminUser?.name?.split(' ')[0] || 'Admin'}</span>
          </button>

          {profileDropdownOpen && (
            <>
              <div
                onClick={() => setProfileDropdownOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                  <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{adminUser?.email || ''}</p>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/admin/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  Admin Profile
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  Website Settings
                </button>

                <div className="border-t border-zinc-800 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
