import axios from 'axios';
import { api } from './api';
import {
  ChartOfAccount,
  Supplier,
  ApiResponse,
  GeneralLedgerEntry
} from '../types/financial';

// Chart of Accounts Service
export const chartOfAccountsService = {
  getAll: async (): Promise<ApiResponse<ChartOfAccount[]>> => {
    const response = await api.get('/financial/accounts');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ChartOfAccount>> => {
    const response = await api.get(`/financial/accounts/${id}`);
    return response.data;
  },

  create: async (account: Partial<ChartOfAccount>): Promise<ApiResponse<ChartOfAccount>> => {
    const response = await api.post('/financial/accounts', account);
    return response.data;
  },

  update: async (id: number, account: Partial<ChartOfAccount>): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/accounts/${id}`, account);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/accounts/${id}`);
    return response.data;
  }
};

// Suppliers Service
export const suppliersService = {
  getAll: async (): Promise<ApiResponse<Supplier[]>> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Supplier>> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (supplier: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    const response = await api.post('/suppliers', supplier);
    return response.data;
  },

  update: async (id: number, supplier: Partial<Supplier>): Promise<ApiResponse<void>> => {
    const response = await api.put(`/suppliers/${id}`, supplier);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }
};

// Stores Service
export const storesService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/stores');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  create: async (store: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/stores', store);
    return response.data;
  },

  update: async (id: number, store: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/stores/${id}`, store);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  }
};

// Customers Service
export const customersService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    // Request all clients by setting a very high limit
    const response = await api.get(`/clients?limit=10000`);
    // The clients API returns { data: [...], page, limit, total, totalPages }
    // We need to transform it to match the expected ApiResponse format
    return {
      success: true,
      data: response.data.data || response.data
    };
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/customers/${id}`);
    return response.data;
  },

  create: async (customer: Partial<any>): Promise<ApiResponse<any>> => {
    const response = await api.post(`/financial/customers`, customer);
    return response.data;
  },

  update: async (id: number, customer: Partial<any>): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/customers/${id}`);
    return response.data;
  }
};

// Products Service
export const productsService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/financial/products');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/products/${id}`);
    return response.data;
  },

  create: async (product: Partial<any>): Promise<ApiResponse<any>> => {
    const response = await api.post(`/financial/products`, product);
    return response.data;
  },

  update: async (id: number, product: Partial<any>): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/products/${id}`, product);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/products/${id}`);
    return response.data;
  },

  getLowStock: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/financial/products/low-stock`);
    return response.data;
  }
};

// Add this: Stock Take Items Service
export const stockTakeService = {
  getItems: async (stock_take_id: number) => {
    const response = await api.get(`/financial/stock-take/${stock_take_id}/items`);
    return response.data;
  },
};

// Dashboard Service
export const dashboardService = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/dashboard/stats`);
    return response.data;
  },

  getAssets: async () => {
    const res = await api.get(`/financial/assets`);
    return res.data;
  },

  getTotalAssets: async () => {
    const res = await api.get(`/financial/assets`);
    if (res.data.success && Array.isArray(res.data.data)) {
      const total = res.data.data.reduce((sum: number, asset: any) => sum + Number(asset.purchase_value), 0);
      return total;
    }
    return 0;
  }
};

// Purchase Orders Service
export const purchaseOrdersService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/financial/purchase-orders`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/purchase-orders/${id}`);
    return response.data;
  },

  create: async (purchaseOrder: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/financial/purchase-orders`, purchaseOrder);
    return response.data;
  },

  update: async (id: number, purchaseOrder: Partial<any>): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/purchase-orders/${id}`, purchaseOrder);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/purchase-orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/financial/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  getWithReceipts: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/purchase-orders/${id}/with-receipts`);
    return response.data;
  },

  receiveItems: async (purchaseOrderId: number, data: {
    storeId: number;
    items: { product_id: number; received_quantity: number; unit_cost: number }[];
    notes?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/financial/purchase-orders/${purchaseOrderId}/receive`, data);
    return response.data;
  }
};

// Sales Orders Service
export const salesOrdersService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/financial/sales-orders`);
    return response.data;
  },

  getAllIncludingDrafts: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/financial/sales-orders-all`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/sales-orders/${id}`);
    return response.data;
  },

  create: async (salesOrder: any): Promise<ApiResponse<any>> => {
    console.log('=== SALES ORDERS SERVICE CREATE ===');
    console.log('API URL:', `${api.defaults.baseURL}/financial/sales-orders`);
    console.log('Request data:', JSON.stringify(salesOrder, null, 2));

    try {
      const response = await api.post(`/financial/sales-orders`, salesOrder);
      console.log('=== API RESPONSE SUCCESS ===');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log('=== API RESPONSE ERROR ===');
      console.log('Error:', error);
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  update: async (id: number, salesOrder: Partial<any> & { my_status?: number }): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/sales-orders/${id}`, salesOrder);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/sales-orders/${id}`);
    return response.data;
  },

  assignRider: async (id: number, rider_id: number) => {
    const response = await api.patch(`/financial/sales-orders/${id}`, { riderId: rider_id });
    return response.data;
  },
  receiveBackToStock: async (id: number) => {
    const response = await api.post(`/financial/sales-orders/${id}/receive-back`);
    return response.data;
  },

  convertToInvoice: async (id: number, invoiceData: any): Promise<ApiResponse<any>> => {
    console.log('=== CONVERTING TO INVOICE ===');
    console.log('Order ID:', id);
    console.log('Invoice data:', JSON.stringify(invoiceData, null, 2));

    try {
      const response = await api.post(`/financial/sales-orders/${id}/convert-to-invoice`, invoiceData);
      console.log('=== CONVERT TO INVOICE SUCCESS ===');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log('=== CONVERT TO INVOICE ERROR ===');
      console.log('Error:', error);
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }
};

// Sales Order Items Service
export const salesOrderItemsService = {
  getBySalesOrderId: async (salesOrderId: number) => {
    const response = await api.get(`/financial/sales-orders/${salesOrderId}/items`);
    return response.data;
  }
};

// Invoice Service
export const invoiceService = {
  getById: async (invoiceId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/invoices/${invoiceId}`);
    return response.data;
  }
};

