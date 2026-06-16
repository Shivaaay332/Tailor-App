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
    totalBill = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) || 0;
    totalPaid = order.payments?.reduce((sum, pay) => sum + (pay.installmentAmount || 0), 0) || 0;
    pendingAmount = totalBill - totalPaid;
  }

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allOrders']);
      queryClient.invalidateQueries(['allOrdersWithPayments']);
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
  if (!order) return <div className="text-center pt-20 font-bold text-red-400">Order nahi mila!</div>;

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-indigo-700 px-4 pt-6 pb-6 rounded-b-[2rem] shadow-lg shadow-primary/20 relative text-center">
        <Link to="/payments" className="absolute left-4 top-6 text-white p-2 bg-white/20 rounded-full">
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
        <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-2xl mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Baki Udhaari (Pending)</p>
            <h2 className="text-2xl font-extrabold text-red-400">₹{pendingAmount}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold">Total Bill: ₹{totalBill}</p>
            <p className="text-[10px] text-green-400 font-bold">Ab tak jama: ₹{totalPaid}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount Input */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">
              Aaj Kitne Paise Aaye? *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input 
                type="number" 
                required
                max={pendingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-xl font-extrabold text-white border border-slate-600"
                placeholder="0"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-3 block">
              Paise Kaise Diye?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setMethod('CASH')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'CASH' ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
              >
                <IndianRupee w={20} h={20} />
                <span className="text-xs font-bold">Cash</span>
              </div>
              <div 
                onClick={() => setMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'UPI' ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
              >
                <Smartphone w={20} h={20} />
                <span className="text-xs font-bold">UPI / PhonePe</span>
              </div>
              <div 
                onClick={() => setMethod('CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'CARD' ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
              >
                <CreditCard w={20} h={20} />
                <span className="text-xs font-bold">Card Swipe</span>
              </div>
              <div 
                onClick={() => setMethod('BANK')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${method === 'BANK' ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
              >
                <Building w={20} h={20} />
                <span className="text-xs font-bold">Bank Transfer</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
             <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Koi Note? (Jaise: Bete ne paise diye)" 
                className="w-full pl-11 pr-4 py-3 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-white placeholder-slate-500 border border-slate-600" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending || pendingAmount <= 0}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg mt-4 disabled:bg-slate-700"
          >
            {mutation.isPending ? 'Jama ho raha hai...' : 'Paisa Jama Karein (Save)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPayment;