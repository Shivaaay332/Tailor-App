import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Phone, Users } from 'lucide-react';
import apiClient from '../api/apiClient';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Backend se Customers ka data mangwana
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/customers');
      return res.data;
    }
  });

  // Backend response se data array nikalna (Fallback empty array)
  const customersList = response?.data || [];

  // Search filter logic (Naam, Mobile, ya CUST-0001 code se)
  const filteredCustomers = customersList.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile?.includes(searchTerm) ||
    (c.customerCode && c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      
      {/* Premium Header & Search Bar */}
      <div className="bg-gradient-to-b from-primary to-indigo-700 px-4 pt-6 pb-8 rounded-b-[2rem] relative shadow-lg shadow-primary/20">
        <h1 className="text-2xl font-extrabold text-white">Grahak (Customers)</h1>
        <p className="text-white/80 text-sm mt-1">Apne sabhi grahako ko yahan manage karein</p>

        <div className="mt-5 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Naam, Mobile ya Code se dhoondhein..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-white/30 text-sm font-medium shadow-inner text-white placeholder-slate-400 border border-slate-700"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 mt-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-10 bg-slate-800/50 rounded-2xl border border-red-500/30">
            <p className="text-red-400 font-bold">Data load karne me error aayi.</p>
            <p className="text-sm text-red-400/70 mt-1">Internet connection check karein</p>
          </div>
        ) : customersList.length === 0 ? (
          
          /* Empty State (Jab database me koi customer na ho) */
          <div className="text-center py-16 bg-slate-800 rounded-3xl border border-slate-700 shadow-lg mt-4">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Koi Grahak Nahi Hai</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6 px-6">
              Aapne abhi tak apni dukan me koi customer add nahi kiya hai. Shuruwat karne ke liye niche click karein.
            </p>
            <Link 
              to="/add-customer" 
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30"
            >
              <Plus w={18} h={18} /> Naya Grahak Jodein
            </Link>
          </div>

        ) : filteredCustomers.length === 0 ? (
          
          /* Search Error (Jab search keyword match na kare) */
          <div className="text-center py-10">
            <p className="text-slate-400 font-bold">"{searchTerm}" se koi grahak nahi mila.</p>
          </div>

        ) : (

          /* Customer List Cards (Mobile-first design) */
          <div className="space-y-3">
            {filteredCustomers.map(customer => (
              <Link 
                to={`/customer/${customer.id}`} 
                key={customer.id} 
                className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center gap-4"
              >
                {/* Profile Avatar / Photo */}
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden">
                  {customer.photo ? (
                     <img src={`http://localhost:5000/${customer.photo}`} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                     customer.name?.charAt(0)?.toUpperCase() || 'C'
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-white truncate">{customer.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Phone w={12} h={12}/> {customer.mobile}
                    </p>
                    <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold tracking-wide">
                      {customer.customerCode || 'N/A'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) - Hamesha bottom right me rahega */}
      <Link 
        to="/add-customer" 
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/40 z-50 border-2 border-white/20"
      >
        <Plus w={26} h={26} />
      </Link>
      
    </div>
  );
};

export default Customers;