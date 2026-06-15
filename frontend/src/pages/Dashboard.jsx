import { useQuery } from '@tanstack/react-query';
import { Users, Scissors, IndianRupee, Clock, CheckCircle, Package, Store, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../api/services/dashboardService';
import { authService } from '../api/services/authService';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center pt-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  // Backend se upload ki hui logo URL banana
  const logoUrl = user?.shopLogo ? `http://localhost:5000/${user.shopLogo}` : null;

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      
      {/* 1. Header: Shop & Owner Details */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
            {logoUrl ? (
              <img src={logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="text-primary w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
              {user?.shopName || 'Tailor Shop'}
            </h1>
            <p className="text-sm font-medium text-gray-500">
              {user?.name || 'Owner'}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 bg-red-50 text-red-500 rounded-full active:bg-red-100">
          <LogOut size={20} />
        </button>
      </div>

      {/* 2. Primary Financial Cards (Full Width) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-md text-white relative overflow-hidden">
          <IndianRupee className="absolute -right-2 -bottom-2 w-16 h-16 text-white/20" />
          <p className="text-green-100 text-xs font-bold mb-1 uppercase tracking-wider">Aaj ki Kamai</p>
          <h2 className="text-2xl font-extrabold">₹{stats?.todaysIncome || 0}</h2>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-2xl shadow-md text-white relative overflow-hidden">
          <Clock className="absolute -right-2 -bottom-2 w-16 h-16 text-white/20" />
          <p className="text-red-100 text-xs font-bold mb-1 uppercase tracking-wider">Udhaari (Pending)</p>
          <h2 className="text-2xl font-extrabold">₹{stats?.pendingPayments || 0}</h2>
        </div>
      </div>

      {/* 3. Operational Cards (Grid) */}
      <h3 className="font-bold text-gray-800 mb-3 ml-1">Work Summary</h3>
      <div className="grid grid-cols-2 gap-3">
        
        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
            <Scissors className="text-orange-500 w-5 h-5" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800">{stats?.pendingOrders || 0}</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Pending Orders</p>
        </div>

        {/* Ready Orders */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
            <Package className="text-blue-500 w-5 h-5" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800">{stats?.readyOrders || 0}</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Sil Gaye (Ready)</p>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="text-green-500 w-5 h-5" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800">{stats?.deliveredOrders || 0}</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Delivered</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
            <Users className="text-purple-500 w-5 h-5" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800">{stats?.totalCustomers || 0}</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Total Customers</p>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;