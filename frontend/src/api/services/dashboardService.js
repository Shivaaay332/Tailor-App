import apiClient from '../apiClient';

export const dashboardService = {
  getSummary: async () => {
    // Backend se dashboard summary fetch kar rahe hain
    const response = await apiClient.get('/dashboard/summary');
    // Backend ne jo 'data' object bheja tha, hum wahi return kar rahe hain
    return response.data.data;
  }
};