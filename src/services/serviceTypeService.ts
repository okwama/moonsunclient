import api from './api';

export interface ServiceType {
  id: number;
  name: string;
  description?: string;
}

export const serviceTypeService = {
  getServiceTypes: async (): Promise<ServiceType[]> => {
    try {
      const response = await api.get<ServiceType[]>('/service-types');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching service types:', error);
      throw error;
    }
  }
}; 