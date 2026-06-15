import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Scissors, ArrowLeft, Ruler, Copy, Plus, Trash2 } from 'lucide-react';
import apiClient from '../api/apiClient';

// Har kapde ke hisaab se uske fix naap (Exact requirement ke hisaab se)
const garmentFields = {
  SHIRT: ['Shoulder', 'Chest', 'Waist', 'Sleeve', 'Collar', 'Length'],
  PANT: ['Waist', 'Hip', 'Length', 'Bottom'],
  KURTA: ['Chest', 'Waist', 'Shoulder', 'Sleeve', 'Length'],
  JACKET: ['Chest', 'Waist', 'Shoulder', 'Sleeve', 'Length'],
  CUSTOM: [] // Custom me hum dynamic rows chalayenge
};

const AddMeasurement = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Edit Mode Check (Agar CustomerDetail se data pass hua hai)
  const editData = location.state?.measurement;
  const isEditMode = !!editData;

  const [garmentType, setGarmentType] = useState(editData?.garmentType || 'SHIRT');
  const [measurementData, setMeasurementData] = useState({});
  const [customFields, setCustomFields] = useState([{ key: '', value: '' }]);

  // FIX: ID ki strict checking (Undefined API error rokne ke liye)
  const validId = Boolean(customerId && customerId !== 'undefined' && customerId !== 'null');

  // Grahak ki purani history mangwana (Duplicate feature ke liye)
  const { data: historyRes } = useQuery({
    queryKey: ['customerMeasurements', customerId],
    queryFn: async () => {
      const res = await apiClient.get(`/measurements/customer/${customerId}`);
      return res.data;
    },
    // FIX: Jab tak customerId na ho, API call mat karo aur faltu retry roko
    enabled: Boolean(validId && !isEditMode), 
    retry: false 
  });

  // Jab Kapda badle (ya Edit mode ho), fields set karna
  useEffect(() => {
    if (isEditMode && editData.garmentType === garmentType) {
      if (garmentType === 'CUSTOM') {
        const customArr = Object.entries(editData.data).map(([k, v]) => ({ key: k, value: v }));
        setCustomFields(customArr.length > 0 ? customArr : [{ key: '', value: '' }]);
      } else {
        setMeasurementData(editData.data);
      }
    } else {
      if (garmentType === 'CUSTOM') {
        setCustomFields([{ key: '', value: '' }]);
      } else {
        const initialData = {};
        garmentFields[garmentType].forEach(field => { initialData[field] = ''; });
        setMeasurementData(initialData);
      }
    }
  }, [garmentType, isEditMode, editData]);

  // Save/Update API Call
  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditMode) {
        const res = await apiClient.put(`/measurements/${editData.id}`, payload);
        return res.data;
      } else {
        const res = await apiClient.post('/measurements', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customer', customerId]);
      alert(`🎉 Naap successfully ${isEditMode ? 'update' : 'save'} ho gaya!`);
      navigate(`/customer/${customerId}`); 
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Naap save karne me error aayi.");
    }
  });

  const handleInputChange = (field, value) => {
    setMeasurementData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomChange = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const addCustomField = () => setCustomFields([...customFields, { key: '', value: '' }]);
  const removeCustomField = (index) => {
    const updated = customFields.filter((_, i) => i !== index);
    setCustomFields(updated.length ? updated : [{ key: '', value: '' }]);
  };

  // Duplicate Previous Measurement Logic
  const handleDuplicate = () => {
    const pastMeasurements = historyRes?.data?.filter(m => m.garmentType === garmentType);
    if (pastMeasurements && pastMeasurements.length > 0) {
      const latest = pastMeasurements[0]; // Descending order me aata hai
      if (garmentType === 'CUSTOM') {
        const customArr = Object.entries(latest.data).map(([k, v]) => ({ key: k, value: v }));
        setCustomFields(customArr);
      } else {
        setMeasurementData(latest.data);
      }
      alert(`${garmentType} ka pichla naap copy ho gaya hai!`);
    } else {
      alert(`Is grahak ka pichla koi ${garmentType} ka naap nahi mila.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalData = {};
    if (garmentType === 'CUSTOM') {
      customFields.forEach(item => {
        if (item.key.trim() !== '') finalData[item.key] = item.value;
      });
      if (Object.keys(finalData).length === 0) return alert("Kam se kam ek naap dalein!");
    } else {
      finalData = measurementData;
    }

    mutation.mutate({ customerId, garmentType, data: finalData });
  };

  const currentFields = garmentFields[garmentType];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-6 rounded-b-[2rem] shadow-sm relative text-center">
        <Link to={`/customer/${customerId}`} className="absolute left-4 top-6 text-white p-1 bg-white/20 rounded-full active:bg-white/30">
          <ArrowLeft size={20} />
        </Link>
        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
          <Ruler className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">{isEditMode ? 'Naap Update Karein' : 'Naya Naap (Measurement)'}</h1>
      </div>

      <div className="px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                Kiska Naap Lena Hai?
              </label>
              {!isEditMode && (
                <button type="button" onClick={handleDuplicate} className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold active:bg-blue-100">
                  <Copy w={12} h={12}/> Pichla Copy Karein
                </button>
              )}
            </div>
            <div className="relative">
              <Scissors className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <select 
                value={garmentType} 
                onChange={(e) => setGarmentType(e.target.value)}
                disabled={isEditMode} // Edit karte waqt kapda change na karein
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-bold text-gray-800 border-none appearance-none disabled:opacity-60"
              >
                <option value="SHIRT">Shirt</option>
                <option value="PANT">Pant</option>
                <option value="KURTA">Kurta</option>
                <option value="JACKET">Jacket</option>
                <option value="CUSTOM">Anya (Custom)</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Naap Darj Karein (Inches me)</h3>
            
            {garmentType !== 'CUSTOM' ? (
              <div className="grid grid-cols-2 gap-4">
                {currentFields.map((field, index) => (
                  <div key={index}>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 block mb-1">
                      {field}
                    </label>
                    <input 
                      type="number" 
                      step="0.25" 
                      value={measurementData[field] || ''} 
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-semibold text-gray-800 border-none text-center" 
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* CUSTOM DYNAMIC FIELDS */
              <div className="space-y-3">
                {customFields.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Naap ka Naam (eg: Hat Size)" 
                      value={item.key}
                      onChange={(e) => handleCustomChange(index, 'key', e.target.value)}
                      className="w-1/2 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold border-none outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input 
                      type="number" 
                      step="0.25"
                      placeholder="0.0" 
                      value={item.value}
                      onChange={(e) => handleCustomChange(index, 'value', e.target.value)}
                      className="w-1/3 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold border-none outline-none focus:ring-2 focus:ring-primary text-center"
                    />
                    <button type="button" onClick={() => removeCustomField(index)} className="p-2 text-red-400 active:bg-red-50 rounded-lg">
                      <Trash2 w={18} h={18} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addCustomField} className="w-full mt-2 flex items-center justify-center gap-1 bg-gray-50 text-gray-600 py-2 rounded-xl text-xs font-bold active:bg-gray-100">
                  <Plus w={14} h={14} /> Naya Field Jodein
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all mt-4"
          >
            {mutation.isPending ? 'Save ho raha hai...' : 'Naap Save Karein'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMeasurement;