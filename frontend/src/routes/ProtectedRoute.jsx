import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = () => {
  // Zustand store se check karo ki user login hai ya nahi
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Agar login hai, toh andar jane do (<Outlet /> render karo)
  // Agar nahi hai, toh seedha "/" (Login page) par bhej do
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;