import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

interface Category {
  id: number;
  name: string;
}

interface PriceOption {
  id: number; // Added id for deletion
  label: string;
  value: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [newPriceLabel, setNewPriceLabel] = useState('');
  const [newPriceValue, setNewPriceValue] = useState('');
  const [allCategoryPrices, setAllCategoryPrices] = useState<Record<number, PriceOption[]>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all category prices on mount and after price modal closes
  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        const res = await axios.get('/api/financial/categories');
        if (res.data.success) {
          const cats: Category[] = res.data.data;
          const prices: Record<number, PriceOption[]> = {};
          await Promise.all(
            cats.map(async (cat) => {
              try {
                const pres = await axios.get(`/api/financial/categories/${cat.id}/price-options`);
                if (pres.data.success) prices[cat.id] = pres.data.data;
                else prices[cat.id] = [];
              } catch {
                prices[cat.id] = [];
              }
            })
          );
          setAllCategoryPrices(prices);
        }
      } catch {}
    };
    fetchAllPrices();
  }, [priceModalOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/financial/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      } else {
        setError(res.data.error || 'Failed to fetch categories');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await axios.post('/api/financial/categories', { name: newCategory });
      if (res.data.success) {
        setCategories([...categories, res.data.data]);
        setNewCategory('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    }
  };

  const handleEditCategory = async (id: number) => {
    if (!editingCategoryName.trim()) return;
    try {
      await axios.put(`/api/financial/categories/${id}`, { name: editingCategoryName });
      setCategories(categories.map(c => c.id === id ? { ...c, name: editingCategoryName } : c));
      setEditingCategoryId(null);
      setEditingCategoryName('');
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await axios.delete(`/api/financial/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const openPriceModal = async (category: Category) => {
    setSelectedCategory(category);
    setPriceLoading(true);
    setPriceError(null);
    setPriceModalOpen(true);
    try {
      const res = await axios.get(`/api/financial/categories/${category.id}/price-options`);
      if (res.data.success) {
        setPriceOptions(res.data.data);
      } else {
        setPriceError(res.data.error || 'Failed to fetch price options');
      }
    } catch (err: any) {
      setPriceError(err.message || 'Failed to fetch price options');
    }
    setPriceLoading(false);
  };
  const closePriceModal = () => {
    setSelectedCategory(null);
    setPriceModalOpen(false);
    setNewPriceLabel('');
    setNewPriceValue('');
    setPriceOptions([]);
    setPriceError(null);
  };
  const handleAddPriceOption = async () => {
    if (!selectedCategory || !newPriceLabel.trim() || !newPriceValue) return;
    try {
      const res = await axios.post(`/api/financial/categories/${selectedCategory.id}/price-options`, {
        label: newPriceLabel,
        value: Number(newPriceValue),
      });
      if (res.data.success) {
        setPriceOptions([...priceOptions, res.data.data]);
        setNewPriceLabel('');
        setNewPriceValue('');
      } else {
        setPriceError(res.data.error || 'Failed to add price option');
      }
    } catch (err: any) {
      setPriceError(err.message || 'Failed to add price option');
    }
  };
  const handleDeletePriceOption = async (id: number) => {
    try {
      await axios.delete(`/api/financial/price-options/${id}`);
      setPriceOptions(priceOptions.filter(opt => opt.id !== id));
    } catch (err: any) {
      setPriceError(err.message || 'Failed to delete price option');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Manage Categories</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setAddModalOpen(true)}
        >
          Add Category
        </button>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b text-left">Name</th>
            <th className="px-4 py-2 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td className="px-4 py-2 border-b">
                {editingCategoryId === cat.id ? (
                  <input
                    className="border rounded px-2 py-1 text-sm mr-2"
                    value={editingCategoryName}
                    onChange={e => setEditingCategoryName(e.target.value)}
                    onBlur={() => handleEditCategory(cat.id)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEditCategory(cat.id); }}
                    autoFocus
                  />
                ) : (
                  <>
                    <span>{cat.name}</span>
                    <span className="flex flex-wrap gap-1 mt-1">
                      {(allCategoryPrices[cat.id] || []).map(opt => (
                        <span
                          key={opt.id}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                        >
                          {opt.label}: {opt.value}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingCategoryId === cat.id ? (
                  <button onClick={() => setEditingCategoryId(null)} className="text-xs text-gray-500 ml-1">Cancel</button>
                ) : (
                  <>
                    <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} className="text-gray-500 hover:text-blue-600 mr-2"><Pencil size={16} /></button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                    <button
                      onClick={() => openPriceModal(cat)}
                      className="text-gray-500 hover:text-green-600 ml-2"
                    >
                      Manage Prices
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={2} className="px-4 py-4 text-center text-gray-500">No categories found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Category Modal (Fallback Simple Modal) */}
      {addModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setAddModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Add Category</h2>
            <input
              className="border rounded px-3 py-2 w-full mb-4"
              placeholder="Category name"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { handleAddCategory(); setAddModalOpen(false); } }}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => { handleAddCategory(); setAddModalOpen(false); }}
                disabled={!newCategory.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Category Modal */}
      {/* Remove or comment out the Headless UI modal for Add Category */}
      {/* <Transition appear show={addModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setAddModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto">
                  <Dialog.Title className="text-lg font-bold mb-4">Add Category</Dialog.Title>
                  <input
                    className="border rounded px-3 py-2 w-full mb-4"
                    placeholder="Category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setAddModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => { handleAddCategory(); setAddModalOpen(false); }}
                      disabled={!newCategory.trim()}
                    >
                      Add
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition> */}

      {priceModalOpen && selectedCategory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={closePriceModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={closePriceModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Price Options for {selectedCategory.name}</h2>
            <table className="min-w-full mb-4">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Label</th>
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {priceLoading ? (
                  <tr><td colSpan={3} className="px-2 py-2 text-center text-gray-500">Loading price options...</td></tr>
                ) : priceError ? (
                  <tr><td colSpan={3} className="px-2 py-2 text-center text-red-500">{priceError}</td></tr>
                ) : (
                  (priceOptions || []).map((opt, idx) => (
                    <tr key={opt.id}>
                      <td className="px-2 py-1">{opt.label}</td>
                      <td className="px-2 py-1">{opt.value}</td>
                      <td className="px-2 py-1">
                        <button
                          className="text-red-600 hover:underline text-xs"
                          onClick={() => handleDeletePriceOption(opt.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {(priceOptions || []).length === 0 && !priceLoading && !priceError && (
                  <tr><td colSpan={3} className="px-2 py-2 text-gray-500">No price options</td></tr>
                )}
              </tbody>
            </table>
            <div className="flex gap-2 mb-2">
              <input
                className="border rounded px-2 py-1 w-1/2"
                placeholder="Label"
                value={newPriceLabel}
                onChange={e => setNewPriceLabel(e.target.value)}
              />
              <input
                className="border rounded px-2 py-1 w-1/2"
                placeholder="Price"
                type="number"
                value={newPriceValue}
                onChange={e => setNewPriceValue(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleAddPriceOption}
                disabled={!newPriceLabel.trim() || !newPriceValue || priceLoading}
              >
                Add Price Option
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage; 