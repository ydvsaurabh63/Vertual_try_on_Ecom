import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Shirt,
  ChevronDown,
  LayoutGrid,
  Sparkles,
  Flame,
  Tag,
  Star,
  HelpCircle,
  Truck,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useSearchStore } from '../store/useSearchStore';
import { useThemeStore } from '../store/useThemeStore';
import { useUserStore } from '../store/useUserStore';
import { useTryOnStore } from '../store/useTryOnStore';

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);

  const itemCount = useCartStore((state) => state.getItemCount());
  const openCartDrawer = useCartStore((state) => state.openDrawer);
  const wishlistItems = useWishlistStore((state) => state.items);
  const openSearch = useSearchStore((state) => state.openSearch);
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user } = useUserStore();
  const openTryOn = useTryOnStore((state) => state.openTryOn);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/shop', hasMegaMenu: true },
    { name: 'NEW ARRIVALS', path: '/new-arrivals' },
    { name: 'SALE', path: '/sale' },
  ];

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0b0b0e]/95 backdrop-blur-md border-b border-white/10 shadow-xl py-3.5' 
          : 'bg-[#0b0b0e] border-b border-white/10 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile menu hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Left Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              if (link.hasMegaMenu) {
                return (
                  <div 
                    key={link.name} 
                    className="relative group py-2"
                    onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                    onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsShopMegaMenuOpen(false)}
                      className={`text-xs font-semibold tracking-widest transition-colors flex items-center gap-1 ${
                        isActive || isShopMegaMenuOpen
                          ? 'text-white font-bold' 
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isShopMegaMenuOpen ? 'rotate-180 text-[#c87d4a]' : 'text-white/40'}`} />
                      {(isActive || isShopMegaMenuOpen) && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c87d4a]" />
                      )}
                    </Link>

                    {/* Mega Menu Dropdown matching reference website screenshot */}
                    {isShopMegaMenuOpen && (
                      <div 
                        className="absolute left-0 top-full mt-1 w-[820px] bg-[#16161a] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl z-50 animate-fadeIn text-white"
                        onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                        onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                      >
                        <div className="grid grid-cols-4 gap-6">
                          
                          {/* Col 1: SHOP */}
                          <div className="space-y-4">
                            <h4 className="text-[11px] font-mono font-bold tracking-widest text-white/40 uppercase">
                              SHOP
                            </h4>
                            <ul className="space-y-2 text-xs">
                              <li>
                                <Link 
                                  to="/shop" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-medium">All Products</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/new-arrivals" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-medium">New Arrivals</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/shop?sortBy=rating" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <Flame className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-medium">Best Sellers</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/sale" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <Tag className="w-3.5 h-3.5 text-[#c87d4a]" />
                                  </div>
                                  <span className="font-medium text-[#c87d4a]">On Sale</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/shop?sortBy=featured" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <Star className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-medium">Featured</span>
                                </Link>
                              </li>
                            </ul>
                          </div>

                          {/* Col 2: CATEGORIES */}
                          <div className="space-y-4">
                            <h4 className="text-[11px] font-mono font-bold tracking-widest text-white/40 uppercase">
                              CATEGORIES
                            </h4>
                            <ul className="space-y-2 text-xs">
                              <li>
                                <Link 
                                  to="/shop?category=women" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <img 
                                    src="https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=100&q=80" 
                                    alt="T-Shirts" 
                                    className="w-7 h-7 rounded-lg object-cover border border-white/10" 
                                  />
                                  <span className="font-medium">T-Shirts</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/shop?category=men" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <img 
                                    src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=100&q=80" 
                                    alt="Hoodies & Sweaters" 
                                    className="w-7 h-7 rounded-lg object-cover border border-white/10" 
                                  />
                                  <span className="font-medium">Hoodies & Sweaters</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/shop?category=men" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <img 
                                    src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=100&q=80" 
                                    alt="Jackets & Outerwear" 
                                    className="w-7 h-7 rounded-lg object-cover border border-white/10" 
                                  />
                                  <span className="font-medium">Jackets & Outerwear</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/shop?category=women" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <img 
                                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=100&q=80" 
                                    alt="Pants & Trousers" 
                                    className="w-7 h-7 rounded-lg object-cover border border-white/10" 
                                  />
                                  <span className="font-medium">Pants & Trousers</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/shop?category=women" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <img 
                                    src="https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=100&q=80" 
                                    alt="Shirts" 
                                    className="w-7 h-7 rounded-lg object-cover border border-white/10" 
                                  />
                                  <span className="font-medium">Shirts</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/shop?category=shoes" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <img 
                                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=100&q=80" 
                                    alt="Shoes & Sneakers" 
                                    className="w-7 h-7 rounded-lg object-cover border border-white/10" 
                                  />
                                  <span className="font-medium">Shoes & Sneakers</span>
                                </Link>
                              </li>
                            </ul>
                          </div>

                          {/* Col 3: EXPLORE */}
                          <div className="space-y-4">
                            <h4 className="text-[11px] font-mono font-bold tracking-widest text-white/40 uppercase">
                              EXPLORE
                            </h4>
                            <ul className="space-y-2 text-xs">
                              <li>
                                <Link 
                                  to="/faq" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-medium">FAQ</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/orders" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-medium">Track Order</span>
                                </Link>
                              </li>

                              <li>
                                <Link 
                                  to="/contact" 
                                  onClick={() => setIsShopMegaMenuOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c87d4a] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                                    <Mail className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-medium">Contact</span>
                                </Link>
                              </li>
                            </ul>
                          </div>

                          {/* Col 4: FEATURED PROMO CARD matching screenshot */}
                          <div className="relative rounded-2xl overflow-hidden border border-white/10 h-full min-h-[220px] flex flex-col justify-end p-5 group">
                            <img
                              src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80"
                              alt="Spring Collection 2026"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            <div className="relative z-10 space-y-1.5">
                              <span className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                                NEW ARRIVALS
                              </span>
                              <h3 className="text-lg font-serif font-bold text-white leading-tight">
                                Spring Collection 2026
                              </h3>
                              <Link
                                to="/new-arrivals"
                                onClick={() => setIsShopMegaMenuOpen(false)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-[#c87d4a] pt-1 transition-colors"
                              >
                                <span>New Arrivals</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-semibold tracking-widest transition-colors relative py-1 ${
                    isActive 
                      ? 'text-white font-bold' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c87d4a]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Brand Logo - Centered / Primary visual */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-block group">
              <span className="text-2xl font-serif tracking-[0.25em] font-bold text-white uppercase group-hover:text-[#c87d4a] transition-colors">
                STORE
              </span>
            </Link>
          </div>

          {/* Right Action Icons & Controls matching reference website */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            
            {/* Language Selector Dropdown (Desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 transition-colors"
              >
                <span className="text-xs">🇺🇸</span>
                <span>EN</span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[#121216] border border-white/10 rounded-lg shadow-2xl py-1 z-50 text-xs text-white/80">
                  <button onClick={() => setIsLangMenuOpen(false)} className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2">
                    <span>🇺🇸</span> English (US)
                  </button>
                  <button onClick={() => setIsLangMenuOpen(false)} className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2">
                    <span>🇫🇷</span> Français
                  </button>
                  <button onClick={() => setIsLangMenuOpen(false)} className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2">
                    <span>🇮🇹</span> Italiano
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex"
              title="Toggle theme"
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Search Input Trigger matching Ctrl+K pill style in reference */}
            <button
              onClick={openSearch}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs"
              aria-label="Open search modal"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Search</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-white/50 rounded border border-white/10">
                Ctrl+K
              </kbd>
            </button>

            {/* Try-On Studio Quick Action Icon */}
            <button
              onClick={() => openTryOn(null)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white transition-all text-xs font-bold shadow-md shadow-[#c87d4a]/25 transform hover:scale-105 active:scale-95"
              title="Virtual Try-On Studio"
              aria-label="Open Virtual Try-On Studio"
            >
              <Shirt className="w-3.5 h-3.5 text-white" />
              <span className="hidden xs:inline sm:inline">Try On</span>
            </button>

            {/* Account Icon */}
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title={isAuthenticated ? `Account (${user?.name})` : "Sign In"}
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 text-white/80 hover:text-white transition-colors relative hidden sm:block"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#c87d4a] rounded-full animate-ping" />
              )}
            </Link>

            {/* Shopping Bag / Cart Icon with Badge matching reference */}
            <button
              onClick={openCartDrawer}
              className="p-2 text-white/80 hover:text-white transition-colors relative"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c87d4a] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0b0b0e]">
                  {itemCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[56px] sm:top-[60px] z-50 bg-[#0b0b0e]/98 backdrop-blur-2xl border-t border-white/10 flex flex-col justify-between p-5 sm:p-6 overflow-y-auto max-h-[calc(100vh-56px)] animate-fadeIn">
          <div className="space-y-6">
            
            {/* Main Page Links */}
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-semibold tracking-wider transition-colors py-1 ${
                    location.pathname === link.path ? 'text-[#c87d4a]' : 'text-white/90 hover:text-[#c87d4a]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <hr className="border-white/10" />

            {/* Mobile Category Shortcuts */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-widest text-white/40 uppercase block mb-2">
                COLLECTIONS
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/shop?category=t-shirts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  T-Shirts
                </Link>
                <Link
                  to="/shop?category=hoodies-sweatshirts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Hoodies
                </Link>
                <Link
                  to="/shop?category=jackets-outerwear"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Jackets
                </Link>
                <Link
                  to="/shop?category=pants-trousers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Pants
                </Link>
                <Link
                  to="/shop?category=shirts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Shirts
                </Link>
                <Link
                  to="/shop?category=shoes-sneakers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Shoes
                </Link>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openTryOn(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c87d4a] text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-[#c87d4a]/20"
              >
                <Shirt className="w-4 h-4" />
                <span>Virtual Try-On Studio</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-medium"
                >
                  <Heart className="w-3.5 h-3.5 text-[#c87d4a]" />
                  <span>Wishlist ({wishlistItems.length})</span>
                </Link>

                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-medium"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer inside mobile drawer */}
          <div className="pt-6 mt-6 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-between">
            <span>STORE © 2026</span>
            <div className="flex items-center gap-3">
              <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white">FAQ</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white">Contact</Link>
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white">Track</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
