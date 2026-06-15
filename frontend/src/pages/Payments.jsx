import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Search, ChevronRight, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import apiClient from '../api/apiClient';
import { sendPaymentReminder } from '../utils/whatsappHelper';

const Payments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING'); 

  const { data: response, isLoading } = useQuery({
    queryKey: ['allOrdersWithPayments'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center pt-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const orders = response?.data || [];

  const processedOrders = orders.map(order => {
    const totalBill = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalPaid = order.payments?.reduce((sum, pay) => sum + pay.installmentAmount, 0) || 0;
    const pendingAmount = totalBill - totalPaid;

    return { ...order, totalBill, totalPaid, pendingAmount };
  });

  let filteredOrders = processedOrders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'PENDING') return order.pendingAmount > 0;
    return order.pendingAmount <= 0;
  });

  const totalMarketUdhaari = processedOrders.reduce((sum, order) => sum + (order.pendingAmount > 0 ? order.pendingAmount : 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      <div className="bg-primary px-4 pt-8 pb-6 rounded-b-[2rem] shadow-sm">
        <h1 className="text-2xl font-bold text-white mb-4">Hisaab - Kitab</h1>
        
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-white flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Bazar me udhaari</p>
            <h2 className="text-3xl font-extrabold flex items-center">
              ₹{totalMarketUdhaari}
            </h2>
          </div>
          <div className="bg-white p-3 rounded-full">
            <IndianRupee className="text-primary w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        
        <div className="relative mb-4 shadow-sm">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Grahak ka naam ya Bill No. dhundein..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-gray-700"
          />
        </div>

        <div className="flex bg-gray-200/50 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'PENDING' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
          >
            Baki Paise (Udhaari)
          </button>
          <button 
            onClick={() => setActiveTab('CLEARED')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'CLEARED' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500'}`}
          >
            Chukta (Cleared)
          </button>
        </div>

        <div className="space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{order.customer.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-2">{order.orderNumber}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                      Bill: ₹{order.totalBill}
                    </span>
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-md font-bold">
                      Jama: ₹{order.totalPaid}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  {order.pendingAmount > 0 ? (
                    <>
                      <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1.5 rounded-lg mb-2">
                        <AlertCircle w={14} h={14} />
                        <span className="font-extrabold text-sm">Baki: ₹{order.pendingAmount}</span>
                      </div>
                      <div className="flex gap-2">
                        {/* WhatsApp Payment Reminder Button */}
                        <button 
                          onClick={() => sendPaymentReminder(order)}
                          className="text-xs bg-green-500 text-white p-2 rounded-lg active:scale-95 shadow-sm"
                        >
                          <MessageCircle w={14} h={14} />
                        </button>

                        <button 
                          onClick={() => navigate(`/add-payment/${order.id}`)}
                          className="text-xs bg-primary text-white font-bold px-3 py-1.5 rounded-lg active:scale-95"
                        >
                          Jama Karein
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1.5 rounded-lg mb-1">
                      <CheckCircle2 w={14} h={14} />
                      <span className="font-extrabold text-sm">Cleared</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
              <IndianRupee className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">Koi record nahi mila.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Payments;