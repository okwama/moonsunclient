import React, { useEffect, useState } from 'react';
import { stockTransferService, productsService } from '../services/financialService';
import axios from 'axios';
import StockTransferPage from './StockTransferPage';

const StockTransferHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    from_store_id: '',
    to_store_id: '',
    product_id: '',
    start_date: '',
    end_date: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchProducts();
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [filters]);

  const fetchStores = async () => {
    const res = await axios.get('/api/financial/stores');
    if (res.data.success) setStores(res.data.data);
  };
  const fetchProducts = async () => {
    const res = await axios.get('/api/financial/products');
    if (res.data.success) setProducts(res.data.data);
  };
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.from_store_id) params.from_store_id = filters.from_store_id;
      if (filters.to_store_id) params.to_store_id = filters.to_store_id;
      if (filters.product_id) params.product_id = filters.product_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      params.page = page;
      params.limit = pageSize;
      const res = await stockTransferService.getHistory(params);
      if (res.success && res.data) {
        setHistory(res.data);
        if (res.pagination && res.pagination.totalPages) setTotalPages(res.pagination.totalPages);
        else setTotalPages(1);
      } else {
        setHistory([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Failed to fetch transfer history');
      setHistory([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 mb-0">Stock Transfer History</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => setShowModal(true)}
          >
            + Add Transfer
          </button>
        </div>
        {/* Modal for Add Transfer */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Add Stock Transfer</h2>
              {/* Inline the StockTransferPage form logic here, or extract the form to a component for reuse */}
              <StockTransferPage
                onSuccess={() => {
                  setShowModal(false);
                  fetchHistory();
                }}
                isModal={true}
              />
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Store</label>
            <select name="from_store_id" value={filters.from_store_id} onChange={handleFilterChange} className="border rounded px-3 py-2">
              <option value="">All</option>
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>{s.store_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Store</label>
            <select name="to_store_id" value={filters.to_store_id} onChange={handleFilterChange} className="border rounded px-3 py-2">
              <option value="">All</option>
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>{s.store_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select name="product_id" value={filters.product_id} onChange={handleFilterChange} className="border rounded px-3 py-2">
              <option value="">All</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.product_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" name="start_date" value={filters.start_date} onChange={handleDateChange} className="border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" name="end_date" value={filters.end_date} onChange={handleDateChange} className="border rounded px-3 py-2" />
          </div>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transfer history found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From Store</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To Store</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {history.map((t: any) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{t.transfer_date ? new Date(t.transfer_date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{t.from_store_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{t.to_store_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{t.product_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{t.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{t.staff_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{t.reference || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{t.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockTransferHistoryPage; 