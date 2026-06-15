import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  User, Store, Moon, DownloadCloud, UploadCloud, 
  Trash2, LogOut, Smartphone, Edit3, X, Camera 
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authService } from '../api/services/authService';
import apiClient from '../api/apiClient';

const Settings = () => {
  const { user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Modals State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  // Form States
  const [profileData, setProfileData] = useState({ name: user?.name || '', file: null });
  const [shopData, setShopData] = useState({ shopName: user?.shopName || '', address: '', file: null });

  // PWA Setup
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("App pehle se install hai ya browser support nahi karta.");
    }
  };

  // Profile Update Mutation
  const profileMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await apiClient.put('/settings/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Zustand store update karna taaki UI turant change ho
      const updatedUser = { ...user, name: data.data.name, profileImage: data.data.profileImage };
      setAuth(updatedUser, useAuthStore.getState().token);
      setShowProfileModal(false);
      alert("Profile Update ho gayi!");
    }
  });

  // Shop Update Mutation
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
    }
  });

  const submitProfileUpdate = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', profileData.name);
    if (profileData.file) fd.append('profileImage', profileData.file);
    profileMutation.mutate(fd);
  };

  const submitShopUpdate = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('shopName', shopData.shopName);
    if (shopData.address) fd.append('address', shopData.address);
    if (shopData.file) fd.append('shopLogo', shopData.file);
    shopMutation.mutate(fd);
  };

  const handleBackup = async () => {
    try {
      const res = await apiClient.get('/settings/backup');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `TailorBackup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      alert("Backup error.");
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
      alert("Reset error.");
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

  const profileUrl = user?.profileImage ? `http://localhost:5000/${user.profileImage}` : null;
  const logoUrl = user?.shopLogo ? `http://localhost:5000/${user.shopLogo}` : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-primary px-4 pt-8 pb-16 rounded-b-[2rem] shadow-sm">
        <h1 className="text-2xl font-bold text-white text-center">Settings & Controls</h1>
      </div>

      <div className="px-4 -mt-10">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border border-primary/20 shrink-0">
              {profileUrl ? <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" /> : <User className="text-primary w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">{user?.name}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setShowProfileModal(true)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-primary">
            <Edit3 w={18} h={18} />
          </button>
        </div>

        {/* Shop Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
              {logoUrl ? <img src={logoUrl} alt="Shop" className="w-full h-full object-cover" /> : <Store className="text-gray-400 w-7 h-7" />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Shop Details</p>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{user?.shopName}</h2>
            </div>
          </div>
          <button onClick={() => setShowShopModal(true)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-primary">
            <Edit3 w={18} h={18} />
          </button>
        </div>

        {/* Theme & App Controls */}
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">App Controls</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          
          <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg"><Moon className="text-blue-500 w-5 h-5" /></div>
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
            </div>
            <div onClick={toggleDarkMode} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isDarkMode ? 'translate-x-6' : ''}`}></div>
            </div>
          </div>

          <button onClick={handleInstallPWA} className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg"><Smartphone className="text-purple-500 w-5 h-5" /></div>
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Install Tailor App</span>
            </div>
          </button>
        </div>

        {/* Backup & Restore */}
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">Data Backup & Export</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <button onClick={handleBackup} className="w-full flex items-center gap-3 p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50">
            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg"><DownloadCloud className="text-green-500 w-5 h-5" /></div>
            <div className="text-left">
              <span className="block font-semibold text-sm text-gray-700 dark:text-gray-200">Export & Backup Data</span>
              <span className="text-[10px] text-gray-500">Download JSON File</span>
            </div>
          </button>
          <button onClick={() => alert("Restore feature jaldi aa raha hai!")} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg"><UploadCloud className="text-orange-500 w-5 h-5" /></div>
            <div className="text-left">
              <span className="block font-semibold text-sm text-gray-700 dark:text-gray-200">Restore Database</span>
              <span className="text-[10px] text-gray-500">Upload JSON File</span>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden mb-6">
          <button onClick={handleResetData} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-red-600">
            <div className="bg-red-50 dark:bg-red-900/50 p-2 rounded-lg"><Trash2 className="text-red-500 w-5 h-5" /></div>
            <div className="text-left">
              <span className="block font-bold text-sm">Reset All Data</span>
              <span className="text-[10px]">Delete Everything</span>
            </div>
          </button>
        </div>

        <button onClick={handleLogout} className="w-full bg-gray-900 dark:bg-gray-700 text-white font-bold p-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 shadow-lg">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* --- MODALS --- */}
      
      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-400"><X w={20} h={20}/></button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit Profile</h2>
            <form onSubmit={submitProfileUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Aapka Naam</label>
                <input type="text" required value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1"><Camera w={14} h={14}/> Nayi Photo Chunein</label>
                <input type="file" accept="image/*" onChange={(e) => setProfileData({...profileData, file: e.target.files[0]})} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary" />
              </div>
              <button type="submit" disabled={profileMutation.isPending} className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-2">{profileMutation.isPending ? 'Updating...' : 'Save Profile'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Shop Update Modal */}
      {showShopModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowShopModal(false)} className="absolute top-4 right-4 text-gray-400"><X w={20} h={20}/></button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit Shop</h2>
            <form onSubmit={submitShopUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Dukan ka Naam</label>
                <input type="text" required value={shopData.shopName} onChange={(e) => setShopData({...shopData, shopName: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Pata (Address)</label>
                <input type="text" placeholder="Optional" value={shopData.address} onChange={(e) => setShopData({...shopData, address: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1"><Camera w={14} h={14}/> Naya Shop Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setShopData({...shopData, file: e.target.files[0]})} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary" />
              </div>
              <button type="submit" disabled={shopMutation.isPending} className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-2">{shopMutation.isPending ? 'Updating...' : 'Save Shop Info'}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;