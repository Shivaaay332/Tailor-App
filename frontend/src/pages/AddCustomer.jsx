import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Phone, MapPin, FileText, User, ArrowLeft } from 'lucide-react';
import apiClient from '../api/apiClient';

const AddCustomer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Yahan variables ke naam exactly backend wale hone chahiye
  const [formData, setFormData] = useState({
    name: '',
    mobile: '', 
    address: '',
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/customers', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customersList']);
      queryClient.invalidateQueries(['dashboardSummary']);
      alert("🎉 Grahak successfully add ho gaya!");
      navigate('/customers'); // Save hone ke baad customers list par bhejo
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Grahak add karne me samasya aayi.");
    }
  });

  const handleChange = (e) => {
    // Value ko theek se state me map kar rahe hain taaki 'uncontrolled' warning na aaye
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.mobile.length < 10) {
      alert("Mobile number sahi nahi lag raha hai.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-6 rounded-b-[2rem] shadow-sm relative text-center">
        <Link to="/customers" className="absolute left-4 top-6 text-white p-1 bg-white/20 rounded-full active:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
          <UserPlus className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Naya Grahak</h1>
        <p className="text-white/80 text-xs mt-1">Apni dukan me naya customer jodein</p>
      </div>

      <div className="px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Form Fields */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Poora Naam *</label>
              <div className="relative mt-1">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="name" 
                  required
                  placeholder="Jaise: Rahul Sharma" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-gray-800 border-none" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Mobile Number *</label>
              <div className="relative mt-1">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="tel" 
                  name="mobile" 
                  required
                  maxLength="10"
                  placeholder="10 digit number" 
                  value={formData.mobile} 
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-gray-800 border-none" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Pata (Address)</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="address" 
                  placeholder="Jaise: MG Road, Indore" 
                  value={formData.address} 
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-gray-800 border-none" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Grahak Ke Baare Me Notes</label>
              <div className="relative mt-1">
                <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="notes" 
                  placeholder="Jaise: VIP Customer hai..." 
                  value={formData.notes} 
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-gray-800 border-none" 
                />
              </div>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all mt-4"
          >
            {mutation.isPending ? 'Save ho raha hai...' : 'Grahak Save Karein'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;