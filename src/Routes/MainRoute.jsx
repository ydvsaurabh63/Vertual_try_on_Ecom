import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../Layout/Layout';

// Page Imports
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

const MainRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Main Store Routes */}
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
