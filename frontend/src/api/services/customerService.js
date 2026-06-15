import apiClient from '../apiClient';

export const customerService = {
  // Saare customers lana (Search filter ke sath)
  getAllCustomers: async (searchQuery = '') => {
    // Agar search me kuch likha hai, toh backend ko ?search=naam bhejenge
    const response = await apiClient.get(`/customers?search=${searchQuery}`);
    return response.data.data;
  },

  // Naya customer add karna
  addCustomer: async (customerData) => {
    const response = await apiClient.post('/customers', customerData);
    return response.data.data;
  },

  getCustomerById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data.data;
  }
};

