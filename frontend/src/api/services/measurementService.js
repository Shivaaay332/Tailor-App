import apiClient from '../apiClient';

export const measurementService = {
  // Naya naap save karna
  addMeasurement: async (measurementData) => {
    const response = await apiClient.post('/measurements', measurementData);
    return response.data.data;
  },

  // Kisi specific customer ke saare naap lana
  getCustomerMeasurements: async (customerId) => {
    const response = await apiClient.get(`/measurements/customer/${customerId}`);
    return response.data.data;
  }
};