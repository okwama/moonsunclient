import  api  from './api';

export interface Staff {
  id: number;
  name: string;
  photo_url: string;
  position: string;
  empl_no: string;
  id_no : number;
  role: string;
  created_at: string;
  updated_at: string;
}

export const staffService = {
  getStaffList: async (): Promise<Staff[]> => {
    try {
      const response = await api.get('/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  }
}; 