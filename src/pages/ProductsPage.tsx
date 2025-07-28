import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  product_name: string;
  product_code: string;
  category: string;
  category_id?: number;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  image_url?: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const filteredProducts = categoryFilter ? products.filter(p => p.category === categoryFilter) : products;

  // Edit modal state
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // New category state
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Image upload modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Image preview modal state
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagePreviewName, setImagePreviewName] = useState<string | null>(null);

  // Add product modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    product_name: '',
    product_code: '',
    category_id: '',
    cost_price: '',
    image: null as File | null,
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    axios.get('/api/financial/categories').then(res => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/financial/products');
        if (res.data.success) {
          setProducts(res.data.data || []);
        } else {
          setError(res.data.error || 'Failed to fetch products');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const openEditModal = (product: Product) => {
    setEditProduct(product);
    setEditForm({ ...product });
    setEditError(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditProduct(null);
    setEditForm({});
    setEditError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: name === 'cost_price' || name === 'selling_price' || name === 'current_stock' ? Number(value) : value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await axios.put(`/api/financial/products/${editProduct.id}`, editForm);
      if (res.data.success) {
        setProducts(products => products.map(p => p.id === editProduct.id ? { ...p, ...editForm } as Product : p));
        closeEditModal();
      } else {
        setEditError(res.data.error || 'Failed to update product');
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to update product');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await axios.post('/api/financial/categories', { name: newCategory });
    if (res.data.success) {
      setCategories([...categories, res.data.data]);
      setNewCategory('');
    }
  };

  // Edit category
  const handleEditCategory = async (id: number) => {
    if (!editingCategoryName.trim()) return;
    await axios.put(`/api/financial/categories/${id}`, { name: editingCategoryName });
    setCategories(categories.map(c => c.id === id ? { ...c, name: editingCategoryName } : c));
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  // Delete category
  const handleDeleteCategory = async (id: number) => {
    await axios.delete(`/api/financial/categories/${id}`);
    setCategories(categories.filter(c => c.id !== id));
  };

  const openImageModal = (product: Product) => {
    setSelectedProduct(product);
    setImageModalOpen(true);
    setUploadError(null);
  };
  const closeImageModal = () => {
    setSelectedProduct(null);
    setImageModalOpen(false);
    setUploadError(null);
  };
  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !fileInputRef.current?.files?.[0]) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('image', fileInputRef.current.files[0]);
    try {
      const res = await axios.post(`/api/financial/products/${selectedProduct.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setProducts(products => products.map(p => p.id === selectedProduct.id ? { ...p, image_url: res.data.url } : p));
        closeImageModal();
      } else {
        setUploadError(res.data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="flex gap-2">
          <Link to="/categories" className="text-blue-700 hover:underline font-medium">Manage Categories</Link>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
            onClick={() => { setAddModalOpen(true); setAddError(null); }}
          >
            Add Product
          </button>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Category:</label>
          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.product_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.product_code}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.product_name}
                          className="w-12 h-12 object-cover rounded cursor-pointer hover:shadow-lg"
                          onClick={() => { setImagePreviewUrl(product.image_url!); setImagePreviewName(product.product_name); }}
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-blue-700 font-semibold">{Number(product.cost_price).toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                      <button
                        className="text-blue-600 hover:underline font-medium"
                        onClick={() => openEditModal(product)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openImageModal(product)}
                        className="text-blue-600 hover:underline text-xs ml-2"
                      >
                        Upload Image
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {editModalOpen && editProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeEditModal}
              disabled={editSubmitting}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Edit Product</h2>
            {editError && <div className="text-red-600 mb-2">{editError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={editForm.product_name || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Product Code</label>
                <input
                  type="text"
                  name="product_code"
                  value={editForm.product_code || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category_id"
                  value={editForm.category_id || ''}
                  onChange={e => {
                    const selectedId = Number(e.target.value);
                    const selectedCat = categories.find(c => c.id === selectedId);
                    setEditForm(f => ({
                      ...f,
                      category_id: selectedId,
                      category: selectedCat ? selectedCat.name : ''
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Cost Price</label>
                <input
                  type="number"
                  name="cost_price"
                  value={editForm.cost_price ?? ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4" hidden>
                <label className="block text-sm font-medium mb-1">Selling Price</label>
                <input
                  type="number"
                  name="selling_price"
                  value={editForm.selling_price ?? ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4" hidden>
                <label className="block text-sm font-medium mb-1">Current Stock</label>
                <input
                  type="number"
                  name="current_stock"
                  value={editForm.current_stock ?? ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {imageModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={closeImageModal}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={closeImageModal} aria-label="Close">&times;</button>
            <h2 className="text-lg font-bold mb-4">Upload Image for {selectedProduct.product_name}</h2>
            <form onSubmit={handleImageUpload}>
              <input type="file" accept="image/*" ref={fileInputRef} className="mb-4" required />
              {uploadError && <div className="text-red-600 mb-2">{uploadError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={closeImageModal}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {imagePreviewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setImagePreviewUrl(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-0 right-0 m-2 text-white text-2xl" onClick={() => setImagePreviewUrl(null)} aria-label="Close">&times;</button>
            <img src={imagePreviewUrl} alt={imagePreviewName || ''} className="max-w-full max-h-[80vh] rounded shadow-lg" />
            {imagePreviewName && <div className="text-white text-center mt-2 text-lg font-semibold">{imagePreviewName}</div>}
          </div>
        </div>
      )}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setAddModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setAddModalOpen(false)} aria-label="Close">&times;</button>
            <h2 className="text-lg font-bold mb-4">Add Product</h2>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setAddSubmitting(true);
                setAddError(null);
                try {
                  const formData = new FormData();
                  formData.append('product_name', addForm.product_name);
                  formData.append('product_code', addForm.product_code);
                  formData.append('category_id', addForm.category_id);
                  formData.append('cost_price', addForm.cost_price);
                  if (addForm.image) formData.append('image', addForm.image);
                  const res = await axios.post('/api/financial/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                  if (res.data.success) {
                    setProducts(products => [res.data.data, ...products]);
                    setAddModalOpen(false);
                    setAddForm({ product_name: '', product_code: '', category_id: '', cost_price: '', image: null });
                  } else {
                    setAddError(res.data.error || 'Failed to add product');
                  }
                } catch (err: any) {
                  setAddError(err.message || 'Failed to add product');
                }
                setAddSubmitting(false);
              }}
            >
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={addForm.product_name}
                  onChange={e => setAddForm(f => ({ ...f, product_name: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Product Code</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={addForm.product_code}
                  onChange={e => setAddForm(f => ({ ...f, product_code: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={addForm.category_id}
                  onChange={e => setAddForm(f => ({ ...f, category_id: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Cost Price</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="number"
                  value={addForm.cost_price}
                  onChange={e => setAddForm(f => ({ ...f, cost_price: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Image (optional)</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="file"
                  accept="image/*"
                  onChange={e => setAddForm(f => ({ ...f, image: e.target.files?.[0] || null }))}
                />
              </div>
              {addError && <div className="text-red-600 mb-2">{addError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" disabled={addSubmitting}>{addSubmitting ? 'Adding...' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage; 