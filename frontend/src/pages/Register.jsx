import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import useAuthStore from '../store/authStore';
import { Scissors } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    shopName: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend ko naya account banane ki request bhej rahe hain
      const res = await apiClient.post('/auth/register', formData);
      
      // Jaise hi account banega, token save hoga aur automatically login ho jayega
      setAuth(res.data.user, res.data.token);
      
      // Seedha Dashboard par bhej do
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Account banane me samasya aayi. Server check karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <Scissors className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-center text-2xl font-extrabold text-white mb-2">Naya Khata Banayein</h2>
        <p className="text-center text-sm text-slate-400 mb-8">Apni Tailor Shop ka setup karein</p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Aapka Naam</label>
            <input 
              type="text" required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-primary text-sm font-medium outline-none text-white placeholder-slate-500" 
              placeholder="Jaise: Shivam Parmar"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Dukan (Shop) ka Naam</label>
            <input 
              type="text" required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-primary text-sm font-medium outline-none text-white placeholder-slate-500" 
              placeholder="Jaise: Shivam Tailors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Mobile Number</label>
            <input 
              type="tel" required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-primary text-sm font-medium outline-none text-white placeholder-slate-500" 
              placeholder="10 digit number"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Email ID</label>
            <input 
              type="email" required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-primary text-sm font-medium outline-none text-white placeholder-slate-500" 
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Password</label>
            <input 
              type="password" required minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-primary text-sm font-medium outline-none text-white placeholder-slate-500" 
              placeholder="Kam se kam 6 akshar"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-70 mt-4"
          >
            {loading ? 'Account ban raha hai...' : 'Register Karein'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400 font-medium">
          Pehle se account hai?{' '}
          <Link to="/" className="font-bold text-primary hover:text-indigo-400">
            Yahan Login karein
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;