import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, IndianRupee, CreditCard, Smartphone, Building, FileText } from 'lucide-react';
import apiClient from '../api/apiClient';

const AddPayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [notes, setNotes] = useState('');

  // Order ki details lana taaki baki paisa dikh sake
  const { data: response, isLoading } = useQuery({
    queryKey: ['orderDetails', orderId],
    queryFn: async () => {
      // Kyunki backend me single order ki API nahi hai, hum saare layenge aur filter karenge
      const res = await apiClient.get('/orders');
      return res.data;
    }
  });

  const order = response?.data?.find(o => o.id === orderId);
  
  let totalBill = 0, totalPaid = 0, pendingAmount = 0;
  if (order) {
    totalBill = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPaid = order.payments?.reduce((sum, pay) => sum + pay.installmentAmount, 0) || 0;
    pendingAmount = totalBill - totalPaid;
  }

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allOrders']);
      queryClient.invalidateQueries(['dashboardSummary']);
      alert("🎉 Paisa jama ho gaya!");
      navigate('/payments'); // Hisaab page par wapas
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Payment fail ho gayi.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(amount) > pendingAmount) {
      alert(`Aap sirf ₹${pendingAmount} tak jama kar sakte hain.`);
      return;
    }
    mutation.mutate({ orderId, amount: parseFloat(amount), paymentMethod: method, notes });
  };

  if (isLoading) return <div className="flex justify-center pt-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!order) return <div className="text-center pt-20 font-bold text-red-500">Order nahi mila!</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-6 rounded-b-[2rem] shadow-sm relative text-center">
        <Link to="/payments" className="absolute left-4 top-6 text-white p-1 bg-white/20 rounded-full active:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
          <IndianRupee className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Paisa Jama Karein</h1>
        <p className="text-white/80 text-xs mt-1">Bill No: {order.orderNumber}</p>
      </div>

      <div className="px-4 mt-6">
        
        {/* Outstanding Card */}
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Baki Udhaari (Pending)</p>
            <h2 className="text-2xl font-extrabold text-red-600">₹{pendingAmount}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold">Total Bill: ₹{totalBill}</p>
            <p className="text-[10px] text-green-600 font-bold">Ab tak jama: ₹{totalPaid}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount Input */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">
              Aaj Kitne Paise Aaye? *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="number" 
                required
                max={pendingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-xl font-extrabold text-gray-800 border-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">
              Paise Kaise Diye?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setMethod('CASH')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'CASH' ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
              >
                <IndianRupee w={20} h={20} />
                <span className="text-xs font-bold">Cash</span>
              </div>
              <div 
                onClick={() => setMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'UPI' ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
              >
                <Smartphone w={20} h={20} />
                <span className="text-xs font-bold">UPI / PhonePe</span>
              </div>
              <div 
                onClick={() => setMethod('CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'CARD' ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
              >
                <CreditCard w={20} h={20} />
                <span className="text-xs font-bold">Card Swipe</span>
              </div>
              <div 
                onClick={() => setMethod('BANK')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'BANK' ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
              >
                <Building w={20} h={20} />
                <span className="text-xs font-bold">Bank Transfer</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Koi Note? (Jaise: Bete ne paise diye)" 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-gray-800 border-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending || pendingAmount <= 0}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all mt-4 disabled:bg-gray-400"
          >
            {mutation.isPending ? 'Jama ho raha hai...' : 'Paisa Jama Karein (Save)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPayment;