import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import { Building2, Plus, Pencil, Trash2, Truck } from 'lucide-react';
import PaymentModal from '../components/Clients/PaymentModal';

const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const numericId = Number(id);
      const [clientData, invoicesRes, paymentsRes] = await Promise.all([
        clientService.getClient(numericId),
        clientService.getCustomerInvoices(numericId),
        clientService.getCustomerPayments(numericId)
      ]);
      setClient(clientData);
      setInvoices(invoicesRes.success ? invoicesRes.data : []);
      setPayments(paymentsRes.success ? paymentsRes.data : []);
      console.log('Fetched invoices:', invoicesRes.success ? invoicesRes.data : []);
      console.log('Fetched payments:', paymentsRes.success ? paymentsRes.data : []);
    } catch (error: any) {
      console.error('Error fetching client, invoices, or payments:', error);
      if (error?.response?.status === 404) {
        setError('Client not found (404)');
      } else {
        setError(error?.message || error?.response?.data?.message || 'Failed to load client data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!id) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await clientService.getClientHistory(Number(id));
      setHistory(data);
    } catch (err: any) {
      setHistoryError('Failed to fetch client history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard/clients')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Client not found</p>
          <button
            onClick={() => navigate('/dashboard/clients')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name || client.company_name}</h1>
          <p className="text-gray-600">{client.address}</p>
        </div>
        <button
          onClick={() => navigate(`/customers/${client.id}/ledger`)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
        >
          View Ledger
        </button>
        <button
          onClick={() => navigate(`/customers/${client.id}/payments`)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Payments
        </button>
      </div>

      {/* Invoices Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No invoices found</td>
                </tr>
              ) : (
                invoices.map((inv: any) => {
                  const paid = payments
                    .filter((p: any) => p.invoice_id === inv.id && p.status === 'confirmed')
                    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
                  const balance = Number(inv.total_amount) - paid;
                  return (
                    <tr key={inv.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.invoice_number || inv.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.so_number || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {inv.total_amount != null && !isNaN(Number(inv.total_amount))
                          ? Number(inv.total_amount).toLocaleString(undefined, { style: 'currency', currency: 'KES' })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.status || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-700 font-semibold">
                        {paid > 0 ? paid.toLocaleString(undefined, { style: 'currency', currency: 'KES' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold {balance === 0 ? 'text-green-700' : 'text-red-700'}">
                        {balance.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPaymentModalOpen(true);
                          }}
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Client History Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Client History</h2>
        {historyLoading ? (
          <div className="text-gray-600">Loading history...</div>
        ) : historyError ? (
          <div className="text-red-600">{historyError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Running Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No history found</td>
                  </tr>
                ) : (
                  history.map((entry: any) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date ? new Date(entry.date).toLocaleDateString() : ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.reference_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.reference_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{Number(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{Number(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{Number(entry.running_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={selectedInvoice}
        clientId={client.id}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default ClientDetailsPage; 