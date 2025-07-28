import React, { useEffect, useState } from 'react';
import { storeService } from '../services/storeService';
import { productsService } from '../services/financialService';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StockTakePage: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | ''>('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [counts, setCounts] = useState<{ [productId: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchInventory(selectedStore);
    } else {
      setInventory([]);
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    const res = await storeService.getAllStores();
    if (res.success) setStores(res.data || []);
  };
  const fetchProducts = async () => {
    const res = await productsService.getAll();
    if (res.success) setProducts(res.data || []);
  };
  const fetchInventory = async (storeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeService.getStoreInventory(storeId);
      if (res.success && res.data) {
        setInventory(res.data);
        // Initialize counts with system quantity
        const initialCounts: { [productId: number]: string } = {};
        res.data.forEach((item: any) => {
          initialCounts[item.product_id] = String(item.quantity);
        });
        setCounts(initialCounts);
      } else {
        setInventory([]);
        setCounts({});
      }
    } catch {
      setInventory([]);
      setCounts({});
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (productId: number, value: string) => {
    setCounts({ ...counts, [productId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const items = inventory.map((item: any) => ({
        product_id: item.product_id,
        counted_quantity: Number(counts[item.product_id] || item.quantity)
      }));
      const res = await axios.post('/api/financial/stock-take', {
        store_id: selectedStore,
        items,
        staff_id: 1 // TODO: Replace with actual user ID
      });
      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.error || 'Failed to post stock take');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post stock take');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            to="/stock-take-history"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            View Stock Take History
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Stock Take</h1>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Store</label>
          <select
            className="border rounded px-3 py-2"
            value={selectedStore}
            onChange={e => setSelectedStore(Number(e.target.value) || '')}
          >
            <option value="">Select a store</option>
            {stores.map((s: any) => (
              <option key={s.id} value={s.id}>{s.store_name}</option>
            ))}
          </select>
        </div>
        {selectedStore && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No inventory found for this store.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">System Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Counted Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {inventory.map((item: any) => {
                      const counted = counts[item.product_id] !== undefined ? Number(counts[item.product_id]) : item.quantity;
                      const diff = counted - item.quantity;
                      const product = products.find((p: any) => p.id === item.product_id);
                      return (
                        <tr key={item.product_id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{product ? product.product_name : item.product_id}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <input
                              type="number"
                              className="border rounded px-2 py-1 w-24"
                              value={counts[item.product_id] ?? item.quantity}
                              onChange={e => handleCountChange(item.product_id, e.target.value)}
                            />
                          </td>
                          <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${diff === 0 ? 'text-gray-700' : diff > 0 ? 'text-green-700' : 'text-red-700'}`}>{diff}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <button
              type="submit"
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled={submitting || loading}
            >
              {submitting ? 'Posting...' : 'Post Stock Take'}
            </button>
            {error && <div className="mt-2 text-red-600">{error}</div>}
            {result && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
                <div className="font-bold text-green-700 mb-2">Stock take posted successfully!</div>
                {result.adjustments && result.adjustments.length > 0 ? (
                  <div>
                    <div className="mb-2 font-semibold">Adjustments:</div>
                    <ul className="list-disc ml-6">
                      {result.adjustments.map((adj: any) => {
                        const product = products.find((p: any) => p.id === adj.product_id);
                        return (
                          <li key={adj.product_id}>
                            {product ? product.product_name : adj.product_id}: System {adj.system_quantity}, Counted {adj.counted_quantity}, Difference {adj.diff}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div>No adjustments were needed. All quantities matched.</div>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default StockTakePage; 