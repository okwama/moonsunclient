import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Calendar,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { 
  customersService, 
  productsService,
  invoiceService
} from '../services/financialService';
import { 
  creditNoteService,
  CreditNoteItem,
  CustomerInvoice
} from '../services/creditNoteService';
import { 
  Customer, 
  Product
} from '../types/financial';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateCreditNotePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInvoiceItems, setLoadingInvoiceItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [clientId, setClientId] = useState('');
  const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [items, setItems] = useState<CreditNoteItem[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const urlClientId = searchParams.get('customerId');
    const urlInvoiceId = searchParams.get('invoiceId');
    
    if (urlClientId) {
      setClientId(urlClientId);
    }
    
    if (urlInvoiceId && customerInvoices.length > 0) {
      const invoice = customerInvoices.find(inv => inv.id === parseInt(urlInvoiceId));
      if (invoice) {
        setSelectedInvoice(invoice);
      }
    }
  }, [searchParams, customerInvoices]);

  useEffect(() => {
    if (clientId) {
      fetchCustomerInvoices();
    }
  }, [clientId]);

  // Auto-load invoice items when invoice is selected
  useEffect(() => {
    if (selectedInvoice) {
      loadInvoiceItems();
    }
  }, [selectedInvoice]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, productsRes] = await Promise.all([
        customersService.getAll(),
        productsService.getAll()
      ]);

      if (customersRes.success) {
        setCustomers(customersRes.data || []);
      }
      if (productsRes.success) {
        setProducts(productsRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerInvoices = async () => {
    try {
      const response = await creditNoteService.getCustomerInvoices(parseInt(clientId));
      if (response.success) {
        setCustomerInvoices(response.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching customer invoices:', err);
      setCustomerInvoices([]);
    }
  };

  const handleInvoiceSelect = (invoice: CustomerInvoice) => {
    setSelectedInvoice(invoice);
    setItems([]); // Clear existing items
  };

  const addItem = () => {
    const newItem: CreditNoteItem = {
      product_id: 0,
      invoice_id: selectedInvoice?.id,
      quantity: 1,
      unit_price: 0,
      total_price: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof CreditNoteItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Calculate total price
    if (field === 'quantity' || field === 'unit_price') {
      const item = updatedItems[index];
      item.total_price = item.quantity * item.unit_price;
    }

    // Set product details if product_id changed
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].product = product;
        updatedItems[index].unit_price = product.selling_price || 0;
        updatedItems[index].total_price = updatedItems[index].quantity * (product.selling_price || 0);
      }
    }

    setItems(updatedItems);
  };

  const loadInvoiceItems = async () => {
    if (!selectedInvoice) return;

    setLoadingInvoiceItems(true);
    try {
      const response = await invoiceService.getById(selectedInvoice.id);
      
      if (response.success && response.data && response.data.items) {
        // Convert invoice items to credit note items
        const creditNoteItems: CreditNoteItem[] = response.data.items.map((item: any) => ({
          product_id: item.product_id,
          invoice_id: selectedInvoice.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));
        
        setItems(creditNoteItems);
      } else {
        // Fallback to generic item if no items found
        const newItem: CreditNoteItem = {
          product_id: 0,
          invoice_id: selectedInvoice.id,
          quantity: 1,
          unit_price: selectedInvoice.total_amount,
          total_price: selectedInvoice.total_amount
        };
        setItems([newItem]);
      }
    } catch (error) {
      console.error('Error loading invoice items:', error);
      // Fallback to generic item on error
      const newItem: CreditNoteItem = {
        product_id: 0,
        invoice_id: selectedInvoice.id,
        quantity: 1,
        unit_price: selectedInvoice.total_amount,
        total_price: selectedInvoice.total_amount
      };
      setItems([newItem]);
    } finally {
      setLoadingInvoiceItems(false);
    }
  };

  const TAX_RATE = 0.16;
  const TAX_DIVISOR = 1 + TAX_RATE;

  const calculateNet = (price: number) => price / TAX_DIVISOR;
  const calculateTax = (price: number) => price - calculateNet(price);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateNet(item.total_price), 0);
  };

  const calculateTaxTotal = () => {
    return items.reduce((sum, item) => sum + calculateTax(item.total_price), 0);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      setError('Please select a customer');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    if (items.some(item => item.product_id === 0)) {
      setError('Please select products for all items');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const creditNoteData = {
        customer_id: parseInt(clientId),
        credit_note_date: creditNoteDate,
        reason: reason || undefined,
        original_invoice_id: selectedInvoice?.id,
        items: items
      };

      const response = await creditNoteService.create(creditNoteData);
      
      if (response.success) {
        setSuccess(`Credit note ${response.data.credit_note_number} created successfully!`);
        // Reset form
        setClientId('');
        setCreditNoteDate(new Date().toISOString().split('T')[0]);
        setReason('');
        setSelectedInvoice(null);
        setItems([]);
        setCustomerInvoices([]);
      } else {
        setError(response.error || 'Failed to create credit note');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create credit note');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Credit Note</h1>
              <p className="text-sm text-gray-500">Generate a credit note for a client</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

                 {/* Customer Selection */}
         <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Customer *
           </label>
           <select
             value={clientId}
             onChange={(e) => {
               setClientId(e.target.value);
               setSelectedInvoice(null);
               setItems([]);
             }}
             className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             required
           >
             <option value="">Select a customer</option>
             {customers.map((customer) => (
               <option key={customer.id} value={customer.id}>
                 {customer.company_name || customer.customer_code}
               </option>
             ))}
           </select>
         </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Invoices List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                Available Invoices
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select an invoice to populate the credit note
              </p>
            </div>
            
                         <div className="p-6">
               {!clientId ? (
                 <div className="text-center py-8">
                   <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-500">Please select a customer first</p>
                 </div>
               ) : customerInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No invoices available for this customer</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      onClick={() => handleInvoiceSelect(invoice)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedInvoice?.id === invoice.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {invoice.invoice_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: ${invoice.total_amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            ${invoice.remaining_amount.toFixed(2)} remaining
                          </p>
                          {selectedInvoice?.id === invoice.id && (
                            <ArrowRight className="h-4 w-4 text-blue-600 ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Credit Note Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Credit Note Details
              </h2>
              {selectedInvoice && (
                <p className="text-sm text-gray-500 mt-1">
                  Creating credit note for invoice: {selectedInvoice.invoice_number}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date and Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Note Date *
                  </label>
                  <input
                    type="date"
                    value={creditNoteDate}
                    onChange={(e) => setCreditNoteDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Credit Note
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the reason for this credit note..."
                />
              </div>

              {/* Invoice Items Loading Indicator */}
              {loadingInvoiceItems && (
                <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-700">Loading invoice items...</span>
                </div>
              )}

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Credit Note Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {selectedInvoice ? 'Select an invoice to load items' : 'No items added yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Product *
                            </label>
                            <select
                              value={item.product_id}
                              onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value={0}>Select a product</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.product_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit Price
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Price
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              ${item.total_price.toFixed(2)}
                            </div>
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              {items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Note Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal (Net):</span>
                      <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (16%):</span>
                      <span className="font-medium">${calculateTaxTotal().toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Credit Amount:</span>
                        <span className="text-lg font-semibold text-gray-900">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Credit Note
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCreditNotePage; 