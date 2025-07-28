import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Expense {
  id: number;
  account_id: number;
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  entry_date: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Get unique account names for dropdown
  const accountNames = Array.from(new Set(expenses.map(exp => exp.account_name))).sort();
  const [accountNameFilter, setAccountNameFilter] = useState('All');

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const res = await axios.get(`${API_BASE_URL}/financial/expenses?${params.toString()}`);
        if (res.data.success) {
          setExpenses(res.data.data);
        } else {
          setError(res.data.error || 'Failed to fetch expenses');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [startDate, endDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  // Filter expenses by account name
  const filteredExpenses = expenses.filter(exp =>
    accountNameFilter === 'All' || exp.account_name === accountNameFilter
  );
  const totalDebit = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.debit_amount) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">All Expenses</h1>
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="ml-2 px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
            disabled={!startDate && !endDate}
          >
            Clear Filter
          </button>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Account Name</label>
            <select
              value={accountNameFilter}
              onChange={e => setAccountNameFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="All">All</option>
              {accountNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 inline-block shadow">
          <div className="text-gray-700 text-sm font-medium mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-800">{
            isNaN(totalDebit)
              ? 'Ksh 0.00'
              : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(totalDebit)
          }</div>
        </div>
      </div>
      {loading ? (
        <div className="text-gray-600">Loading expenses...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">ID</th>
                <th className="px-4 py-2 border-b text-left">Account Code</th>
                <th className="px-4 py-2 border-b text-left">Account Name</th>
                <th className="px-4 py-2 border-b text-left">Debit Amount</th>
                <th className="px-4 py-2 border-b text-left">Description</th>
                <th className="px-4 py-2 border-b text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No expenses found.</td>
                </tr>
              ) : (
                filteredExpenses.map(expense => (
                  <tr key={expense.id}>
                    <td className="px-4 py-2 border-b">{expense.id}</td>
                    <td className="px-4 py-2 border-b">{expense.account_code}</td>
                    <td className="px-4 py-2 border-b">{expense.account_name}</td>
                    <td className="px-4 py-2 border-b">{expense.debit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 border-b">{expense.description || '-'}</td>
                    <td className="px-4 py-2 border-b">{formatDate(expense.entry_date)}</td>
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

export default ExpensesPage; 