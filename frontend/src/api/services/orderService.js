import apiClient from '../apiClient';

export const orderService = {
  // Naya order create karna
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data.data;
  },

  // Saare orders ki list nikalna
  getAllOrders: async (status = '') => {
    const url = status ? `/orders?status=${status}` : '/orders';
    const response = await apiClient.get(url);
    return response.data.data;
  },
  
  // Order ka status update karna (Pending -> Stitching -> Ready)
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  }
};