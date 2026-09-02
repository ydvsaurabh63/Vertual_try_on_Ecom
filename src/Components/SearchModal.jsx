import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, History, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import { useProductStore } from '../store/useProductStore';

const SearchModal = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { isOpen, closeSearch, query, setQuery, history, addHistory, clearHistory } = useSearchStore();
  const { products } = useProductStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = query.trim() === '' ? [] : products.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleSelectProduct = (product) => {
    addHistory(product.name);
    closeSearch();
    navigate(`/product/${product.slug}`);
  };

  const handleSearchTagClick = (tag) => {
    setQuery(tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      
      <div 
        className="fixed inset-0"
        onClick={closeSearch}
      />

      <div className="relative w-full max-w-2xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10">
        
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center gap-2 sm:gap-3">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#c87d4a] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search luxury fashion, coats, silk..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-white/40 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeSearch}
            className="px-2.5 py-1 text-xs font-semibold text-white/60 hover:text-white bg-white/5 rounded-lg border border-white/10 flex-shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] sm:max-h-[65vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Query Results */}
          {query.trim() !== '' ? (
            <div>
              <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                <span>Matching Products ({filteredProducts.length})</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-sm font-semibold text-white/80">No results found for "{query}"</p>
                  <p className="text-xs text-white/40">Try searching for "coat", "silk", "watch", or "boots"</p>
                  <button
                    onClick={() => setQuery('')}
                    className="px-4 py-2 text-xs font-semibold rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#c87d4a]/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-16 object-cover rounded-xl bg-[#18181c] border border-white/10"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-[#c87d4a] transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                            <span className="uppercase font-mono text-[10px]">{product.category}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">${product.price}</span>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#c87d4a] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#c87d4a]" />
                      Recent Searches
                    </span>
                    <button onClick={clearHistory} className="hover:text-white text-[10px]">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {history.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchTagClick(term)}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Fashion Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <TrendingUp className="w-3.5 h-3.5 text-[#c87d4a]" />
                  Popular Keywords
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Cashmere', 'Silk Shirts', 'Leather Boots', 'Double Breasted', 'Aviator', 'Midi Dress'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => handleSearchTagClick(keyword)}
                      className="px-3 py-1.5 rounded-full bg-[#c87d4a]/10 hover:bg-[#c87d4a]/20 border border-[#c87d4a]/30 text-xs text-[#c87d4a] transition-colors"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default SearchModal;
