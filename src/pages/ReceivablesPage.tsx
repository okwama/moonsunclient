import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AgingReceivable {
  customer_id: number;
  company_name: string;
  total_receivable: number;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

interface Receipt {
  id: number;
  customer_id: number;
  receipt_number: string;
  receipt_date: string;
  amount: number;
  payment_method: string;
  account_id: number;
  reference: string;
  notes: string;
  status: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReceivablesPage: React.FC = () => {
  const [receivables, setReceivables] = useState<AgingReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AgingReceivable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [reference, setReference] = useState('');
  const [pendingReceipts, setPendingReceipts] = useState<Receipt[]>([]);
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState('');
  const [accountLedger, setAccountLedger] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    fetchReceivables();
    fetchAccounts();
    fetchPendingReceipts();
  }, []);

  const fetchReceivables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/receivables/aging`);
      if (res.data.success) {
        setReceivables(res.data.data);
      } else {
        setError(res.data.error || 'Failed to fetch receivables');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch receivables');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/accounts`);
      if (res.data.success) {
        // Only asset accounts (e.g., Cash, Bank)
        setAccounts(res.data.data.filter((a: Account) => a.account_code.startsWith('1')));
      }
    } catch {}
  };

  const fetchPendingReceipts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/receipts?status=in%20pay`);
      if (res.data.success) setPendingReceipts(res.data.data);
    } catch {}
  };

  const fetchAccountLedger = async (accountId: string) => {
    setLedgerLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/accounts/${accountId}/ledger`);
      if (res.data.success) setAccountLedger(res.data.data);
    } catch {
      setAccountLedger([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLedgerAccount) fetchAccountLedger(selectedLedgerAccount);
  }, [selectedLedgerAccount]);

  const openPaymentModal = async (customer: AgingReceivable) => {
    if (accounts.length === 0) {
      await fetchAccounts();
    }
    setSelectedCustomer(customer);
    setPaymentAmount(Number(customer.total_receivable || 0).toFixed(2));
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('cash');
    setPaymentNotes('');
    setSelectedAccount(accounts.length > 0 ? String(accounts[0].id) : '');
    setReference('');
    setShowModal(true);
    setSuccessMsg('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentMethod('cash');
    setPaymentNotes('');
    setSubmitting(false);
    setSuccessMsg('');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);
    setSuccessMsg('');
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/financial/receivables/payment`, {
        customer_id: selectedCustomer.customer_id,
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes: paymentNotes,
        account_id: selectedAccount,
        reference,
      });
      if (res.data.success) {
        setSuccessMsg('Payment recorded successfully!');
        fetchReceivables();
        setTimeout(() => {
          closeModal();
        }, 1200);
      } else {
        setError(res.data.error || 'Failed to record payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async (receiptId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/financial/receivables/confirm-payment`, { receipt_id: receiptId });
      fetchPendingReceipts();
      fetchReceivables();
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Aging Receivables</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Customer</th>
                <th className="px-4 py-2 border-b">Total Receivable</th>
                <th className="px-4 py-2 border-b">Current</th>
                <th className="px-4 py-2 border-b">1-30 Days</th>
                <th className="px-4 py-2 border-b">31-60 Days</th>
                <th className="px-4 py-2 border-b">61-90 Days</th>
                <th className="px-4 py-2 border-b">90+ Days</th>
                <th className="px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {receivables.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">No outstanding receivables.</td>
                </tr>
              ) : (
                receivables.map((row) => (
                  <tr key={row.customer_id}>
                    <td className="px-4 py-2 border-b">{row.company_name}</td>
                    <td className="px-4 py-2 border-b font-semibold">{row.total_receivable.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">{row.current.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">{row.days_1_30.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">{row.days_31_60.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">{row.days_61_90.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">{row.days_90_plus.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => openPaymentModal(row)}
                      >
                        Collect Payment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
              disabled={submitting}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Collect Payment from {selectedCustomer?.company_name}</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {successMsg && <div className="text-green-600 mb-2">{successMsg}</div>}
            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Receipt Account</label>
                <select
                  value={selectedAccount}
                  onChange={e => setSelectedAccount(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_name} ({acc.account_code})</option>
                  ))}
                </select>
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <input
                  type="text"
                  value="in pay"
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Receipts Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Pending Receipts ("in pay")</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Receipt #</th>
                <th className="px-4 py-2 border-b">Customer</th>
                <th className="px-4 py-2 border-b">Date</th>
                <th className="px-4 py-2 border-b">Amount</th>
                <th className="px-4 py-2 border-b">Account</th>
                <th className="px-4 py-2 border-b">Reference</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">No pending receipts.</td>
                </tr>
              ) : (
                pendingReceipts.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 border-b">{r.receipt_number}</td>
                    <td className="px-4 py-2 border-b">{receivables.find(c => c.customer_id === r.customer_id)?.company_name || r.customer_id}</td>
                    <td className="px-4 py-2 border-b">{r.receipt_date}</td>
                    <td className="px-4 py-2 border-b">{r.amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">{accounts.find(a => a.id === r.account_id)?.account_name || r.account_id}</td>
                    <td className="px-4 py-2 border-b">{r.reference}</td>
                    <td className="px-4 py-2 border-b">{r.status}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => handleConfirmPayment(r.id)}
                      >
                        Confirm
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Ledger Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Account Ledger</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Account</label>
          <select
            value={selectedLedgerAccount}
            onChange={e => setSelectedLedgerAccount(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 max-w-xs"
          >
            <option value="">-- Select Account --</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.account_name} ({acc.account_code})</option>
            ))}
          </select>
        </div>
        {ledgerLoading ? (
          <div>Loading ledger...</div>
        ) : accountLedger.length === 0 && selectedLedgerAccount ? (
          <div>No ledger entries for this account.</div>
        ) : accountLedger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Description</th>
                  <th className="px-4 py-2 border-b">Reference</th>
                  <th className="px-4 py-2 border-b">Debit</th>
                  <th className="px-4 py-2 border-b">Credit</th>
                  <th className="px-4 py-2 border-b">Running Balance</th>
                  <th className="px-4 py-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {accountLedger.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border-b">{entry.date?.split('T')[0]}</td>
                    <td className="px-4 py-2 border-b">{entry.description}</td>
                    <td className="px-4 py-2 border-b">{entry.reference_type} #{entry.reference_id}</td>
                    <td className="px-4 py-2 border-b">{entry.debit ? entry.debit.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : ''}</td>
                    <td className="px-4 py-2 border-b">{entry.credit ? entry.credit.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : ''}</td>
                    <td className="px-4 py-2 border-b">{entry.running_balance?.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="px-4 py-2 border-b">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReceivablesPage; 