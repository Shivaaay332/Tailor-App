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
    const matchesSearch = order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    statusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      
      <div className="bg-gradient-to-b from-primary to-indigo-700 px-4 pt-8 pb-8 rounded-b-[2rem] shadow-lg shadow-primary/20">
        <h1 className="text-2xl font-bold text-white mb-2">Aapke Orders</h1>
        <p className="text-white/80 text-sm">Apne silai ke orders manage karein</p>
      </div>

      <div className="px-4 mt-4">
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Grahak ka naam ya Bill No. dhundein..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-white placeholder-slate-400 border border-slate-700"
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
          <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}>Sabhi</button>
          <button onClick={() => setStatusFilter('PENDING')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400'}`}>Pending</button>
          <button onClick={() => setStatusFilter('READY')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'READY' ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400'}`}>Ready</button>
          <button onClick={() => setStatusFilter('DELIVERED')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-green-500/20 text-green-400'}`}>Delivered</button>
        </div>

        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative">
                
                {statusMutation.isPending && statusMutation.variables?.id === order.id && (
                   <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                   </div>
                )}

                <div className="p-4 border-b border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">{order.customer?.name || 'Customer'}</h3>
                    <p className="text-xs text-slate-400 font-medium">{order.orderNumber} • {order.items?.[0]?.garmentType || 'Item'}</p>
                  </div>
                  
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider outline-none border-none cursor-pointer appearance-none text-center
                      ${order.status === 'READY' ? 'bg-blue-500/20 text-blue-400' : 
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 
                        'bg-orange-500/20 text-orange-400'}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CUTTING">CUTTING</option>
                    <option value="STITCHING">STITCHING</option>
                    <option value="READY">READY (Sil Gaya)</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
                
                <div className="p-4 bg-slate-800/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5 flex items-center gap-1">
                        <Clock w={12} h={12} /> Delivery Date
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => order.status === 'READY' ? sendOrderReady(order) : sendOrderReceived(order)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${order.status === 'READY' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30'}`}
                    >
                      <MessageCircle w={16} h={16} />
                      {order.status === 'READY' ? 'Alert Ready' : 'WhatsApp Bill'}
                    </button>
                  </div>

                  {order.status === 'READY' && (
                    <button 
                      onClick={() => sendDeliveryReminder(order)}
                      className="w-full bg-slate-700 text-slate-300 hover:bg-slate-600 py-2 rounded-xl text-xs font-bold transition-colors flex justify-center items-center gap-2"
                    >
                      <Clock w={14} h={14} /> Reminder Bhejein (Lene aa jao)
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-800 rounded-2xl border border-slate-700 border-dashed">
              <Scissors className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">Koi order nahi mila.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Orders;