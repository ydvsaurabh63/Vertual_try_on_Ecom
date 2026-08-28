import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-white/50 py-3">
      <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-[#c87d4a]" />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 text-white/30" />
          {item.path ? (
            <Link to={item.path} className="hover:text-white transition-colors capitalize">
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium capitalize line-clamp-1">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
