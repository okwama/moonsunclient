import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Payment {
  id: number;
  supplier_id: number;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  account_id: number;
  reference: string;
  notes: string;
  status: string;
  supplier_name?: string;
  account_name?: string;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PendingPaymentsPage: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [confirmingPayment, setConfirmingPayment] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingPayments();
    fetchAccounts();
    fetchSuppliers();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/payments?status=in%20pay`);
      if (res.data.success) {
        setPendingPayments(res.data.data);
      } else {
        setError(res.data.error || 'Failed to fetch pending payments');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/accounts`);
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/suppliers`);
      if (res.data.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const handleConfirmPayment = async (paymentId: number) => {
    setConfirmingPayment(paymentId);
    try {
      const res = await axios.post(`${API_BASE_URL}/financial/payables/confirm-payment`, { 
        payment_id: paymentId 
      });
      
      if (res.data.success) {
        setSuccessMsg('Payment confirmed successfully!');
        // Refresh the list
        await fetchPendingPayments();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(res.data.error || 'Failed to confirm payment');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm payment');
    } finally {
      setConfirmingPayment(null);
    }
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.company_name || `Supplier ID: ${supplierId}`;
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? `${account.account_name} (${account.account_code})` : `Account ID: ${accountId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in pay':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/payables" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payables
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Pending Payments</h1>
          </div>
          <div className="text-sm text-gray-500">
            {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Review and confirm payments that are currently in "in pay" status
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMsg}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pending Payments</h2>
        </div>
        
        {pendingPayments.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending payments</h3>
            <p className="mt-1 text-sm text-gray-500">
              All payments have been confirmed or there are no payments in pending status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.payment_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.payment_method.replace('_', ' ').toUpperCase()}
                        </div>
                        {payment.reference && (
                          <div className="text-xs text-gray-400">
                            Ref: {payment.reference}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getSupplierName(payment.supplier_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getAccountName(payment.account_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleConfirmPayment(payment.id)}
                        disabled={confirmingPayment === payment.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {confirmingPayment === payment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirm
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Pending Payments</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Payments in "in pay" status have been recorded but not yet confirmed. 
                Confirming a payment will update the supplier ledger and mark the payment as completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingPaymentsPage; 