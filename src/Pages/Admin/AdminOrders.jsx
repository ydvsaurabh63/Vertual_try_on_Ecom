import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShoppingBag, Clock, CheckCircle2, Truck, AlertCircle, XCircle } from 'lucide-react';
import DataTable from '../../Components/Admin/DataTable';
import SearchFilter from '../../Components/Admin/SearchFilter';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await adminApi.getOrders(params);
      setOrders(res.orders || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, selectedStatus]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          icon: CheckCircle2,
          style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'shipped':
        return {
          icon: Truck,
          style: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
        };
      case 'processing':
        return {
          icon: Clock,
          style: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          style: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
      default:
        return {
          icon: AlertCircle,
          style: 'bg-zinc-800 text-zinc-300 border-zinc-700'
        };
    }
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: (row) => (
        <div>
          <span className="font-bold text-white text-sm">{row.id}</span>
          <p className="text-[11px] text-zinc-500">{row.createdAt?.split('T')[0]}</p>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-zinc-200 text-sm">{row.customer?.name || 'Customer'}</p>
          <p className="text-xs text-zinc-400">{row.customer?.email || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Items',
      accessor: (row) => (
        <span className="text-xs text-zinc-300">
          {row.items?.length || 1} item{row.items?.length > 1 ? 's' : ''} ({row.items?.[0]?.name?.slice(0, 20)}...)
        </span>
      )
    },
    {
      header: 'Total Amount',
      accessor: (row) => (
        <div>
          <span className="font-bold text-amber-400 text-sm">${row.total}</span>
          <p className="text-[10px] text-zinc-500 capitalize">{row.paymentMethod || 'Paid'}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => {
        const badge = getStatusBadge(row.status);
        const Icon = badge.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.style}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{row.status}</span>
          </span>
        );
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <button
          onClick={() => navigate(`/admin/orders/${row.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Details</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Order Management</h1>
        <p className="text-sm text-zinc-400 mt-1">Track fulfillment, shipping updates, and customer purchase histories.</p>
      </div>

      {/* Filter Toolbar */}
      <SearchFilter
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search orders by Order ID, customer name, email..."
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
              { label: 'Pending', value: 'Pending' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Shipped', value: 'Shipped' },
              { label: 'Delivered', value: 'Delivered' },
              { label: 'Cancelled', value: 'Cancelled' }
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
        data={orders}
        isLoading={isLoading}
        emptyTitle="No orders found"
        emptyDescription="Orders placed by customers will appear here."
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default AdminOrders;
