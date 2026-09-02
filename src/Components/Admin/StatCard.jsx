import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  isPositive = true,
  subtitle,
  colorScheme = 'amber', // 'amber', 'emerald', 'blue', 'purple', 'rose'
  className = '',
  onClick
}) => {
  const colorStyles = {
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      borderGlow: 'hover:border-amber-500/30'
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      borderGlow: 'hover:border-emerald-500/30'
    },
    blue: {
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      borderGlow: 'hover:border-sky-500/30'
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      borderGlow: 'hover:border-purple-500/30'
    },
    rose: {
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      borderGlow: 'hover:border-rose-500/30'
    }
  };

  const currentTheme = colorStyles[colorScheme] || colorStyles.amber;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl transition-all duration-300 ${currentTheme.borderGlow} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${currentTheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/50 text-xs">
          {trend !== undefined && (
            <div className={`flex items-center font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              <span>{trend}</span>
            </div>
          )}
          <span className="text-zinc-500">{subtitle || trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
