import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import useAuthStore from '../store/authStore';
import { Scissors } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API Call
      const res = await apiClient.post('/auth/login', formData);
      
      // Zustand me user aur token save karna
      setAuth(res.data.user, res.data.token);
      
      // Login hote hi Dashboard par le jao
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login karne me samasya aayi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <Scissors className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-2">Wapas Swagat Hai!</h2>
        <p className="text-center text-sm text-gray-500 mb-8">Apni dukan manage karne ke liye login karein</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email ya Mobile No.</label>
            <input 
              type="text" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-primary text-sm font-medium outline-none" 
              placeholder="example@email.com ya 98765..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-primary text-sm font-medium outline-none" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
          >
            {loading ? 'Log in ho raha hai...' : 'Login Karein'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Naya account banana hai?{' '}
          <Link to="/register" className="font-bold text-primary hover:text-indigo-500">
            Yahan Register karein
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;