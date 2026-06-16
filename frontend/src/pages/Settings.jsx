import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  User, Store, DownloadCloud, UploadCloud, 
  Trash2, LogOut, Smartphone, Edit3, X, Camera, Shield, Info 
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authService } from '../api/services/authService';
import apiClient from '../api/apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'https://tailor-app-88nn.onrender.com';

const Settings = () => {
  const { user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  const [profileData, setProfileData] = useState({ name: user?.name || '', file: null });
  const [shopData, setShopData] = useState({ shopName: user?.shop?.shopName || '', address: user?.shop?.address || '', file: null });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("App pehle se install hai ya browser support nahi karta.");
    }
  };

  const profileMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await apiClient.put('/settings/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      const updatedUser = { ...user, name: data.data.name, profileImage: data.data.profileImage, shop: data.data.shop };
      setAuth(updatedUser, useAuthStore.getState().token);
      setShowProfileModal(false);
      alert("Profile Update ho gayi!");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Profile update me error aayi.");
    }
  });

  const shopMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await apiClient.put('/settings/shop', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      const updatedUser = { ...user, shopName: data.data.shopName, shopLogo: data.data.logo };
      setAuth(updatedUser, useAuthStore.getState().token);
      setShowShopModal(false);
      alert("Shop Details Update ho gayi!");
      queryClient.invalidateQueries(['dashboardSummary']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Shop update me error aayi.");
    }
  });

  const submitProfileUpdate = (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      alert("Naam daalna zaroori hai.");
      return;
    }
    const fd = new FormData();
    fd.append('name', profileData.name);
    if (profileData.file) fd.append('profileImage', profileData.file);
    profileMutation.mutate(fd);
  };

  const submitShopUpdate = (e) => {
    e.preventDefault();
    if (!shopData.shopName.trim()) {
      alert("Shop ka Naam daalna zaroori hai.");
      return;
    }
    const fd = new FormData();
    fd.append('shopName', shopData.shopName);
    if (shopData.address) fd.append('address', shopData.address);
    if (shopData.file) fd.append('shopLogo', shopData.file);
    shopMutation.mutate(fd);
  };

  const handleBackup = async () => {
    try {
      const res = await apiClient.get('/settings/backup');
      if (res.data.data) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `TailorBackup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        alert("Backup download ho gaya!");
      }
    } catch (error) {
      alert("Backup error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("⚠️ Kya aap sach me saara data delete karna chahte hain?")) return;
    if (window.prompt("Type karein: RESET") !== "RESET") return alert("Cancel ho gaya.");

    try {
      await apiClient.delete('/settings/reset');
      queryClient.clear();
      alert("✅ Data reset successful!");
      window.location.reload();
    } catch (error) {
      alert("Reset error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Kya aap logout karna chahte hain?")) return;
    try {
      await authService.logout();
      clearAuth();
      navigate('/');
    } catch (error) {
      clearAuth();
      navigate('/');
    }
  };

  const profileUrl = user?.profileImage ? `${API_URL}/${user.profileImage}` : null;
  const logoUrl = user?.shopLogo ? `${API_URL}/${user.shopLogo}` : null;
  const shopName = user?.shop?.shopName || user?.shopName || 'My Tailor Shop';
  const shopAddress = user?.shop?.address || '';

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-indigo-700 px-4 pt-8 pb-16 rounded-b-[2rem] shadow-lg shadow-primary/20">
        <h1 className="text-2xl font-bold text-white text-center">Settings</h1>
        <p className="text-white/70 text-sm text-center mt-1">App settings & profile manage karein</p>
      </div>

      <div className="px-4 -mt-10">
        
        {/* Profile Card */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/30 shrink-0">
              {profileUrl ? (
                <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              ) : (
                <User className="text-primary w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{user?.name || 'User'}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setShowProfileModal(true)} className="p-3 bg-primary/20 rounded-xl text-primary">
            <Edit3 w={20} h={20} />
          </button>
        </div>

        {/* Shop Card */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden border border-slate-600 shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Shop" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              ) : (
                <Store className="text-slate-400 w-8 h-8" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Dukan</p>
              <h2 className="text-base font-bold text-white leading-tight">{shopName}</h2>
              {shopAddress && <p className="text-xs text-slate-400 mt-0.5">{shopAddress}</p>}
            </div>
          </div>
          <button onClick={() => setShowShopModal(true)} className="p-3 bg-slate-700 rounded-xl text-primary">
            <Edit3 w={20} h={20} />
          </button>
        </div>

        {/* App Info Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Info className="text-blue-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Tailor App</h3>
                <p className="text-xs text-slate-400">Version 1.0.0 • Dark Theme</p>
              </div>
            </div>
          </div>

          {deferredPrompt && (
            <button onClick={handleInstallPWA} className="w-full flex items-center gap-3 p-4 hover:bg-slate-700/50 transition-colors border-b border-slate-700">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Smartphone className="text-purple-400 w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <span className="block font-semibold text-sm text-white">Install App</span>
                <span className="text-[10px] text-slate-400">Phone par app install karein</span>
              </div>
            </button>
          )}
        </div>

        {/* Backup Section */}
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 px-1">Data Backup</h3>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-6">
          <button onClick={handleBackup} className="w-full flex items-center gap-3 p-4 hover:bg-slate-700/50 transition-colors border-b border-slate-700">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <DownloadCloud className="text-green-400 w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <span className="block font-semibold text-sm text-white">Backup Download Karein</span>
              <span className="text-[10px] text-slate-400">Sab data JSON file me save karein</span>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <h3 className="text-xs font-bold text-red-400/70 uppercase mb-2 px-1">Danger Zone</h3>
        <div className="bg-slate-800 rounded-2xl border border-red-500/30 overflow-hidden mb-6">
          <button onClick={handleResetData} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <Trash2 className="text-red-400 w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <span className="block font-bold text-sm text-red-400">Reset All Data</span>
              <span className="text-[10px] text-red-400/60">Sab customers, orders aur payments delete karein</span>
            </div>
          </button>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="w-full bg-red-500/20 border border-red-500/30 text-red-400 font-bold p-4 rounded-2xl flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl w-full max-w-sm p-6 relative border border-slate-700">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X w={24} h={24}/>
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Profile Update</h2>
            <form onSubmit={submitProfileUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Aapka Naam *</label>
                <input 
                  type="text" 
                  required 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                  className="w-full p-4 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-white placeholder-slate-500 border border-slate-600" 
                  placeholder="Naam daalein"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-2">
                  <Camera w={14} h={14}/> Profile Photo (Optional)
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setProfileData({...profileData, file: e.target.files[0]})} 
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary"
                />
              </div>
              <button 
                type="submit" 
                disabled={profileMutation.isPending} 
                className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 disabled:opacity-50"
              >
                {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Shop Update Modal */}
      {showShopModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl w-full max-w-sm p-6 relative border border-slate-700">
            <button onClick={() => setShowShopModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X w={24} h={24}/>
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Shop Details Update</h2>
            <form onSubmit={submitShopUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Dukan ka Naam *</label>
                <input 
                  type="text" 
                  required 
                  value={shopData.shopName} 
                  onChange={(e) => setShopData({...shopData, shopName: e.target.value})} 
                  className="w-full p-4 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-white placeholder-slate-500 border border-slate-600" 
                  placeholder="Jaise: Sharma Tailors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Address (Optional)</label>
                <input 
                  type="text" 
                  value={shopData.address} 
                  onChange={(e) => setShopData({...shopData, address: e.target.value})} 
                  className="w-full p-4 bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-white placeholder-slate-500 border border-slate-600" 
                  placeholder="Shop ka address"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-2">
                  <Camera w={14} h={14}/> Shop Logo (Optional)
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setShopData({...shopData, file: e.target.files[0]})} 
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary"
                />
              </div>
              <button 
                type="submit" 
                disabled={shopMutation.isPending} 
                className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 disabled:opacity-50"
              >
                {shopMutation.isPending ? 'Saving...' : 'Save Shop Info'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;