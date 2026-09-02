import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, AlertCircle, Shield, User, Trash2 } from 'lucide-react';
import DataTable from '../../Components/Admin/DataTable';
import SearchFilter from '../../Components/Admin/SearchFilter';
import ConfirmModal from '../../Components/Admin/ConfirmModal';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await adminApi.getUsers(params);
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, selectedRole, selectedStatus]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.toggleUserStatus(user.id, nextStatus);
      toast.success(`User ${user.name} set to ${nextStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(userToDelete.id);
      toast.success(`Deleted user ${userToDelete.name}`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
            alt={row.name}
            className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
          />
          <div>
            <p className="font-bold text-white text-sm">{row.name}</p>
            <p className="text-xs text-zinc-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
            row.role === 'admin'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          {row.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          <span>{row.role}</span>
        </span>
      )
    },
    {
      header: 'Orders',
      accessor: (row) => (
        <span className="font-semibold text-zinc-200 text-xs">
          {row.totalOrders || 0} Orders
        </span>
      )
    },
    {
      header: 'Account Status',
      accessor: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          disabled={row.role === 'admin'}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
            row.role === 'admin'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 opacity-80 cursor-default'
              : row.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 cursor-pointer'
          }`}
        >
          {row.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span className="capitalize">{row.status}</span>
        </button>
      )
    },
    {
      header: 'Joined Date',
      accessor: (row) => (
        <span className="text-xs text-zinc-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/users/${row.id}`)}
            className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
            title="View User Profile & History"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.role !== 'admin' && (
            <button
              onClick={() => {
                setUserToDelete(row);
                setDeleteModalOpen(true);
              }}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Customer Management</h1>
        <p className="text-sm text-zinc-400 mt-1">View user accounts, verify roles, and monitor order and AI fitting activity.</p>
      </div>

      {/* Filter Toolbar */}
      <SearchFilter
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search customers by name, email, phone..."
        filterOptions={[
          {
            key: 'role',
            value: selectedRole,
            onChange: (val) => {
              setSelectedRole(val);
              setPage(1);
            },
            options: [
              { label: 'All Roles', value: 'all' },
              { label: 'Customers', value: 'customer' },
              { label: 'Administrators', value: 'admin' }
            ]
          },
          {
            key: 'status',
            value: selectedStatus,
            onChange: (val) => {
              setSelectedStatus(val);
              setPage(1);
            },
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' }
            ]
          }
        ]}
        onClear={() => {
          setSearch('');
          setSelectedRole('all');
          setSelectedStatus('all');
          setPage(1);
        }}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyTitle="No users found"
        emptyDescription="Registered customer accounts will appear here."
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(p) => setPage(p)}
      />

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Customer Account"
        message={`Are you sure you want to permanently remove "${userToDelete?.name}"?`}
        confirmText="Delete User"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminUsers;
