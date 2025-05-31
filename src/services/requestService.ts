import api from './api';

export interface RequestData {
  id?: number;
  userId: number;
  userName: string;
  serviceTypeId: number;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  myStatus?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const requestService = {
  createRequest: async (data: RequestData): Promise<any> => {
    try {
      console.log('Creating request with data:', JSON.stringify(data, null, 2));
      const response = await api.post<any>('/requests', data);
      console.log('Request created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  getRequests: async (filters?: { status?: string; myStatus?: number }): Promise<RequestData[]> => {
    try {
      console.log('Fetching requests with filters:', filters);
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.myStatus !== undefined) params.append('myStatus', filters.myStatus.toString());
      
      const response = await api.get<RequestData[]>(`/requests${params.toString() ? `?${params.toString()}` : ''}`);
      console.log('Requests fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  updateRequest: async (requestId: string, data: Partial<RequestData>): Promise<any> => {
    try {
      console.log('Updating request:', requestId, 'with data:', JSON.stringify(data, null, 2));
      const response = await api.patch<any>(`/requests/${requestId}`, data);
      console.log('Request updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  }
}; 