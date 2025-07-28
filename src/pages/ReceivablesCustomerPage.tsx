import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'mpesa', label: 'Mpesa' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

const ReceivablesCustomerPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    if (customerId) fetchPendingInvoices(customerId);
  }, [customerId]);

  const fetchPendingInvoices = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all sales orders for this customer
      const res = await axios.get(`${API_BASE_URL}/financial/sales-orders?customer_id=${id}`);
      if (res.data.success) {
        // Only show invoices not fully paid
        const pending = (res.data.data || []).filter((inv: any) => {
          const amountPaid = inv.amount_paid || 0;
          return inv.total_amount > amountPaid;
        });
        setInvoices(pending);
        if (pending.length > 0) setCustomer(pending[0].customer || null);
      } else {
        setError(res.data.error || 'Failed to fetch invoices');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Pending Invoices{customer ? ` for ${customer.company_name}` : ''}
          </h1>
          <div className="flex gap-4 items-center">
            <button
              className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow ${selectedInvoices.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              disabled={selectedInvoices.length === 0}
              onClick={() => setShowBulkModal(true)}
            >
              Bulk Payment
            </button>
            <Link to="/receivables" className="text-blue-600 hover:underline">Back to Receivables</Link>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No pending invoices for this customer.</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all invoices"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-blue-50">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(inv.id)}
                        onChange={() => handleSelectInvoice(inv.id)}
                        aria-label={`Select invoice ${inv.so_number}`}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer" onClick={() => navigate(`/sales-orders/${inv.id}`)}>{inv.so_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer" onClick={() => navigate(`/sales-orders/${inv.id}`)}>{inv.order_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right cursor-pointer" onClick={() => navigate(`/sales-orders/${inv.id}`)}>{formatCurrency(inv.total_amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right cursor-pointer" onClick={() => navigate(`/sales-orders/${inv.id}`)}>{formatCurrency(inv.amount_paid || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right cursor-pointer" onClick={() => navigate(`/sales-orders/${inv.id}`)}>{formatCurrency(inv.total_amount - (inv.amount_paid || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <BulkPaymentModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        invoices={invoices.filter(inv => selectedInvoices.includes(inv.id))}
        customerId={customerId}
        onSuccess={() => fetchPendingInvoices(customerId || '')}
      />
    </div>
  );
};

// BulkPaymentModal component
const BulkPaymentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  invoices: any[];
  customerId?: string;
  onSuccess: () => void;
}> = ({ open, onClose, invoices, customerId, onSuccess }) => {
  const [amounts, setAmounts] = useState<{ [id: string]: number }>({});
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [accountId, setAccountId] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      // Reset amounts and fields when modal opens
      const initial: { [id: string]: number } = {};
      invoices.forEach(inv => {
        initial[inv.id] = 0;
      });
      setAmounts(initial);
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('cash');
      setAccountId('');
      setReference('');
      setNotes('');
      setError(null);
      // Fetch accounts
      axios.get('/api/payroll/payment-accounts').then(res => {
        if (res.data.success) setAccounts(res.data.data);
      });
    }
  }, [open, invoices]);

  const handleChange = (id: string, value: string) => {
    const num = Math.max(0, Math.min(Number(value), invoices.find(inv => inv.id === id)?.total_amount - (invoices.find(inv => inv.id === id)?.amount_paid || 0)));
    setAmounts(a => ({ ...a, [id]: isNaN(num) ? 0 : num }));
  };

  const total = Object.values(amounts).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payments = Object.entries(amounts)
        .filter(([_, amount]) => Number(amount) > 0)
        .map(([invoiceId, amount]) => ({ invoiceId, amount: Number(amount) }));
      for (const p of payments) {
        await axios.post('/api/financial/receivables/payment', {
          customer_id: customerId,
          invoice_id: p.invoiceId,
          amount: p.amount,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          account_id: accountId,
          reference,
          notes,
        });
      }
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to record payment');
    }
  };

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Bulk Payment Assignment</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
          {invoices.map(inv => {
            const balance = inv.total_amount - (inv.amount_paid || 0);
            return (
              <div key={inv.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-semibold">{inv.so_number}</div>
                  <div className="text-xs text-gray-500">Balance: {formatCurrency(balance)}</div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={balance}
                  value={amounts[inv.id] || ''}
                  onChange={e => handleChange(inv.id, e.target.value)}
                  className="border rounded px-2 py-1 w-28 text-right"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            );
          })}
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Date</label>
            <input type="date" className="border rounded px-2 py-1 w-full" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
            <select className="border rounded px-2 py-1 w-full" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={loading}>
              {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
            <select className="border rounded px-2 py-1 w-full" value={accountId} onChange={e => setAccountId(e.target.value)} disabled={loading}>
              <option value="">Select account</option>
              {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Reference</label>
            <input type="text" className="border rounded px-2 py-1 w-full" value={reference} onChange={e => setReference(e.target.value)} disabled={loading} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" className="border rounded px-2 py-1 w-full" value={notes} onChange={e => setNotes(e.target.value)} disabled={loading} />
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="font-semibold">Total Payment:</span>
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </div>
        {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={total <= 0 || !accountId || loading}
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ReceivablesCustomerPage; 