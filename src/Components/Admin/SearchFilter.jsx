import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export const SearchFilter = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions = [], // [{ key, label, value, onChange, options: [{ label, value }] }]
  onClear,
  className = ''
}) => {
  const hasActiveFilters = searchQuery || filterOptions.some(f => f.value && f.value !== 'all');

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {filterOptions.map((filter, index) => (
          <div key={index} className="relative min-w-[130px]">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {filter.options.map((opt, oIdx) => (
                <option key={oIdx} value={opt.value} className="bg-zinc-900 text-zinc-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          </div>
        ))}

        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
