import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Eye, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import DataTable from '../../Components/Admin/DataTable';
import SearchFilter from '../../Components/Admin/SearchFilter';
import ConfirmModal from '../../Components/Admin/ConfirmModal';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminVirtualTryOn = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail Modal
  const [selectedTryOn, setSelectedTryOn] = useState(null);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await adminApi.getTryOnLogs(params);
      setLogs(res.tryons || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      toast.error('Failed to load virtual try-on logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, selectedStatus]);

  const handleDelete = async () => {
    if (!logToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteTryOnLog(logToDelete.id);
      toast.success('Try-on record deleted');
      setDeleteModalOpen(false);
      setLogToDelete(null);
      fetchLogs();
    } catch (err) {
      toast.error('Failed to delete try-on record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = async (log) => {
    toast.loading('Retrying AI Virtual Try-On generation...', { id: 'retry-tryon' });
    try {
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelImageUrl: log.modelImageUrl,
          clothImageUrl: log.clothImageUrl,
          productName: log.productName,
          modelName: log.modelName,
          userId: log.userId,
          userName: log.userName,
          userEmail: log.userEmail
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Retry failed');
      toast.success('Successfully regenerated try-on!', { id: 'retry-tryon' });
      fetchLogs();
    } catch (err) {
      toast.error(err.message || 'Retry failed', { id: 'retry-tryon' });
    }
  };

  const columns = [
    {
      header: 'Request / User',
      accessor: (row) => (
        <div>
          <span className="font-bold text-white text-xs">{row.id}</span>
          <p className="text-xs text-zinc-300 mt-0.5">{row.userName || 'Guest'}</p>
          <p className="text-[11px] text-zinc-500">{new Date(row.timestamp).toLocaleString()}</p>
        </div>
      )
    },
    {
      header: 'Garment / Cloth',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
            <img
              src={row.clothImageUrl || '/assets/images/cutouts/tshirt-black.png'}
              alt="Cloth"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <span className="text-xs font-semibold text-zinc-200 line-clamp-1">{row.productName || 'Garment'}</span>
        </div>
      )
    },
    {
      header: 'Model Avatar',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={row.modelImageUrl || '/assets/images/tryon/model-man.jpg'}
            alt="Model"
            className="w-10 h-10 rounded-lg object-cover border border-zinc-700 shrink-0"
          />
          <span className="text-xs text-zinc-400">{row.modelName || '3D Mannequin'}</span>
        </div>
      )
    },
    {
      header: 'AI Result',
      accessor: (row) => (
        row.generatedImageUrl ? (
          <div className="flex items-center gap-2">
            <img
              src={row.generatedImageUrl}
              alt="Generated"
              className="w-10 h-10 rounded-lg object-cover border border-amber-500/40"
            />
            <span className="text-[11px] font-semibold text-emerald-400">Ready</span>
          </div>
        ) : (
          <span className="text-xs text-zinc-500 italic">No output</span>
        )
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
              row.status === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {row.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span className="capitalize">{row.status}</span>
          </span>
          <p className="text-[10px] text-zinc-500 mt-1">{row.responseTimeMs ? `${row.responseTimeMs}ms` : '3.2s'}</p>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedTryOn(row)}
            className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
            title="Inspect Side-by-Side"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'failed' && (
            <button
              onClick={() => handleRetry(row)}
              className="p-2 rounded-xl text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors cursor-pointer"
              title="Retry Generation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setLogToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Virtual Try-On Sessions</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
              LightX AI v2
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor real-time generative AI fitting sessions, original garments, model poses, and latency.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <SearchFilter
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by user, product, or model name..."
        filterOptions={[
          {
            key: 'status',
            value: selectedStatus,
            onChange: (val) => {
              setSelectedStatus(val);
              setPage(1);
            },
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Successful', value: 'success' },
              { label: 'Failed', value: 'failed' }
            ]
          }
        ]}
        onClear={() => {
          setSearch('');
          setSelectedStatus('all');
          setPage(1);
        }}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyTitle="No try-on sessions found"
        emptyDescription="Customer Virtual Try-On generation activity will be tracked and displayed here."
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(p) => setPage(p)}
      />

      {/* Side-by-Side Inspect Modal */}
      {selectedTryOn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Try-On Session #{selectedTryOn.id}
                </h3>
                <p className="text-xs text-zinc-400">
                  User: {selectedTryOn.userName} • {new Date(selectedTryOn.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedTryOn(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Comparison Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* 1. Original Garment */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">1. Original Cloth</span>
                <div className="w-full h-56 flex items-center justify-center bg-zinc-900/50 rounded-xl p-2">
                  <img
                    src={selectedTryOn.clothImageUrl || '/assets/images/cutouts/tshirt-black.png'}
                    alt="Garment"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-xs font-semibold text-zinc-200 mt-3 text-center">{selectedTryOn.productName}</p>
              </div>

              {/* 2. Selected Model */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">2. Base Model</span>
                <div className="w-full h-56 flex items-center justify-center bg-zinc-900/50 rounded-xl overflow-hidden">
                  <img
                    src={selectedTryOn.modelImageUrl || '/assets/images/tryon/model-man.jpg'}
                    alt="Model"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <p className="text-xs font-semibold text-zinc-200 mt-3 text-center">{selectedTryOn.modelName}</p>
              </div>

              {/* 3. Generated Try-On Result */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/40 flex flex-col items-center relative">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 3. AI Try-On Result
                </span>
                <div className="w-full h-56 flex items-center justify-center bg-zinc-900/50 rounded-xl overflow-hidden">
                  {selectedTryOn.generatedImageUrl ? (
                    <img
                      src={selectedTryOn.generatedImageUrl}
                      alt="Generated Try-On"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center p-4 text-rose-400 text-xs font-medium">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                      Generation Failed: {selectedTryOn.errorMessage || 'Image resolution or endpoint error'}
                    </div>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 mt-3">
                  {selectedTryOn.apiStatus || 'Completed'}
                </span>
              </div>
            </div>

            {/* Diagnostics details */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-zinc-500">Provider:</span>{' '}
                <span className="font-semibold text-zinc-300">{selectedTryOn.aiProvider || 'LightX AI v2'}</span>
              </div>
              <div>
                <span className="text-zinc-500">Duration:</span>{' '}
                <span className="font-semibold text-zinc-300">{selectedTryOn.responseTimeMs || 3200}ms</span>
              </div>
              <div>
                <span className="text-zinc-500">Status:</span>{' '}
                <span className={`font-bold ${selectedTryOn.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedTryOn.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Try-On Record"
        message="Are you sure you want to delete this virtual try-on log?"
        confirmText="Delete Record"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setLogToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminVirtualTryOn;
