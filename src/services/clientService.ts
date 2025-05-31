import api from './api';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    try {
      console.log('Fetching clients...');
      const response = await api.get<Client[]>('/clients');
      console.log('Clients fetched successfully:', response.data);
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