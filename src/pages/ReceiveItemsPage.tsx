import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { purchaseOrdersService } from '../services/financialService';
import { storeService } from '../services/storeService';
import { PurchaseOrder, Store, ReceiveItemsForm } from '../types/financial';

const ReceiveItemsPage: React.FC = () => {
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const navigate = useNavigate();
  
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | ''>('');
  const [receivingItems, setReceivingItems] = useState<{
    product_id: number;
    received_quantity: number;
    unit_cost: number;
    product_name?: string;
    product_code?: string;
    max_quantity: number;
  }[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (purchaseOrderId) {
      fetchPurchaseOrder();
      fetchStores();
    }
  }, [purchaseOrderId]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await purchaseOrdersService.getWithReceipts(parseInt(purchaseOrderId!));
      if (response.success) {
        setPurchaseOrder(response.data);
        // Initialize receiving items with remaining quantities
        const items = response.data.items?.map((item: any) => ({
          product_id: item.product_id,
          received_quantity: 0,
          unit_cost: item.unit_price,
          product_name: item.product_name,
          product_code: item.product_code,
          max_quantity: item.quantity - (item.received_quantity || 0)
        })) || [];
        setReceivingItems(items);
      } else {
        setError(response.error || 'Failed to fetch purchase order');
      }
    } catch (err) {
      setError('Failed to fetch purchase order');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await storeService.getAllStores();
      if (response.success) {
        setStores(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const handleQuantityChange = (index: number, value: number) => {
    const updatedItems = [...receivingItems];
    const item = updatedItems[index];
    const maxQuantity = item.max_quantity;
    
    // Ensure quantity doesn't exceed max and is not negative
    const validQuantity = Math.max(0, Math.min(value, maxQuantity));
    
    updatedItems[index] = {
      ...item,
      received_quantity: validQuantity
    };
    
    setReceivingItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStore) {
      setError('Please select a store');
      return;
    }

    const itemsToReceive = receivingItems.filter(item => item.received_quantity > 0);
    
    if (itemsToReceive.length === 0) {
      setError('Please enter quantities for at least one item');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const receiveData: ReceiveItemsForm = {
        storeId: selectedStore as number,
        items: itemsToReceive,
        notes
      };

      const response = await purchaseOrdersService.receiveItems(
        parseInt(purchaseOrderId!),
        receiveData
      );

      if (response.success) {
        alert('Items received successfully!');
        navigate('/purchase-orders');
      } else {
        setError(response.error || 'Failed to receive items');
      }
    } catch (err) {
      setError('Failed to receive items');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalReceiving = () => {
    return receivingItems.reduce((total, item) => {
      return total + (item.received_quantity * item.unit_cost);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !purchaseOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
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

  if (!purchaseOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Purchase Order not found</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Receive Items</h1>
              <p className="mt-2 text-sm text-gray-600">
                Receive items from Purchase Order {purchaseOrder.po_number}
              </p>
            </div>
            <button
              onClick={() => navigate('/purchase-orders')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Purchase Orders
            </button>
          </div>
        </div>

        {/* Purchase Order Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">PO Number</p>
              <p className="text-sm font-medium text-gray-900">{purchaseOrder.po_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="text-sm font-medium text-gray-900">{purchaseOrder.supplier?.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(purchaseOrder.order_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{purchaseOrder.status}</p>
            </div>
          </div>
        </div>

        {/* Receive Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Receive Items</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Store Selection */}
          <div className="mb-6">
            <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-2">
              Select Store *
            </label>
            <select
              id="store"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value ? parseInt(e.target.value) : '')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a store...</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.store_name} ({store.store_code})
                </option>
              ))}
            </select>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Items to Receive</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Already Received
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receive Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receivingItems.map((item, index) => (
                    <tr key={item.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.product_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchaseOrder.items?.find(i => i.product_id === item.product_id)?.quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchaseOrder.items?.find(i => i.product_id === item.product_id)?.received_quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.max_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={item.max_quantity}
                          value={item.received_quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          disabled={item.max_quantity === 0}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unit_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.received_quantity * item.unit_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add any notes about this receipt..."
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Total Receiving:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(getTotalReceiving())}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/purchase-orders')}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || getTotalReceiving() === 0}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Receiving...' : 'Receive Items'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiveItemsPage; 