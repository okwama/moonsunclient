import React, { useEffect, useState } from 'react';
import { clientService } from '../services/clientService';
import axios from 'axios';

const UnconfirmedPaymentsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/financial/receipts?status=in pay');
      if (res.data.success) {
        setReceipts(res.data.data || []);
      } else {
        setReceipts([]);
        setError('Failed to fetch receipts');
      }
    } catch (err) {
      setError('Failed to fetch receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleConfirm = async (receipt: any) => {
    setActionLoading(receipt.id);
    try {
      await axios.post('/api/financial/receivables/confirm-payment', { receipt_id: receipt.id });
      fetchReceipts();
    } catch (err) {
      alert('Failed to confirm payment');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Unconfirmed Customer Payments</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">No unconfirmed payments found</td>
                </tr>
              ) : (
                receipts.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{r.receipt_date ? new Date(r.receipt_date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{r.company_name || r.customer_id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-green-700 font-semibold">{r.amount != null ? Number(r.amount).toLocaleString(undefined, { style: 'currency', currency: 'KES' }) : '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{r.reference || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{r.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        disabled={actionLoading === r.id}
                        onClick={() => handleConfirm(r)}
                      >
                        {actionLoading === r.id ? 'Confirming...' : 'Confirm'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnconfirmedPaymentsPage; 