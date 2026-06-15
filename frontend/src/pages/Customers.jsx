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
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm) ||
    (c.customerCode && c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Premium Header & Search Bar */}
      <div className="bg-primary px-4 pt-6 pb-6 rounded-b-[2rem] shadow-sm relative">
        <h1 className="text-2xl font-extrabold text-white">Grahak (Customers)</h1>
        <p className="text-white/80 text-sm mt-1">Apne sabhi grahako ko yahan manage karein</p>

        <div className="mt-5 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Naam, Mobile ya Code se dhoondhein..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium shadow-inner text-gray-800"
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
          <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-500 font-bold">Data load karne me error aayi.</p>
            <p className="text-sm text-red-400 mt-1">Internet connection check karein</p>
          </div>
        ) : customersList.length === 0 ? (
          
          /* Empty State (Jab database me koi customer na ho) */
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm mt-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Koi Grahak Nahi Hai</h3>
            <p className="text-sm text-gray-500 mt-2 mb-6 px-6">
              Aapne abhi tak apni dukan me koi customer add nahi kiya hai. Shuruwat karne ke liye niche click karein.
            </p>
            <Link 
              to="/add-customer" 
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              <Plus w={18} h={18} /> Naya Grahak Jodein
            </Link>
          </div>

        ) : filteredCustomers.length === 0 ? (
          
          /* Search Error (Jab search keyword match na kare) */
          <div className="text-center py-10">
            <p className="text-gray-500 font-bold">"{searchTerm}" se koi grahak nahi mila.</p>
          </div>

        ) : (

          /* Customer List Cards (Mobile-first design) */
          <div className="space-y-3">
            {filteredCustomers.map(customer => (
              <Link 
                to={`/customer/${customer.id}`} 
                key={customer.id} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform"
              >
                {/* Profile Avatar / Photo */}
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden">
                  {customer.photo ? (
                     <img src={`http://localhost:5000/${customer.photo}`} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                     customer.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-gray-800 truncate">{customer.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <Phone w={12} h={12}/> {customer.mobile}
                    </p>
                    <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold tracking-wide">
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
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/40 active:scale-90 transition-transform z-50 border-2 border-white/20"
      >
        <Plus w={26} h={26} />
      </Link>
      
    </div>
  );
};

export default Customers;