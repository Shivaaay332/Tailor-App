import axios from 'axios';
import useAuthStore from '../store/authStore';

// Backend ka URL (Aage chal kar isko live URL se replace kar sakte ho)
const BASE_URL = 'http://localhost:5000/api'; 

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

// 1. Har request ke sath token bhejne ka logic
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. THE KILL SWITCH (Agar backend ne 401 diya, toh turant sab saaf karke Login par bhej do)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agar error 401 Unauthorized hai
    if (error.response && error.response.status === 401) {
      console.error("Purana Token Expire/Invalid ho gaya hai. System Reset ho raha hai...");
      
      // Zustand aur Browser ki memory completely saaf karna
      useAuthStore.getState().clearAuth(); 
      localStorage.clear(); 
      sessionStorage.clear();
      
      // Agar user pehle se Login page par nahi hai, toh turant wahan bhej do
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
         window.location.replace('/'); 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;