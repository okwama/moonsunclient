import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/clientService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  clientId: number;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, invoice, clientId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState('received');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (isOpen) {
      clientService.getPaymentAccounts().then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          setAccounts(res.data);
        } else if (Array.isArray(res)) {
          setAccounts(res); // fallback if not wrapped in {success, data}
        }
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }
      if (!date) {
        setError('Please select a date');
        setLoading(false);
        return;
      }
      if (!accountId) {
        setError('Please select a receiving account');
        setLoading(false);
        return;
      }
      // Call backend API to create payment
      const res = await fetch(`/api/customers/${clientId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: clientId,
          amount: Number(amount),
          reference,
          status,
          payment_date: date,
          invoice_id: invoice.id,
          account_id: accountId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record payment');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Record Payment for Invoice #{invoice?.invoice_number || invoice?.id}</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Receiving Account</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select account</option>
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_code} - {acc.account_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal; 