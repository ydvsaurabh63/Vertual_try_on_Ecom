import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Sparkles, Check, UploadCloud, Loader2 } from 'lucide-react';
import Loader from '../../Components/Admin/Loader';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminAddEditProduct = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 't-shirts',
    price: '',
    discount: 0,
    finalPrice: '',
    stock: 20,
    status: 'active',
    brand: 'AURA Atelier',
    gender: 'unisex',
    description: '',
    images: ['/assets/images/cutouts/tshirt-black.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#FFFFFF'],
    featured: false
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load categories
    adminApi.getCategories().then(res => {
      setCategories(res.categories || []);
      if (!isEditMode && res.categories?.[0]) {
        setFormData(prev => ({ ...prev, category: res.categories[0].slug }));
      }
    });

    // If edit mode, load product
    if (isEditMode) {
      setIsLoading(true);
      adminApi.getProductById(id)
        .then(res => {
          if (res.product) {
            setFormData({
              ...res.product,
              images: res.product.images?.length ? res.product.images : ['/assets/images/cutouts/tshirt-black.png'],
              sizes: res.product.sizes?.length ? res.product.sizes : ['S', 'M', 'L'],
              colors: res.product.colors?.length ? res.product.colors : ['#000000']
            });
          }
        })
        .catch(err => {
          toast.error('Failed to load product details');
          navigate('/admin/products');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode]);

  // Recalculate final price when price or discount changes
  const handlePriceChange = (e) => {
    const p = Number(e.target.value) || 0;
    const d = Number(formData.discount) || 0;
    const calc = d > 0 ? Math.round(p * (1 - d / 100)) : p;
    setFormData(prev => ({ ...prev, price: e.target.value, finalPrice: calc }));
  };

  const handleDiscountChange = (e) => {
    const d = Number(e.target.value) || 0;
    const p = Number(formData.price) || 0;
    const calc = d > 0 ? Math.round(p * (1 - d / 100)) : p;
    setFormData(prev => ({ ...prev, discount: d, finalPrice: calc }));
  };

  // Image helpers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploadingImage(true);
        const toastId = toast.loading('Uploading image...');
        const res = await adminApi.uploadImage(reader.result, 'aura_products');
        toast.dismiss(toastId);

        if (res.url) {
          setFormData(prev => ({ ...prev, images: [...prev.images, res.url] }));
          toast.success('Image uploaded successfully!');
        } else {
          toast.error('Upload completed but URL not received');
        }
      } catch (err) {
        toast.error(err.message || 'Upload failed. Check server/.env Cloudinary config.');
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Size helpers
  const handleAddSize = () => {
    if (!newSize.trim() || formData.sizes.includes(newSize.trim())) return;
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }));
    setNewSize('');
  };

  const handleRemoveSize = (size) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  // Color helpers
  const handleAddColor = () => {
    if (!newColor || formData.colors.includes(newColor)) return;
    setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
  };

  const handleRemoveColor = (col) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== col) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please provide name, category, and price.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await adminApi.updateProduct(id, formData);
        toast.success('Product updated successfully!');
      } else {
        await adminApi.createProduct(formData);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading product data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isEditMode ? `Edit Product: ${formData.name || 'Untitled'}` : 'Create New Product'}
            </h1>
            <p className="text-xs text-zinc-400">Fill in all details to display in catalog and enable AI Virtual Try-On.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General & Pricing Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Basic Details</h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Charcoal Wool Tailored Trousers"
                className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none capitalize"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.slug} className="bg-zinc-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. AURA Atelier"
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Target Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none capitalize"
                >
                  <option value="unisex" className="bg-zinc-900">Unisex</option>
                  <option value="men" className="bg-zinc-900">Men</option>
                  <option value="women" className="bg-zinc-900">Women</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none capitalize"
                >
                  <option value="active" className="bg-zinc-900">Active (Visible in Store)</option>
                  <option value="inactive" className="bg-zinc-900">Inactive (Draft / Hidden)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Detailed Product Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe fabric composition, fit, drape, and care instructions..."
                className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Original Price ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="190"
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleDiscountChange}
                  placeholder="15"
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Final Sale Price ($)
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.finalPrice || formData.price}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Stock Quantity (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Mark as Featured Product</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sizes & Color Swatches */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Variants (Sizes & Colors)</h3>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {formData.sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="text-zinc-500 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="e.g. XXL, 32, 44"
                  className="w-40 px-3 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  + Add Size
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Color Swatches
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {formData.colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200"
                  >
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                    {color}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="text-zinc-500 hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  + Add Color
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Images & Live Preview */}
        <div className="space-y-6">
          {/* Images Management */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Product Images</h3>
            <p className="text-xs text-zinc-400">
              For Virtual Try-On, isolated cutouts (e.g. <code>/assets/images/cutouts/...</code>) work best.
            </p>

            <div className="space-y-2">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img src={imgUrl} alt="Thumbnail" className="w-10 h-10 object-contain rounded-lg bg-zinc-900" />
                  <span className="text-xs text-zinc-300 truncate flex-1">{imgUrl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image Inputs (Cloudinary Upload & URL) */}
            <div className="space-y-3 pt-2">
              {/* Cloudinary File Upload Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      Uploading from Gallery...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      Upload from Gallery
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">or paste URL</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Image URL (e.g. https://res.cloudinary.com/...)"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  + Add Image URL
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Catalog Preview</h3>

            <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 p-4 space-y-3">
              <div className="w-full h-48 bg-zinc-900/50 rounded-xl flex items-center justify-center p-2 relative">
                <img
                  src={formData.images[0] || '/assets/images/cutouts/tshirt-black.png'}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-zinc-950 text-[10px] font-bold">
                  AI Try-On Ready
                </span>
              </div>

              <div>
                <p className="text-[11px] text-zinc-500 uppercase font-semibold">{formData.brand || 'AURA'}</p>
                <h4 className="text-sm font-bold text-white line-clamp-1">{formData.name || 'Product Title'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-extrabold text-amber-400">
                    ${formData.finalPrice || formData.price || '0'}
                  </span>
                  {formData.discount > 0 && (
                    <span className="text-xs line-through text-zinc-500">${formData.price}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminAddEditProduct;
