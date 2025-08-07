import axios from 'axios';
import { api } from './api';

export interface JourneyPlan {
  id: number;
  userId: number;
  staffName: string;
  staffPhone: string;
  clientId: number;
  clientName: string;
  serviceTypeId: number;
  serviceTypeName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const journeyPlanService = {
  getJourneyPlans: async (): Promise<JourneyPlan[]> => {
    try {
      console.log('Making API call to fetch journey plans...');
      const response = await api.get('/journey-plans');
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in journeyPlanService.getJourneyPlans:', error);
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

  getJourneyPlan: async (id: number): Promise<JourneyPlan> => {
    try {
      const response = await api.get(`/journey-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching journey plan:', error);
      throw error;
    }
  },

  createJourneyPlan: async (data: Partial<JourneyPlan>): Promise<JourneyPlan> => {
    try {
      const response = await api.post('/journey-plans', data);
      return response.data;
    } catch (error) {
      console.error('Error creating journey plan:', error);
      throw error;
    }
  },

  updateJourneyPlan: async (id: number, data: Partial<JourneyPlan>): Promise<JourneyPlan> => {
    try {
      const response = await api.patch(`/journey-plans/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating journey plan:', error);
      throw error;
    }
  },

  deleteJourneyPlan: async (id: number): Promise<void> => {
    try {
      await api.delete(`/journey-plans/${id}`);
    } catch (error) {
      console.error('Error deleting journey plan:', error);
      throw error;
    }
  }
};

export default journeyPlanService; 