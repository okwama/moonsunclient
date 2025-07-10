import axios from 'axios';
import { 
  ChartOfAccount, 
  Supplier, 
  Customer, 
  Product, 
  DashboardStats,
  CreatePurchaseOrderForm,
  CreateSalesOrderForm,
  CreateReceiptForm,
  CreatePaymentForm,
  CreateJournalEntryForm,
  ApiResponse,
  PaginatedResponse
} from '../types/financial';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Chart of Accounts Service
export const chartOfAccountsService = {
  getAll: async (): Promise<ApiResponse<ChartOfAccount[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/accounts`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ChartOfAccount>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/accounts/${id}`);
    return response.data;
  },

  create: async (account: Partial<ChartOfAccount>): Promise<ApiResponse<ChartOfAccount>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/accounts`, account);
    return response.data;
  },

  update: async (id: number, account: Partial<ChartOfAccount>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/accounts/${id}`, account);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/accounts/${id}`);
    return response.data;
  }
};

// Suppliers Service
export const suppliersService = {
  getAll: async (): Promise<ApiResponse<Supplier[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/suppliers`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Supplier>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/suppliers/${id}`);
    return response.data;
  },

  create: async (supplier: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/suppliers`, supplier);
    return response.data;
  },

  update: async (id: number, supplier: Partial<Supplier>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/suppliers/${id}`, supplier);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/suppliers/${id}`);
    return response.data;
  }
};

// Customers Service
export const customersService = {
  getAll: async (): Promise<ApiResponse<Customer[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/customers`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Customer>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/customers/${id}`);
    return response.data;
  },

  create: async (customer: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/customers`, customer);
    return response.data;
  },

  update: async (id: number, customer: Partial<Customer>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/customers/${id}`);
    return response.data;
  }
};

// Products Service
export const productsService = {
  getAll: async (): Promise<ApiResponse<Product[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/products`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/products/${id}`);
    return response.data;
  },

  create: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/products`, product);
    return response.data;
  },

  update: async (id: number, product: Partial<Product>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/products/${id}`, product);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/products/${id}`);
    return response.data;
  },

  getLowStock: async (): Promise<ApiResponse<Product[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/products/low-stock`);
    return response.data;
  }
};

// Dashboard Service
export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/dashboard/stats`);
    return response.data;
  },

  getAssets: async () => {
    const res = await axios.get(`${API_BASE_URL}/financial/assets`);
    return res.data;
  },

  getTotalAssets: async () => {
    const res = await axios.get(`${API_BASE_URL}/financial/assets`);
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
    const response = await axios.get(`${API_BASE_URL}/financial/purchase-orders`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/purchase-orders/${id}`);
    return response.data;
  },

  create: async (purchaseOrder: CreatePurchaseOrderForm): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/purchase-orders`, purchaseOrder);
    return response.data;
  },

  update: async (id: number, purchaseOrder: Partial<CreatePurchaseOrderForm>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/purchase-orders/${id}`, purchaseOrder);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/purchase-orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    const response = await axios.patch(`${API_BASE_URL}/financial/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  getWithReceipts: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/purchase-orders/${id}/with-receipts`);
    return response.data;
  },

  receiveItems: async (purchaseOrderId: number, data: {
    storeId: number;
    items: { product_id: number; received_quantity: number; unit_cost: number }[];
    notes?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/purchase-orders/${purchaseOrderId}/receive`, data);
    return response.data;
  }
};

// Sales Orders Service
export const salesOrdersService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/sales-orders`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/sales-orders/${id}`);
    return response.data;
  },

  create: async (salesOrder: CreateSalesOrderForm): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/sales-orders`, salesOrder);
    return response.data;
  },

  update: async (id: number, salesOrder: Partial<CreateSalesOrderForm>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/sales-orders/${id}`, salesOrder);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/sales-orders/${id}`);
    return response.data;
  }
};

// Receipts Service
export const receiptsService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/receipts`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/receipts/${id}`);
    return response.data;
  },

  create: async (receipt: CreateReceiptForm): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/receipts`, receipt);
    return response.data;
  },

  update: async (id: number, receipt: Partial<CreateReceiptForm>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/receipts/${id}`, receipt);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/receipts/${id}`);
    return response.data;
  }
};

// Payments Service
export const paymentsService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/payments`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/payments/${id}`);
    return response.data;
  },

  create: async (payment: CreatePaymentForm): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/payments`, payment);
    return response.data;
  },

  update: async (id: number, payment: Partial<CreatePaymentForm>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/payments/${id}`, payment);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/payments/${id}`);
    return response.data;
  }
};

// Journal Entries Service
export const journalEntriesService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/journal-entries`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_BASE_URL}/financial/journal-entries/${id}`);
    return response.data;
  },

  create: async (journalEntry: CreateJournalEntryForm): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/financial/journal-entries`, journalEntry);
    return response.data;
  },

  update: async (id: number, journalEntry: Partial<CreateJournalEntryForm>): Promise<ApiResponse<void>> => {
    const response = await axios.put(`${API_BASE_URL}/financial/journal-entries/${id}`, journalEntry);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.delete(`${API_BASE_URL}/financial/journal-entries/${id}`);
    return response.data;
  },

  post: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axios.patch(`${API_BASE_URL}/financial/journal-entries/${id}/post`);
    return response.data;
  }
}; 