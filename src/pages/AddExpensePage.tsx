import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: number; // should be number, not string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddExpensePage: React.FC = () => {
  const [expenseAccounts, setExpenseAccounts] = useState<Account[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<Account[]>([]);
  const [selectedExpenseAccount, setSelectedExpenseAccount] = useState<Account | null>(null);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isPaid, setIsPaid] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/accounts`);
      if (res.data.success) {
        setExpenseAccounts(res.data.data.filter((a: Account) => a.account_type === 16));
        setPaymentAccounts(res.data.data.filter((a: Account) => a.account_type === 9));
      }
    } catch {
      setError('Failed to load accounts');
    }
  };

  const handleExpenseAccountChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = e.target.value;
    if (!accountId) {
      setSelectedExpenseAccount(null);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/accounts/${accountId}`);
      if (res.data.success) {
        setSelectedExpenseAccount(res.data.data);
      } else {
        setSelectedExpenseAccount(null);
      }
    } catch {
      setSelectedExpenseAccount(null);
    }
  };

  const handlePaymentAccountChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = e.target.value;
    if (!accountId) {
      setSelectedPaymentAccount(null);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/accounts/${accountId}`);
      if (res.data.success) {
        setSelectedPaymentAccount(res.data.data);
      } else {
        setSelectedPaymentAccount(null);
      }
    } catch {
      setSelectedPaymentAccount(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${API_BASE_URL}/financial/expenses`, {
        expense_account_id: selectedExpenseAccount ? selectedExpenseAccount.id : '',
        payment_account_id: isPaid && selectedPaymentAccount ? selectedPaymentAccount.id : '',
        amount: parseFloat(amount),
        date,
        description,
        reference,
        is_paid: isPaid,
      });
      if (res.data.success) {
        setSuccess('Expense posted successfully!');
        setSelectedExpenseAccount(null);
        setSelectedPaymentAccount(null);
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setReference('');
      } else {
        setError(res.data.error || 'Failed to post expense');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Post Expense</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Expense Account *</label>
          <select
            value={selectedExpenseAccount ? String(selectedExpenseAccount.id) : ''}
            onChange={handleExpenseAccountChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select Expense Account</option>
            {expenseAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.account_name} ({acc.account_code})</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Is this expense paid?</label>
          <select
            value={isPaid ? 'yes' : 'no'}
            onChange={e => setIsPaid(e.target.value === 'yes')}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="yes">Yes</option>
            <option value="no">No (Accrued)</option>
          </select>
        </div>
        {isPaid && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Payment Account *</label>
            <select
              value={selectedPaymentAccount ? String(selectedPaymentAccount.id) : ''}
              onChange={handlePaymentAccountChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required={isPaid}
            >
              <option value="">Select Payment Account</option>
              {paymentAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.account_name} ({acc.account_code})</option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reference</label>
          <input
            type="text"
            value={reference}
            onChange={e => setReference(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Posting...' : 'Post Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensePage; 