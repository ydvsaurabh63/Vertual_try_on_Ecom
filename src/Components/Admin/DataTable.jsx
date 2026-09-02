import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from './Loader';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns = [], // [{ header: string, accessor: string|func, className?: string }]
  data = [],
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'No records match your query.',
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8">
        <Loader message="Loading data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/50">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-zinc-800/30 transition-colors group"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-5 py-4 text-sm text-zinc-300 ${col.className || ''}`}
                  >
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/40 text-xs text-zinc-400">
          <p>
            Showing <span className="font-medium text-zinc-200">{data.length}</span> of{' '}
            <span className="font-medium text-zinc-200">{totalItems || data.length}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-750 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium text-zinc-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-750 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
