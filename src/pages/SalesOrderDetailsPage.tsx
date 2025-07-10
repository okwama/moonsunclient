import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { salesOrdersService } from '../services/financialService';
import { SalesOrder } from '../types/financial';

const SalesOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchSalesOrder();
    // eslint-disable-next-line
  }, [id]);

  const fetchSalesOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await salesOrdersService.getById(Number(id));
      if (res.success && res.data) {
        setSalesOrder(res.data);
      } else {
        setError(res.error || 'Failed to fetch sales order');
      }
    } catch (err) {
      setError('Failed to fetch sales order');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
        </div>
      </div>
    );
  }

  if (!salesOrder) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Order #{salesOrder.so_number}</h1>
            <p className="text-gray-600 mt-1">Customer: {salesOrder.customer?.company_name || 'N/A'}</p>
            <p className="text-gray-600 mt-1">Order Date: {formatDate(salesOrder.order_date)}</p>
            {salesOrder.expected_delivery_date && (
              <p className="text-gray-600 mt-1">Expected Delivery: {formatDate(salesOrder.expected_delivery_date)}</p>
            )}
            <p className="text-gray-600 mt-1">Status: {salesOrder.status}</p>
          </div>
          <Link to="/all-orders" className="text-blue-600 hover:underline">Back to Sales Orders</Link>
        </div>

        {/* Items Sold */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Items Sold</h2>
          {salesOrder.items && salesOrder.items.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.product?.product_name || 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No items found for this sales order.</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-gray-900 font-medium">{formatCurrency(salesOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Tax:</span>
              <span className="text-gray-900 font-medium">{formatCurrency(salesOrder.tax_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total:</span>
              <span className="text-gray-900 font-bold">{formatCurrency(salesOrder.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetailsPage; 