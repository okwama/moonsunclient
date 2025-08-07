import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import { Building2, Plus, Pencil, Trash2, Truck, FileText } from 'lucide-react';
import PaymentModal from '../components/Clients/PaymentModal';
import { creditNoteService } from '../services/creditNoteService';

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
  const [unconfirmedPayments, setUnconfirmedPayments] = useState<any[]>([]);
  const [unconfirmedPaymentsLoading, setUnconfirmedPaymentsLoading] = useState(false);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [creditNotesLoading, setCreditNotesLoading] = useState(false);

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

  const fetchUnconfirmedPayments = async () => {
    if (!id) return;
    setUnconfirmedPaymentsLoading(true);
    try {
      const response = await fetch(`/api/financial/receipts?status=in pay`);
      const data = await response.json();
      if (data.success) {
        // Filter receipts for this specific client
        const clientReceipts = data.data.filter((receipt: any) => receipt.client_id === Number(id));
        setUnconfirmedPayments(clientReceipts);
      } else {
        setUnconfirmedPayments([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch unconfirmed payments:', err);
      setUnconfirmedPayments([]);
    } finally {
      setUnconfirmedPaymentsLoading(false);
    }
  };

  const fetchCreditNotes = async () => {
    if (!id) return;
    setCreditNotesLoading(true);
    try {
      const response = await creditNoteService.getCustomerCreditNotes(Number(id));
      if (response.success) {
        setCreditNotes(response.data);
      } else {
        setCreditNotes([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch credit notes:', err);
      setCreditNotes([]);
    } finally {
      setCreditNotesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchHistory();
    fetchUnconfirmedPayments();
    fetchCreditNotes();
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
        >
          View Payments
        </button>
        <button
          onClick={() => navigate(`/dashboard/clients/${client.id}/credit-note`)}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center"
        >
          <FileText className="w-4 h-4 mr-2" />
          Create Credit Note
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
                        <div className="flex space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsPaymentModalOpen(true);
                            }}
                          >
                            Record Payment
                          </button>
                          <button
                            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs flex items-center"
                            onClick={() => navigate(`/create-credit-note?customerId=${client.id}&invoiceId=${inv.id}`)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Credit Note
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Notes Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Credit Notes</h2>
          <button
            onClick={() => navigate(`/create-credit-note?customerId=${client.id}`)}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Credit Note
          </button>
        </div>
        {creditNotesLoading ? (
          <div className="text-gray-600">Loading credit notes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Note #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditNotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No credit notes found</td>
                  </tr>
                ) : (
                  creditNotes.map((creditNote: any) => (
                    <tr key={creditNote.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{creditNote.credit_note_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {creditNote.credit_note_date ? new Date(creditNote.credit_note_date).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {creditNote.original_invoice_id ? `INV-${creditNote.original_invoice_id}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{creditNote.reason || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-orange-700">
                        {creditNote.total_amount ? Number(creditNote.total_amount).toLocaleString(undefined, { style: 'currency', currency: 'KES' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          creditNote.status === 'active' ? 'bg-green-100 text-green-800' :
                          creditNote.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {creditNote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          onClick={() => navigate(`/credit-notes/${creditNote.id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unconfirmed Payments Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Unconfirmed Payments</h2>
        {unconfirmedPaymentsLoading ? (
          <div className="text-gray-600">Loading unconfirmed payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unconfirmedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No unconfirmed payments found</td>
                  </tr>
                ) : (
                  unconfirmedPayments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.receipt_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.receipt_date ? new Date(payment.receipt_date).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.payment_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.reference || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.invoice_number ? `INV-${payment.invoice_number}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-700">
                        {payment.amount ? Number(payment.amount).toLocaleString(undefined, { style: 'currency', currency: 'KES' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.notes || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/financial/receivables/confirm-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ receipt_id: payment.id }),
                              });
                              const data = await response.json();
                              if (data.success) {
                                // Refresh all data
                                fetchData();
                                fetchHistory();
                                fetchUnconfirmedPayments();
                              } else {
                                alert('Failed to confirm payment: ' + (data.error || 'Unknown error'));
                              }
                            } catch (err: any) {
                              alert('Error confirming payment: ' + err.message);
                            }
                          }}
                        >
                          Confirm Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
        onSuccess={() => {
          fetchData();
          fetchHistory();
          fetchUnconfirmedPayments();
        }}
      />
    </div>
  );
};

export default ClientDetailsPage; 