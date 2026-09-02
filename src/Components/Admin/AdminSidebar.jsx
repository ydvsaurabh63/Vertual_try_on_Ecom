import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Sparkles,
  Activity,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Store
} from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';

export const AdminSidebar = () => {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    logout,
    adminUser
  } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Catalog & Sales',
      items: [
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Categories', path: '/admin/categories', icon: Layers },
        { label: 'Orders', path: '/admin/orders', icon: ShoppingBag }
      ]
    },
    {
      title: 'Customer & AI Studio',
      items: [
        { label: 'Customers', path: '/admin/users', icon: Users },
        { label: 'Virtual Try-On', path: '/admin/try-on', icon: Sparkles, badge: 'AI' },
        { label: 'API Usage', path: '/admin/api-usage', icon: Activity }
      ]
    },
    {
      title: 'System & Preferences',
      items: [
        { label: 'Website Settings', path: '/admin/settings', icon: Settings },
        { label: 'Admin Profile', path: '/admin/profile', icon: User }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              A
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider text-white">AURA STUDIO</span>
                <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-widest">Admin Portal</span>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <h5 className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  {section.title}
                </h5>
              )}
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Quick link to live store */}
        <div className="px-3 py-2 border-t border-zinc-800/80">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-all"
          >
            <Store className="w-4 h-4 shrink-0 text-amber-500" />
            {!sidebarCollapsed && <span className="flex-1 truncate">View Live Store</span>}
            {!sidebarCollapsed && <ExternalLink className="w-3 h-3 text-zinc-500" />}
          </a>
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt="Admin"
                  className="w-8 h-8 rounded-xl object-cover border border-zinc-700 shrink-0"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-zinc-200 truncate">{adminUser?.name || 'Administrator'}</span>
                  <span className="text-[10px] text-zinc-500 truncate">{adminUser?.email || ''}</span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
