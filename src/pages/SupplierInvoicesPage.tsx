import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, Link } from 'react-router-dom';

const SupplierInvoicesPage: React.FC = () => {
  const { supplierId: paramSupplierId } = useParams<{ supplierId: string }>();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const supplierId = paramSupplierId || query.get('supplierId');

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/financial/purchase-orders');
        if (res.data.success) {
          setInvoices((res.data.data || []).filter((po: any) => String(po.supplier_id) === String(supplierId) && po.status === 'received'));
        } else {
          setError('Failed to fetch invoices');
        }
      } catch (err) {
        setError('Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };
    if (supplierId) fetchInvoices();
  }, [supplierId]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Received Purchases for Supplier</h1>
      <div className="mb-4">
        <Link to="/suppliers" className="text-blue-600 hover:underline">Back to Suppliers</Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance Remaining</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">No received purchases found for this supplier.</td>
                </tr>
              ) : (
                invoices.map((po: any) => (
                  <tr key={po.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{po.po_number}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{po.order_date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{po.expected_delivery_date || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-blue-700 font-semibold">{Number(po.total_amount).toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-green-700 font-semibold">{Number(po.amount_paid || 0).toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-red-700 font-semibold">{Number(po.balance_remaining || (po.total_amount - (po.amount_paid || 0))).toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{po.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <Link to={`/purchase-orders/${po.id}`} className="text-blue-600 hover:underline">View</Link>
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

export default SupplierInvoicesPage; 