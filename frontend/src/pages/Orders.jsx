import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scissors, Search, MessageCircle, Clock } from 'lucide-react';
import apiClient from '../api/apiClient';
import { sendOrderReceived, sendOrderReady, sendDeliveryReminder } from '../utils/whatsappHelper';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); 
  const queryClient = useQueryClient();

  // Orders mangwana
  const { data: response, isLoading } = useQuery({
    queryKey: ['allOrders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    }
  });

  // Status Update Karne ki API Call
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await apiClient.patch(`/orders/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allOrders']);
      queryClient.invalidateQueries(['dashboardSummary']);
    },
    onError: () => {
      alert("Status update karne me error aayi.");
    }
  });

  if (isLoading) {
    return <div className="flex justify-center pt-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const orders = response?.data || [];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    statusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      <div className="bg-primary px-4 pt-8 pb-6 rounded-b-[2rem] shadow-sm">
        <h1 className="text-2xl font-bold text-white mb-2">Aapke Orders</h1>
        <p className="text-white/80 text-sm">Apne silai ke orders manage karein</p>
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

        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
          <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}>Sabhi</button>
          <button onClick={() => setStatusFilter('PENDING')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}>Pending</button>
          <button onClick={() => setStatusFilter('READY')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'READY' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>Ready</button>
          <button onClick={() => setStatusFilter('DELIVERED')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>Delivered</button>
        </div>

        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                
                {statusMutation.isPending && statusMutation.variables?.id === order.id && (
                   <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                   </div>
                )}

                <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{order.customer.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{order.orderNumber} • {order.items[0]?.garmentType}</p>
                  </div>
                  
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider outline-none border-none cursor-pointer appearance-none text-center
                      ${order.status === 'READY' ? 'bg-blue-100 text-blue-700' : 
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                        'bg-orange-100 text-orange-700'}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CUTTING">CUTTING</option>
                    <option value="STITCHING">STITCHING</option>
                    <option value="READY">READY (Sil Gaya)</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
                
                <div className="p-4 bg-gray-50/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                        <Clock w={12} h={12} /> Delivery Date
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => order.status === 'READY' ? sendOrderReady(order) : sendOrderReceived(order)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${order.status === 'READY' ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100' : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-100'}`}
                    >
                      <MessageCircle w={16} h={16} />
                      {order.status === 'READY' ? 'Alert Ready' : 'WhatsApp Bill'}
                    </button>
                  </div>

                  {order.status === 'READY' && (
                    <button 
                      onClick={() => sendDeliveryReminder(order)}
                      className="w-full bg-gray-200 text-gray-600 hover:bg-gray-300 py-2 rounded-xl text-xs font-bold transition-colors flex justify-center items-center gap-2"
                    >
                      <Clock w={14} h={14} /> Reminder Bhejein (Lene aa jao)
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
              <Scissors className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">Koi order nahi mila.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Orders;