import { api } from './api';
import { 
  Store, 
  StoreInventory, 
  StoreInventorySummary, 
  InventoryReceipt,
  ApiResponse 
} from '../types/financial';

export const storeService = {
  // Get all stores
  getAllStores: async (): Promise<ApiResponse<Store[]>> => {
    const response = await api.get('/financial/stores');
    return response.data;
  },

  // Get store by ID
  getStoreById: async (id: number): Promise<ApiResponse<Store>> => {
    const response = await api.get(`/financial/stores/${id}`);
    return response.data;
  },

  // Get store inventory
  getStoreInventory: async (storeId: number): Promise<ApiResponse<StoreInventory[]>> => {
    const response = await api.get(`/financial/stores/${storeId}/inventory`);
    return response.data;
  },

  // Get all stores inventory
  getAllStoresInventory: async (): Promise<ApiResponse<StoreInventory[]>> => {
    const response = await api.get('/financial/stores-inventory');
    return response.data;
  },

  // Get inventory summary by store
  getInventorySummaryByStore: async (): Promise<ApiResponse<StoreInventorySummary[]>> => {
    const response = await api.get('/financial/inventory-summary');
    return response.data;
  }
}; 