// My Assets Service
export const myAssetsService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    asset_type?: string;
    location?: string;
  }): Promise<any> => {
    const response = await api.get(`/my-assets`, { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/my-assets/${id}`);
    return response.data;
  },

  create: async (asset: any): Promise<ApiResponse<any>> => {
    const headers = asset instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await api.post(`/my-assets`, asset, { headers });
    return response.data;
  },

  update: async (id: number, asset: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/my-assets/${id}`, asset);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/my-assets/${id}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get(`/my-assets/stats/overview`);
    return response.data;
  }
};

// Faulty Products Service
export const faultyProductsService = {
  getAllReports: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    store_id?: number;
  }): Promise<any> => {
    const response = await api.get(`/faulty-products`, { params });
    return response.data;
  },

  getReportById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/faulty-products/${id}`);
    return response.data;
  },

  createReport: async (report: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/faulty-products`, report);
    return response.data;
  },

  updateReportStatus: async (id: number, status: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/faulty-products/${id}/status`, status);
    return response.data;
  },

  deleteReport: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/faulty-products/${id}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get(`/faulty-products/stats/overview`);
    return response.data;
  }
};

// Receipts Service
export const receiptsService = {
  postReceipt: async (formData: FormData): Promise<ApiResponse<any>> => {
    const response = await api.post(`/receipts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    supplier_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<any> => {
    const response = await api.get(`/receipts`, { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  },

  download: async (id: number): Promise<Blob> => {
    const response = await api.get(`/receipts/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/receipts/${id}`);
    return response.data;
  }
};

// Payments Service
export const paymentsService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/financial/payments`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/payments/${id}`);
    return response.data;
  },

  create: async (payment: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/financial/payments`, payment);
    return response.data;
  },

  update: async (id: number, payment: Partial<any>): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/payments/${id}`, payment);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/payments/${id}`);
    return response.data;
  }
};

// Journal Entries Service
export const journalEntriesService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/financial/journal-entries`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/financial/journal-entries/${id}`);
    return response.data;
  },

  create: async (journalEntry: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/financial/journal-entries`, journalEntry);
    return response.data;
  },

  update: async (id: number, journalEntry: Partial<any>): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/journal-entries/${id}`, journalEntry);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/journal-entries/${id}`);
    return response.data;
  },

  post: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/financial/journal-entries/${id}/post`);
    return response.data;
  }
};

export const generalLedgerService = {
  getEntries: async (): Promise<ApiResponse<GeneralLedgerEntry[]>> => {
    const response = await api.get(`/financial/general-ledger`);
    return response.data;
  }
};

export const inventoryTransactionsService = {
  getAll: async (params: any = {}): Promise<ApiResponse<any[]> & { pagination?: { totalPages: number; page: number; limit: number; total: number } }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });
    const response = await api.get(`/financial/inventory-transactions?${query.toString()}`);
    return response.data;
  }
};

export const inventoryAsOfService = {
  getAll: async (params: { date: string, store_id?: number|string }) => {
    const query = new URLSearchParams();
    query.append('date', params.date);
    if (params.store_id) query.append('store_id', String(params.store_id));
    const response = await api.get(`/financial/inventory-as-of?${query.toString()}`);
    return response.data;
  }
};

export const stockTransferService = {
  transfer: async (data: {
    from_store_id: string | number;
    to_store_id: string | number;
    transfer_date: string;
    staff_id: number;
    reference?: string;
    notes?: string;
    items: { product_id: string | number; quantity: number }[];
  }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/financial/stock-transfer`, data);
    return response.data;
  },
  getHistory: async (params: any = {}): Promise<ApiResponse<any[]> & { pagination?: { totalPages: number; page: number; limit: number; total: number } }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });
    const response = await api.get(`/financial/transfer-history?${query.toString()}`);
    return response.data;
  }
};

// Categories Service
export const categoriesService = {
  getAll: async (): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    const response = await api.get(`/financial/categories`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<{ id: number; name: string }>> => {
    const response = await api.get(`/financial/categories/${id}`);
    return response.data;
  },

  create: async (category: { name: string }): Promise<ApiResponse<{ id: number; name: string }>> => {
    const response = await api.post(`/financial/categories`, category);
    return response.data;
  },

  update: async (id: number, category: { name: string }): Promise<ApiResponse<void>> => {
    const response = await api.put(`/financial/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/financial/categories/${id}`);
    return response.data;
  }
}; 

 