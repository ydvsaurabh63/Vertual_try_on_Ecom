import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../Components/HeroSection';
import CategoryCard from '../Components/CategoryCard';
import ProductGrid from '../Components/ProductGrid';
import BrandValues from '../Components/BrandValues';
import Newsletter from '../Components/Newsletter';
import { ArrowRight, Sparkles, Shirt, Award } from 'lucide-react';
import { useTryOnStore } from '../store/useTryOnStore';
import { useProductStore } from '../store/useProductStore';

const HomePage = () => {
  const openTryOn = useTryOnStore((state) => state.openTryOn);
  const { products, categories } = useProductStore();

  const featuredProducts = products.filter((p) => p.featured || p.isFeatured).slice(0, 4);
  const bestSellers = (featuredProducts.length ? products : products.slice(0, 4)).slice(0, 4);
  const mainCategories = categories.filter((c) => c.slug !== 'all');

  return (
    <div className="space-y-12 sm:space-y-20 pb-8">
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">
              EXPLORE COLLECTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
              Curated Fashion Categories
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c87d4a] hover:underline uppercase tracking-wider mt-2 md:mt-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {mainCategories.slice(0, 4).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 3. Virtual Fitting Room Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#121216] border border-white/10 overflow-hidden p-5 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          
          {/* Left Text */}
          <div className="max-w-xl space-y-3 sm:space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEXT-GEN SHOPPING EXPERIENCE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Virtual Try-On Fitting Room
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
              Preview how luxury suits, cashmere coats, and mulberry silk shirts look on live mannequin models before adding to your bag.
            </p>
            <div className="pt-2">
              <button
                onClick={() => openTryOn(null)}
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white font-semibold text-xs tracking-wider uppercase shadow-xl shadow-[#c87d4a]/25 transition-all transform hover:-translate-y-0.5"
              >
                <Shirt className="w-4 h-4" />
                <span>Launch Interactive Studio</span>
              </button>
            </div>
          </div>

          {/* Right Image Composite - Studio Mannequin Fitting Room */}
          <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
              alt="3D Studio Fitting Room Preview"
              className="w-full h-full object-cover filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
              <div className="text-xs text-white/90">
                <p className="font-bold text-white">3D Studio Mannequin</p>
                <p className="text-[10px] text-white/60">Wearing Minimalist Cashmere Coat • Size M</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">
              FEATURED PIECES
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
              New Season Signature Items
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c87d4a] hover:underline uppercase tracking-wider mt-2 md:mt-0"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>

      {/* 5. Editorial Split Showcase Banners (Isolated Clothes & Tailoring) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          <div className="relative min-h-[360px] sm:h-[480px] rounded-3xl overflow-hidden border border-white/10 group flex items-end p-6 sm:p-8">
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80"
              alt="Women's Autumn Couture"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/30 to-transparent" />
            
            <div className="relative z-10 space-y-2 sm:space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-[#c87d4a] uppercase">CAPSULE EDITION</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">Autumn Minimalist Elegance</h3>
              <p className="text-xs text-white/70 font-light max-w-sm">Draped wool coats, trench tailoring, and pure Mulberry silk blouses.</p>
              <Link
                to="/shop?category=women"
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#c87d4a] uppercase tracking-wider pt-2"
              >
                <span>Shop Women</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[360px] sm:h-[480px] rounded-3xl overflow-hidden border border-white/10 group flex items-end p-6 sm:p-8">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"
              alt="Men's Tailored Collection"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/30 to-transparent" />
            
            <div className="relative z-10 space-y-2 sm:space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-[#c87d4a] uppercase">MILANO TAILORING</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">Modern Gentleman Suits</h3>
              <p className="text-xs text-white/70 font-light max-w-sm">Double-breasted suit jackets, Italian calfskin chelsea boots, and merino knitwear.</p>
              <Link
                to="/shop?category=men"
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#c87d4a] uppercase tracking-wider pt-2"
              >
                <span>Shop Men</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Best Sellers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#c87d4a]">
              MOST LOVED
            </span>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight mt-1">
              Top Rated Best Sellers
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c87d4a] hover:underline uppercase tracking-wider mt-2 md:mt-0"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={bestSellers} />
      </section>

      {/* 7. Brand Values */}
      <BrandValues />

      {/* 8. Newsletter */}
      <Newsletter />

    </div>
  );
};

export default HomePage;
