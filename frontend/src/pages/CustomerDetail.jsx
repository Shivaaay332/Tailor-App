import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, MessageCircle, Ruler, Scissors, Plus, Download } from 'lucide-react';
import apiClient from '../api/apiClient';
import useAuthStore from '../store/authStore';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const CustomerDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('MEASUREMENTS'); 
  const shopDetails = useAuthStore((state) => state.user); 

  const validId = Boolean(id && id !== 'undefined' && id !== 'null');

  const { data: response, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await apiClient.get(`/customers/${id}`);
      return res.data;
    },
    enabled: validId,
    retry: false
  });

  if (!validId) return <div className="text-center pt-20 font-bold text-red-400">Sahi Customer ID nahi mili. Kripya peeche jayein.</div>;
  if (isLoading) return <div className="flex justify-center pt-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  // FIX: Data ko nikalne ka tareeka aur safe banaya gaya hai
  const customer = response?.data || response?.customer || response;
  
  if (!customer || !customer.id) return <div className="text-center pt-20 font-bold text-red-400 mt-10">Customer nahi mila! Lagta hai database me ye grahak nahi hai.</div>;

  const handleDownloadPDF = (order) => {
    generateInvoicePDF(order, customer, shopDetails);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      
      {/* Header Profile Section */}
      <div className="bg-gradient-to-b from-primary to-indigo-700 px-4 pt-6 pb-8 rounded-b-[2rem] shadow-lg shadow-primary/20 relative text-center">
        <Link to="/customers" className="absolute left-4 top-6 text-white p-2 bg-white/20 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg text-primary text-2xl font-extrabold">
          {customer.name?.charAt(0)?.toUpperCase() || 'C'}
        </div>
        <h1 className="text-xl font-bold text-white">{customer.name}</h1>
        <p className="text-white/80 text-xs mt-1">{customer.customerCode || 'Code Missing'} • Sr: {customer.serialNumber || 'N/A'}</p>

        {/* Action Buttons (Call & WhatsApp) */}
        <div className="flex justify-center gap-4 mt-4">
          <a href={`tel:${customer.mobile}`} className="flex items-center gap-1.5 bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold">
            <Phone w={14} h={14} /> Call
          </a>
          <a href={`https://wa.me/91${customer.mobile}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-green-500/30">
            <MessageCircle w={14} h={14} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="px-4 mt-6">
        
        {/* Tabs Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('MEASUREMENTS')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'MEASUREMENTS' ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
          >
            <Ruler w={16} h={16}/> Naap
          </button>
          <button 
            onClick={() => setActiveTab('ORDERS')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'ORDERS' ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
          >
            <Scissors w={16} h={16}/> Orders
          </button>
        </div>

        {/* TAB 1: MEASUREMENTS (Naap) */}
        {activeTab === 'MEASUREMENTS' && (
          <div className="space-y-4">
            <Link to={`/add-measurement/${customer.id}`} className="w-full bg-primary/10 text-primary border border-primary/30 border-dashed py-4 rounded-xl flex items-center justify-center gap-2 font-bold">
              <Plus w={18} h={18} /> Naya Naap Jodein
            </Link>

            {customer.measurements && customer.measurements.length > 0 ? (
              customer.measurements.map(m => (
                <div key={m.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 relative">
                  <Link 
                    to={`/add-measurement/${customer.id}`} 
                    state={{ measurement: m }} 
                    className="absolute top-4 right-4 text-xs font-bold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg"
                  >
                    Edit
                  </Link>

                  <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Scissors w={14} h={14} className="text-primary"/> {m.garmentType}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium mr-16">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {m.data && Object.entries(m.data).map(([key, value]) => value && (
                      <div key={key} className="flex justify-between border-b border-slate-700 pb-1">
                        <span className="text-xs text-slate-400 font-medium">{key}</span>
                        <span className="text-xs font-bold text-white">{value}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 text-sm mt-10">Abhi tak koi naap nahi liya gaya hai.</p>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS (Bills) */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <Link to="/add-order" className="w-full bg-primary/10 text-primary border border-primary/30 border-dashed py-4 rounded-xl flex items-center justify-center gap-2 font-bold">
              <Plus w={18} h={18} /> Naya Bill Banayein
            </Link>

            {customer.orders && customer.orders.length > 0 ? (
              customer.orders.map(order => {
                const total = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) || 0;
                const paid = order.payments?.reduce((sum, p) => sum + (p.installmentAmount || 0), 0) || 0;
                
                return (
                  <div key={order.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400">{order.orderNumber}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold tracking-wider ${order.status === 'READY' ? 'bg-blue-500/20 text-blue-400' : order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <p className="font-bold text-white text-sm mb-3">
                      {order.items && order.items[0] ? `${order.items[0].garmentType} (${order.items[0].quantity} Pcs)` : 'Item details missing'}
                    </p>
                    
                    <div className="flex justify-between items-end bg-slate-700/50 p-3 rounded-xl mb-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Total Bill</p>
                        <p className="text-sm font-extrabold text-white">₹{total}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Baki (Pending)</p>
                        <p className={`text-sm font-extrabold ${total - paid > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          ₹{total - paid}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDownloadPDF(order)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 py-3 rounded-xl text-xs font-bold border border-blue-500/30"
                    >
                      <Download w={16} h={16} /> Bill (PDF) Download Karein
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-500 text-sm mt-10">Abhi tak koi order nahi banaya gaya hai.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDetail;