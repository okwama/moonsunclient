import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { productsService } from '../services/financialService';
import { Store, StoreInventory, Product } from '../types/financial';

interface UpdateStockForm {
  store_id: number;
  product_id: number;
  new_quantity: number;
  reason: string;
}

interface ProductInventoryRow {
  product: Product;
  storeQuantities: { [storeId: number]: number };
  totalQuantity: number;
}

const UpdateStockQuantityPage: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<StoreInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ productId: number; storeId: number } | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stores
      const storesResponse = await storeService.getAllStores();
      if (storesResponse.success) {
        setStores(storesResponse.data || []);
      }

      // Fetch all products
      const productsResponse = await productsService.getAll();
      if (productsResponse.success) {
        setProducts(productsResponse.data || []);
      }

      // Fetch all inventory
      const inventoryResponse = await storeService.getAllStoresInventory();
      if (inventoryResponse.success) {
        setInventory(inventoryResponse.data || []);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getProductInventoryRows = (): ProductInventoryRow[] => {
    const rows: ProductInventoryRow[] = [];
    
    // Filter products by category if selected
    const filteredProducts = selectedCategory 
      ? products.filter(product => product.category === selectedCategory)
      : products;
    
    filteredProducts.forEach(product => {
      const storeQuantities: { [storeId: number]: number } = {};
      let totalQuantity = 0;
      
      stores.forEach(store => {
        const inventoryItem = inventory.find(
          item => item.store_id === store.id && item.product_id === product.id
        );
        const quantity = inventoryItem?.quantity || 0;
        storeQuantities[store.id] = quantity;
        totalQuantity += quantity;
      });
      
      rows.push({
        product,
        storeQuantities,
        totalQuantity
      });
    });
    
    return rows.sort((a, b) => a.product.product_name.localeCompare(b.product.product_name));
  };

  const getUniqueCategories = (): string[] => {
    const categories = products
      .map(product => product.category)
      .filter((category): category is string => Boolean(category));
    return [...new Set(categories)].sort();
  };

  const handleQuantityClick = (productId: number, storeId: number, currentQuantity: number) => {
    setEditingCell({ productId, storeId });
    setEditQuantity(currentQuantity);
    setEditReason('');
    setShowEditModal(true);
  };

  const handleUpdateQuantity = async () => {
    if (!editingCell) return;
    
    const { productId, storeId } = editingCell;
    const currentInventory = inventory.find(
      item => item.store_id === storeId && item.product_id === productId
    );
    const currentQuantity = currentInventory?.quantity || 0;
    
    if (editQuantity === currentQuantity) {
      setError('New quantity must be different from current quantity');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await storeService.updateStockQuantity({
        store_id: storeId,
        product_id: productId,
        new_quantity: editQuantity,
        reason: editReason || 'Manual Stock Update'
      });

      if (response.success) {
        setSuccess('Stock quantity updated successfully!');
        setShowEditModal(false);
        setEditingCell(null);
        // Refresh inventory data
        await fetchData();
      } else {
        setError(response.error || 'Failed to update stock quantity');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update stock quantity');
    } finally {
      setSubmitting(false);
    }
  };

  const getStoreName = (storeId: number) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.store_name : 'Unknown Store';
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.product_name : 'Unknown Product';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const productRows = getProductInventoryRows();
  const categories = getUniqueCategories();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Update Stock Quantities</h1>
              <p className="mt-2 text-sm text-gray-600">
                Click on any quantity to update stock levels for products across all stores
              </p>
            </div>
            <button
              onClick={() => navigate('/store-inventory')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Inventory
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSelectedCategory('')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filter
              </button>
            </div>
          </div>
          {selectedCategory && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {productRows.length} product{productRows.length !== 1 ? 's' : ''} in category: <span className="font-medium">{selectedCategory}</span>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stock
                  </th>
                  {stores.map((store) => (
                    <th key={store.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {store.store_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productRows.map((row) => (
                  <tr key={row.product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      {row.product.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.product.product_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.product.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {row.totalQuantity}
                    </td>
                    {stores.map((store) => {
                      const quantity = row.storeQuantities[store.id] || 0;
                      return (
                        <td key={store.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleQuantityClick(row.product.id, store.id, quantity)}
                            className="w-full text-left px-2 py-1 rounded border border-transparent hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          >
                            {quantity}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productRows.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {selectedCategory ? `No products found in category "${selectedCategory}"` : 'No products found'}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Instructions</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the category filter to narrow down products by type</li>
                  <li>Click on any quantity in the table to update it</li>
                  <li>Enter the new quantity and optionally provide a reason</li>
                  <li>All changes are logged in the inventory transaction history</li>
                  <li>The table shows current stock levels across all stores</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingCell && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Stock Quantity
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Product:</strong> {getProductName(editingCell.productId)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Store:</strong> {getStoreName(editingCell.storeId)}
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  New Quantity *
                </label>
                <input
                  type="number"
                  id="edit_quantity"
                  min="0"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="edit_reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Update
                </label>
                <textarea
                  id="edit_reason"
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g., Stock adjustment, Damaged goods, etc."
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCell(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateQuantity}
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Quantity'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateStockQuantityPage; 