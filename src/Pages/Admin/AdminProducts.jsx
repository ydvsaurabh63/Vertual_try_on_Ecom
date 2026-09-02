import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle, Package } from 'lucide-react';
import DataTable from '../../Components/Admin/DataTable';
import SearchFilter from '../../Components/Admin/SearchFilter';
import ConfirmModal from '../../Components/Admin/ConfirmModal';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStock !== 'all') params.stock = selectedStock;

      const res = await adminApi.getProducts(params);
      setProducts(res.products || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, selectedStock]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteProduct(productToDelete.id);
      toast.success(`Deleted ${productToDelete.name}`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Product',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-14 rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
            <img
              src={row.images?.[0] || '/assets/images/cutouts/tshirt-black.png'}
              alt={row.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-white text-sm line-clamp-1">{row.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{row.category?.replace('-', ' ')} • {row.brand || 'AURA'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: (row) => (
        <div>
          <span className="font-bold text-amber-400 text-sm">${row.finalPrice || row.price}</span>
          {row.discount > 0 && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="line-through text-zinc-500">${row.price}</span>
              <span className="text-emerald-400 font-semibold">-{row.discount}%</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Stock Status',
      accessor: (row) => {
        const stock = Number(row.stock) || 0;
        let badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        let label = `${stock} in stock`;

        if (stock <= 0) {
          badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
          label = 'Out of Stock';
        } else if (stock <= 5) {
          badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          label = `Low: ${stock} left`;
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeStyle}`}>
            {label}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            row.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          {row.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span className="capitalize">{row.status || 'Active'}</span>
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/product/${row.slug || row.id}`)}
            title="View in Store"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/admin/products/edit/${row.id}`)}
            title="Edit Product"
            className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setProductToDelete(row);
              setDeleteModalOpen(true);
            }}
            title="Delete Product"
            className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Product Catalog</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage catalog items, pricing, inventory stock, and virtual try-on assets.</p>
        </div>

        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <SearchFilter
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search products by name, brand, description..."
        filterOptions={[
          {
            key: 'category',
            value: selectedCategory,
            onChange: (val) => {
              setSelectedCategory(val);
              setPage(1);
            },
            options: [
              { label: 'All Categories', value: 'all' },
              ...categories.map(c => ({ label: c.name, value: c.slug }))
            ]
          },
          {
            key: 'stock',
            value: selectedStock,
            onChange: (val) => {
              setSelectedStock(val);
              setPage(1);
            },
            options: [
              { label: 'All Stock Levels', value: 'all' },
              { label: 'In Stock (>5)', value: 'in-stock' },
              { label: 'Low Stock (1-5)', value: 'low-stock' },
              { label: 'Out of Stock (0)', value: 'out-of-stock' }
            ]
          }
        ]}
        onClear={() => {
          setSearch('');
          setSelectedCategory('all');
          setSelectedStock('all');
          setPage(1);
        }}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search terms or filters, or add a new product."
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be reversed.`}
        confirmText="Delete Product"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminProducts;
