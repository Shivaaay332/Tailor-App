import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scissors, Calendar, IndianRupee, User, ArrowLeft, FileText } from 'lucide-react';
import apiClient from '../api/apiClient';

const AddOrder = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Naye schema ke hisaab se form state
  const [formData, setFormData] = useState({
    customerId: '',
    garmentType: 'SHIRT', // Enum format
    quantity: 1,
    price: '', // Ek kapde ki silai
    advanceAmount: '',
    dueDate: '',
    notes: ''
  });

  // Grahakon ki list mangwana (Dropdown ke liye)
  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/customers');
      return res.data;
    }
  });
  const customers = customersResponse?.data || [];

  // Order save karne ki API call
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/orders', payload);
      return res.data;
    },
    onSuccess: () => {
      // Data naya hai, isliye purane cache ko clear karo
      queryClient.invalidateQueries(['allOrders']);
      queryClient.invalidateQueries(['allOrdersWithPayments']);
      queryClient.invalidateQueries(['dashboardSummary']);
      alert("🎉 Order successfully ban gaya!");
      navigate('/orders'); // Order banne ke baad orders par bhejo
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Order banane me samasya aayi.");
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert("Kripya ek grahak chunein!");
      return;
    }

    // Backend ke format (OrderItems array) me data taiyar karna
    const totalAmount = parseFloat(formData.price) * parseInt(formData.quantity);
    const advance = parseFloat(formData.advanceAmount || 0);

    if (advance > totalAmount) {
      alert("Advance total bill se zyada nahi ho sakta!");
      return;
    }

    const payload = {
      customerId: formData.customerId,
      totalAmount: totalAmount,
      advanceAmount: advance,
      dueDate: formData.dueDate,
      notes: formData.notes,
      paymentMethod: 'CASH',
      items: [
        {
          garmentType: formData.garmentType,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          notes: formData.notes
        }
      ]
    };

    mutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-indigo-700 px-4 pt-6 pb-6 rounded-b-[2rem] shadow-lg shadow-primary/20 relative text-center">
        <Link to="/orders" className="absolute left-4 top-6 text-white p-2 bg-white/20 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white">Naya Order Banayein</h1>
        <p className="text-white/80 text-xs mt-1">Grahak ka naya bill taiyar karein</p>
      </div>

      <div className="px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Grahak Selection */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <User w={14} h={14} /> Grahak Chunein *
            </label>
            {isLoading ? (
              <p className="text-sm text-slate-500">Grahak load ho rahe hain...</p>
            ) : (
              <select 
                name="customerId" 
                required
                value={formData.customerId} 
                onChange={handleChange}
                className="w-full p-3 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-white border border-slate-600"
              >
                <option value="">-- Grahak Select Karein --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                ))}
              </select>
            )}
            {!formData.customerId && customers.length > 0 && (
               <p className="text-[10px] text-orange-400 mt-2 font-medium">Agar grahak naya hai, toh pehle 'Customers' tab se use add karein.</p>
            )}
          </div>

          {/* Kapde Ki Details */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Scissors w={14} h={14} /> Kapde Ki Jankari
            </label>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold ml-1">KAPDA (ITEM)</span>
                <select 
                  name="garmentType" 
                  value={formData.garmentType} 
                  onChange={handleChange}
                  className="w-full p-3 mt-1 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-white border border-slate-600"
                >
                  <option value="SHIRT">Shirt</option>
                  <option value="PANT">Pant</option>
                  <option value="KURTA">Kurta</option>
                  <option value="PAJAMA">Pajama</option>
                  <option value="COAT">Coat</option>
                  <option value="BLOUSE">Blouse</option>
                  <option value="LEHENGA">Lehenga</option>
                  <option value="SHERWANI">Sherwani</option>
                  <option value="CUSTOM">Custom / Anya</option>
                </select>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold ml-1">KITNE PIECE?</span>
                <input 
                  type="number" 
                  name="quantity" 
                  min="1"
                  required
                  value={formData.quantity} 
                  onChange={handleChange}
                  className="w-full p-3 mt-1 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-white border border-slate-600" 
                />
              </div>
            </div>

            <div className="relative mt-2">
              <span className="text-[10px] text-slate-500 font-bold ml-1">SILAI KA RATE (PER PIECE) *</span>
              <div className="relative mt-1">
                <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="number" 
                  name="price" 
                  required
                  placeholder="Jaise: 500" 
                  value={formData.price} 
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-3 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-white placeholder-slate-500 border border-slate-600" 
                />
              </div>
            </div>
          </div>

          {/* Payment aur Delivery */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Calendar w={14} h={14} /> Hisaab Aur Tareekh
            </label>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold ml-1">ADVANCE DIYA (₹)</span>
                <input 
                  type="number" 
                  name="advanceAmount" 
                  placeholder="0"
                  value={formData.advanceAmount} 
                  onChange={handleChange}
                  className="w-full p-3 mt-1 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-white placeholder-slate-500 border border-slate-600" 
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold ml-1">DELIVERY DATE *</span>
                <input 
                  type="date" 
                  name="dueDate" 
                  required
                  value={formData.dueDate} 
                  onChange={handleChange}
                  className="w-full p-3 mt-1 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-white border border-slate-600" 
                />
              </div>
            </div>

            <div className="relative">
              <span className="text-[10px] text-slate-500 font-bold ml-1">KUCH KHAS NOTES (OPTIONAL)</span>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  name="notes" 
                  placeholder="Jaise: Collar tight rakhna..." 
                  value={formData.notes} 
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-3 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-white placeholder-slate-500 border border-slate-600" 
                />
              </div>
            </div>
          </div>

          {/* Total Bill Calculation Summary */}
          {formData.price && (
            <div className="bg-primary/20 p-4 rounded-2xl border border-primary/30 flex justify-between items-center">
              <span className="text-primary font-bold text-sm">Total Bill:</span>
              <span className="text-primary font-extrabold text-xl">₹{(formData.price * formData.quantity).toFixed(2)}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg mt-2"
          >
            {mutation.isPending ? 'Bill Ban Raha Hai...' : 'Order Confirm Karein'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddOrder;