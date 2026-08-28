import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../Components/AnnouncementBar';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import CartDrawer from '../Components/CartDrawer';
import SearchModal from '../Components/SearchModal';
import QuickViewModal from '../Components/QuickViewModal';
import VirtualTryOnStudio from '../Components/VirtualTryOnStudio';
import FloatingTryOnButton from '../Components/FloatingTryOnButton';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0b0e] text-white selection:bg-[#c87d4a] selection:text-white relative">
      {/* Top Promotional Bar */}
      <AnnouncementBar />

      {/* Global Header */}
      <Header />

      {/* Dynamic Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Fixed Floating "Try it on" Pill Button (Visible on all pages) */}
      <FloatingTryOnButton />

      {/* Global Interactive Modals & Drawers */}
      <CartDrawer />
      <SearchModal />
      <QuickViewModal />
      <VirtualTryOnStudio />
    </div>
  );
};

export default Layout;
