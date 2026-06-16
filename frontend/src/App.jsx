import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from './store/authStore';

// Layout & Protection
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages (Auth)
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Pages (App Modules)
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import CustomerDetail from './pages/CustomerDetail';
import AddMeasurement from './pages/AddMeasurement';
import Orders from './pages/Orders';
import AddOrder from './pages/AddOrder';
import Payments from './pages/Payments';
import AddPayment from './pages/addPayment';
import Settings from './pages/Settings';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // AUTO LOGIN LOGIC
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://tailor-app-88nn.onrender.com';
        const response = await axios.post(
          `${API_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setAuth(response.data.user, response.data.accessToken); 
        }
      } catch (error) {
        clearAuth(); 
      } finally {
        setIsInitializing(false); 
      }
    };

    checkAuthStatus();
  }, [setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-400 font-medium">Loading Tailor App...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen relative bg-slate-900 transition-colors duration-300">
      <Routes>
        
        {/* ======================= */}
        {/* PUBLIC ROUTES           */}
        {/* ======================= */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ======================= */}
        {/* PROTECTED ROUTES        */}
        {/* ======================= */}
        <Route element={<ProtectedRoute />}>
          
          {/* Bottom Navigation Wale Pages */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Full Screen Forms (Bina Bottom Menu Ke) */}
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/customer/:id" element={<CustomerDetail />} />
          <Route path="/add-measurement/:customerId" element={<AddMeasurement />} />
          <Route path="/add-order" element={<AddOrder />} />
          <Route path="/add-payment/:orderId" element={<AddPayment />} />

        </Route>

      </Routes>
    </div>
  );
}

export default App;