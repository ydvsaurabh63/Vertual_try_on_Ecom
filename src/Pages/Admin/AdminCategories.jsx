import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Layers, CheckCircle, AlertCircle, X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import DataTable from '../../Components/Admin/DataTable';
import ConfirmModal from '../../Components/Admin/ConfirmModal';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', image: '', status: 'active' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', image: '', status: 'active' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      image: cat.image || '',
      status: cat.status || 'active'
    });
    setIsFormModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        setIsUploadingImage(true);
        const toastId = toast.loading('Uploading from gallery...');
        const res = await adminApi.uploadImage(reader.result, 'aura_categories');
        toast.dismiss(toastId);

        if (res.url) {
          setFormData(prev => ({ ...prev, image: res.url }));
          toast.success('Image uploaded successfully!');
        } else {
          setFormData(prev => ({ ...prev, image: reader.result }));
          toast.success('Image selected!');
        }
      } catch (err) {
        // Fallback to data URL
        setFormData(prev => ({ ...prev, image: reader.result }));
        toast.success('Image selected from gallery!');
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    const payload = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      image: formData.image || '/assets/images/cutouts/tshirt-black.png'
    };

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload);
        toast.success('Category updated successfully');
      } else {
        await adminApi.createCategory(payload);
        toast.success('Category created successfully');
      }
      setIsFormModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteCategory(categoryToDelete.id);
      toast.success(`Deleted ${categoryToDelete.name}`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.updateCategory(cat.id, { status: nextStatus });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: nextStatus } : c));
      toast.success(`Category ${cat.name} is now ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const columns = [
    {
      header: 'Category',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={row.image || '/assets/images/cutouts/tshirt-black.png'}
              alt={row.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80';
              }}
            />
          </div>
          <div>
            <p className="font-bold text-white text-sm">{row.name}</p>
            <p className="text-xs text-zinc-500 font-mono">slug: {row.slug}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Products',
      accessor: (row) => (
        <span className="px-3 py-1 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200">
          {row.count || 0} Products
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            row.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
          }`}
        >
          {row.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span className="capitalize">{row.status || 'Active'}</span>
        </button>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
            title="Edit Category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCategoryToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Category"
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Categories</h1>
          <p className="text-sm text-zinc-400 mt-1">Organize fashion catalog categories and virtual try-on tags.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyTitle="No categories found"
        emptyDescription="Create your first catalog category to start organizing products."
      />

      {/* Add / Edit Category Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">
                {editingCategory ? `Edit Category` : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 pt-4">
              {/* 1. Category Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jackets & Outerwear"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* 2. Upload Image From Gallery */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Upload Image from Gallery
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                {/* Preview Thumbnail if selected */}
                {formData.image && (
                  <div className="mb-3 flex items-center gap-3 p-2 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-700/60 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Category Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/cutouts/tshirt-black.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-zinc-300 font-medium truncate">Selected Image</p>
                      <p className="text-[10px] text-zinc-500 truncate">{formData.image.startsWith('data:') ? 'Image from Gallery' : formData.image}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Uploading from Gallery...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <span>{formData.image ? 'Change Image from Gallery' : 'Upload Image from Gallery'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3. Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="px-5 py-2.5 text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
        confirmText="Delete Category"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminCategories;
