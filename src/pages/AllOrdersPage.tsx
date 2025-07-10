// AllOrdersPage.tsx - View all sales orders in one place
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesOrdersService } from '../services/financialService';
import { SalesOrder } from '../types/financial';

interface SalesOrderRow {
  id: number;
  order_number: string;
  customer: string;
  order_date: string;
  status: string;
  total_amount: number;
}

const AllOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const soRes = await salesOrdersService.getAll();
      const soRows: SalesOrderRow[] = (soRes.data || []).map((so: SalesOrder) => ({
        id: so.id,
        order_number: so.so_number,
        customer: (so.customer_name || so.customer?.company_name || 'N/A'),
        order_date: so.order_date,
        status: so.status,
        total_amount: so.total_amount
      }));
      setOrders(soRows.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()));
    } catch (err) {
      setError('Failed to fetch sales orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id: number) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await salesOrdersService.getById(id);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
      } else {
        setDetailsError(res.error || 'Failed to fetch order details');
      }
    } catch (err) {
      setDetailsError('Failed to fetch order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setDetailsError(null);
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
        <div className="max-w-7xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
          <p className="mt-2 text-sm text-gray-600">View all sales orders</p>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sales orders found</h3>
              <p className="mt-1 text-sm text-gray-500">No sales orders have been created yet.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.order_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(order.total_amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/sales-orders/${order.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                    </td>
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

export default AllOrdersPage; 