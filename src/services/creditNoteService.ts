import axios from 'axios';
import { api } from './api';

export interface CreditNoteItem {
  product_id: number;
  product?: any;
  invoice_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateCreditNoteForm {
  customer_id: number;
  credit_note_date: string;
  reason?: string;
  original_invoice_id?: number;
  items: CreditNoteItem[];
}

export interface CreditNote {
  id: number;
  credit_note_number: string;
  customer_id: number;
  customer_name?: string;
  customer_code?: string;
  credit_note_date: string;
  original_invoice_id?: number;
  original_invoice_number?: string;
  reason?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  items?: CreditNoteItem[];
}

export interface CustomerInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  credited_amount: number;
  remaining_amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const creditNoteService = {
  // Get all credit notes
  getAll: async (): Promise<ApiResponse<CreditNote[]>> => {
    const response = await api.get('/financial/credit-notes');
    return response.data;
  },

  // Get credit note by ID
  getById: async (id: number): Promise<ApiResponse<CreditNote>> => {
    const response = await api.get(`/financial/credit-notes/${id}`);
    return response.data;
  },

  // Create a new credit note
  create: async (creditNote: CreateCreditNoteForm): Promise<ApiResponse<CreditNote>> => {
    const response = await api.post('/financial/credit-notes', creditNote);
    return response.data;
  },

  // Get customer invoices for credit note creation
  getCustomerInvoices: async (customerId: number): Promise<ApiResponse<CustomerInvoice[]>> => {
    const response = await api.get(`/financial/customers/${customerId}/invoices-for-credit`);
    return response.data;
  },

  // Get credit notes for a specific customer
  getByCustomerId: async (customerId: number): Promise<ApiResponse<CreditNote[]>> => {
    const response = await api.get(`/financial/customers/${customerId}/credit-notes`);
    return response.data;
  },

  // Update credit note status
  updateStatus: async (id: number, status: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/financial/credit-notes/${id}/status`, { status });
    return response.data;
  },

  // Delete credit note
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/credit-notes/${id}`);
    return response.data;
  }
};

export default creditNoteService; 