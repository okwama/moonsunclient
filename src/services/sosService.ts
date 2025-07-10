import axios from 'axios';

export interface SosData {
  id: number;
  userId: number;
  userName: string;
  userPhone: string;
  distressType: string;
  address: string;
  longitude: number;
  latitude: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSosData {
  userId: number;
  userName: string;
  userPhone: string;
  distressType: string;
  address: string;
  longitude: number;
  latitude: number;
  status: string;
}

const API_URL = 'http://localhost:5000'; // Add your backend URL here

const sosService = {
  getSosList: async (): Promise<SosData[]> => {
    try {
      console.log('Making API call to fetch SOS list...');
      const response = await axios.get(`${API_URL}/api/sos`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in sosService.getSosList:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          }
        });
      }
      throw error;
    }
  },

  getSos: async (id: number): Promise<SosData> => {
    try {
      const response = await axios.get(`${API_URL}/api/sos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching SOS:', error);
      throw error;
    }
  },

  createSos: async (data: CreateSosData): Promise<SosData> => {
    try {
      const response = await axios.post(`${API_URL}/api/sos`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating SOS:', error);
      throw error;
    }
  },

  updateSos: async (id: number, data: Partial<CreateSosData>): Promise<SosData> => {
    try {
      const response = await axios.patch(`${API_URL}/api/sos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating SOS:', error);
      throw error;
    }
  },

  deleteSos: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/api/sos/${id}`);
    } catch (error) {
      console.error('Error deleting SOS:', error);
      throw error;
    }
  }
};

export default sosService; 