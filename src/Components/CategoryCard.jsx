import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className="group relative h-80 rounded-3xl overflow-hidden bg-[#121216] border border-white/10 flex flex-col justify-end p-6 transition-all duration-500 hover:border-white/30 hover:shadow-2xl"
    >
      {/* Background Editorial Image */}
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-110 transition-all duration-700"
      />

      {/* Dark Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/40 to-transparent" />

      {/* Content Overlay */}
      <div className="relative z-10 flex items-end justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c87d4a] uppercase">
            {category.count || 12} PRODUCTS
          </span>
          <h3 className="text-2xl font-bold text-white group-hover:text-[#c87d4a] transition-colors mt-0.5">
            {category.name}
          </h3>
        </div>

        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#c87d4a] group-hover:border-[#c87d4a] transition-all transform group-hover:rotate-45">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
