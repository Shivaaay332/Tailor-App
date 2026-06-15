import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { authService } from '../api/services/authService';

const ResetPassword = () => {
  // URL se token nikalna (jaise /reset-password/abc123token)
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (password) => authService.resetPassword(token, password),
    onSuccess: (data) => {
      alert(data.message);
      navigate('/'); // Wapas login par bhejo
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Link expire ho chuki hai.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
      setErrorMsg("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }
    mutation.mutate(newPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-primary w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Naya Password Banayein</h1>
        <p className="text-gray-500 text-sm mb-6">Ab ek strong aur naya password type karein.</p>

        {errorMsg && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              required 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Naya Password" 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary text-center" 
            />
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
          >
            {mutation.isPending ? 'Save ho raha hai...' : 'Password Update Karein'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;