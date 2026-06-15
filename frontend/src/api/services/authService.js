import apiClient from '../apiClient';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  // Register (Files bhejne ke liye FormData use kiya hai)
  register: async (formData) => {
    const response = await apiClient.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' } // Ye line bohot zaroori hai images ke liye
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.put(`/auth/reset-password/${token}`, { newPassword });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
};