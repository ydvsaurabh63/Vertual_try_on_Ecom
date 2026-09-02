import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../Layout/Layout';

// Public Page Imports
import HomePage from '../Pages/HomePage';
import ShopPage from '../Pages/ShopPage';
import CategoryPage from '../Pages/CategoryPage';
import ProductDetailPage from '../Pages/ProductDetailPage';
import VirtualTryOnPage from '../Pages/VirtualTryOnPage';
import WishlistPage from '../Pages/WishlistPage';
import CartPage from '../Pages/CartPage';
import CheckoutPage from '../Pages/CheckoutPage';
import OrderSuccessPage from '../Pages/OrderSuccessPage';
import OrdersPage from '../Pages/OrdersPage';
import OrderTrackingPage from '../Pages/OrderTrackingPage';
import AccountPage from '../Pages/AccountPage';
import ProfilePage from '../Pages/ProfilePage';
import AddressesPage from '../Pages/AddressesPage';
import LoginPage from '../Pages/LoginPage';
import RegisterPage from '../Pages/RegisterPage';
import ForgotPasswordPage from '../Pages/ForgotPasswordPage';
import AboutPage from '../Pages/AboutPage';
import ContactPage from '../Pages/ContactPage';
import FAQPage from '../Pages/FAQPage';
import ShippingPage from '../Pages/ShippingPage';
import ReturnsPage from '../Pages/ReturnsPage';
import PrivacyPage from '../Pages/PrivacyPage';
import TermsPage from '../Pages/TermsPage';

// Admin Imports
import AdminProtectedRoute from './AdminProtectedRoute';
import AdminLayout from '../Components/Admin/AdminLayout';
import AdminLogin from '../Pages/Admin/AdminLogin';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import AdminProducts from '../Pages/Admin/AdminProducts';
import AdminAddEditProduct from '../Pages/Admin/AdminAddEditProduct';
import AdminCategories from '../Pages/Admin/AdminCategories';
import AdminOrders from '../Pages/Admin/AdminOrders';
import AdminOrderDetails from '../Pages/Admin/AdminOrderDetails';
import AdminUsers from '../Pages/Admin/AdminUsers';
import AdminUserDetails from '../Pages/Admin/AdminUserDetails';
import AdminVirtualTryOn from '../Pages/Admin/AdminVirtualTryOn';
import AdminApiUsage from '../Pages/Admin/AdminApiUsage';
import AdminSettings from '../Pages/Admin/AdminSettings';
import AdminProfile from '../Pages/Admin/AdminProfile';

const MainRoute = () => {
  return (
    <Routes>
      {/* ── Admin Login Route ──────────────────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Protected Admin Routes ────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Products */}
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminAddEditProduct />} />
        <Route path="products/edit/:id" element={<AdminAddEditProduct />} />

        {/* Categories */}
        <Route path="categories" element={<AdminCategories />} />

        {/* Orders */}
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />

        {/* Users */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetails />} />

        {/* Virtual Try-On & Monitoring */}
        <Route path="try-on" element={<AdminVirtualTryOn />} />
        <Route path="api-usage" element={<AdminApiUsage />} />

        {/* Settings & Profile */}
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* ── Main Customer Store Routes ────────────────────────────────────── */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:category" element={<CategoryPage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />
        <Route path="new-arrivals" element={<ShopPage />} />
        <Route path="sale" element={<ShopPage />} />
        <Route path="try-on" element={<VirtualTryOnPage />} />
        
        {/* User Cart & Wishlist Routes */}
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderTrackingPage />} />
        
        {/* Account & Auth Routes */}
        <Route path="account" element={<AccountPage />} />
        <Route path="account/profile" element={<ProfilePage />} />
        <Route path="account/addresses" element={<AddressesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        {/* Corporate & Support Pages */}
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        
        {/* Fallback 404 Route */}
        <Route path="*" element={<ShopPage />} />
      </Route>
    </Routes>
  );
};

export default MainRoute;
