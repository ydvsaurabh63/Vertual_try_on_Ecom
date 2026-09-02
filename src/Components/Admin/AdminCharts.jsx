import React, { useState } from 'react';

// ─── Revenue Area / Line Chart ────────────────────────────────────────────────
export const RevenueLineChart = ({ data = [], height = 240 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.revenue || 0), 1000) * 1.15;
  const paddingX = 40;
  const paddingY = 30;
  const width = 600;
  const chartHeight = height - paddingY * 2;
  const chartWidth = width - paddingX * 2;

  const points = data.map((item, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((item.revenue || 0) / maxVal) * chartHeight;
    return { x, y, item };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x},${paddingY + chartHeight} L ${points[0].x},${paddingY + chartHeight} Z`;

  return (
    <div className="w-full relative select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid horizontal lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingY + chartHeight * ratio;
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#27272a" strokeDasharray="4 4" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="#71717a" fontSize="10">
                ${Math.round((1 - ratio) * maxVal).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Area fill & line stroke */}
        <path d={areaD} fill="url(#revenueGrad)" />
        <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Dots */}
        {points.map((p, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 7 : 4}
              fill="#18181b"
              stroke="#f59e0b"
              strokeWidth="2.5"
              className="transition-all duration-200"
            />
            {/* X-axis labels */}
            <text x={p.x} y={height - 8} textAnchor="middle" fill="#a1a1aa" fontSize="11" fontWeight="500">
              {p.item.month || p.item.day || p.item.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute bg-zinc-950 border border-zinc-700 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`
          }}
        >
          <div className="font-bold text-amber-400">${points[hoveredIdx].item.revenue?.toLocaleString()}</div>
          <div className="text-zinc-400">{points[hoveredIdx].item.orders} orders</div>
        </div>
      )}
    </div>
  );
};

// ─── Weekly Activity Bar Chart (Sales vs Virtual Try-Ons) ─────────────────────
export const ActivityBarChart = ({ data = [], height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => Math.max(d.sales || 0, d.tryons || 0)), 50) * 1.2;
  const paddingX = 35;
  const paddingY = 25;
  const width = 500;
  const chartHeight = height - paddingY * 2;
  const barGroupWidth = (width - paddingX * 2) / data.length;
  const barWidth = 14;

  return (
    <div className="w-full relative select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = paddingY + chartHeight * ratio;
          return (
            <line key={i} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#27272a" strokeDasharray="3 3" />
          );
        })}

        {data.map((item, idx) => {
          const groupCenterX = paddingX + idx * barGroupWidth + barGroupWidth / 2;
          const salesHeight = ((item.sales || 0) / maxVal) * chartHeight;
          const tryonHeight = ((item.tryons || 0) / maxVal) * chartHeight;

          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Sales Bar */}
              <rect
                x={groupCenterX - barWidth - 2}
                y={paddingY + chartHeight - salesHeight}
                width={barWidth}
                height={Math.max(salesHeight, 2)}
                rx="4"
                fill={isHovered ? '#fbbf24' : '#f59e0b'}
                className="transition-colors"
              />
              {/* TryOn Bar */}
              <rect
                x={groupCenterX + 2}
                y={paddingY + chartHeight - tryonHeight}
                width={barWidth}
                height={Math.max(tryonHeight, 2)}
                rx="4"
                fill={isHovered ? '#38bdf8' : '#0284c7'}
                className="transition-colors"
              />
              {/* Day Label */}
              <text x={groupCenterX} y={height - 6} textAnchor="middle" fill="#a1a1aa" fontSize="11">
                {item.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs font-medium text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500"></span>
          <span>Sales ($)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-sky-500"></span>
          <span>AI Try-On Sessions</span>
        </div>
      </div>
    </div>
  );
};

// ─── Category Distribution Donut / Progress ──────────────────────────────────
export const CategoryDistribution = ({ categories = [] }) => {
  if (!categories || categories.length === 0) return null;

  const total = categories.reduce((sum, c) => sum + (c.count || 0), 0) || 1;
  const colors = ['#f59e0b', '#38bdf8', '#a855f7', '#10b981', '#f43f5e', '#6366f1', '#eab308'];

  return (
    <div className="space-y-3.5">
      {categories.map((cat, idx) => {
        const percent = Math.round(((cat.count || 0) / total) * 100);
        const color = colors[idx % colors.length];

        return (
          <div key={cat.slug || idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                {cat.name}
              </span>
              <span className="text-zinc-400 font-semibold">{cat.count} items ({percent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: color }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
