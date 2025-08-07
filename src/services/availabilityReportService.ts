import axios from 'axios';
import { api } from './api';

export interface AvailabilityReport {
  id: number;
  reportId: number;
  productName: string;
  quantity: number;
  comment: string;
  createdAt: string;
  clientId: number;
  userId: number;
  productId: number;
  clientName?: string;
  countryName?: string;
  salesRepName?: string;
}

export interface AvailabilityReportFilters {
  outlet?: string;
  comment?: string;
  country?: string;
  salesRep?: string;
  startDate?: string;
  endDate?: string;
}

export interface AvailabilityReportResponse {
  reports: AvailabilityReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const availabilityReportService = {
  async getAvailabilityReports(
    filters: AvailabilityReportFilters = {},
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<AvailabilityReportResponse> {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    // Add pagination
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add search
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get(`/availability-reports?${params}`);
    return response.data;
  },

  async getAvailabilityCountries(): Promise<string[]> {
    const response = await api.get('/availability-countries');
    return response.data;
  },

  async getAvailabilitySalesReps(): Promise<string[]> {
    const response = await api.get('/availability-sales-reps');
    return response.data;
  },

  async exportAvailabilityReports(
    filters: AvailabilityReportFilters = {},
    search?: string
  ): Promise<Blob> {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    // Add search
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get(`/availability-reports/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}; 