import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../api/services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Kuch galat ho gaya.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        <Link to="/" className="inline-block p-2 bg-gray-50 rounded-full mb-4 text-gray-600 active:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Bhej Diya Gaya Hai!</h2>
            <p className="text-gray-500 text-sm">
              Humne <b>{email}</b> par password reset karne ka link bhej diya hai. Kripya apna inbox check karein.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Bhool Gaye?</h1>
            <p className="text-gray-500 text-sm mb-6">Apna registered email address dalein, hum aapko password reset karne ka link bhejenge.</p>

            {errorMsg && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{errorMsg}</div>}

            <form onSubmit={handleSubmit}>
              <div className="relative mb-6">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Apna Email dalein" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary" 
                />
              </div>

              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                {mutation.isPending ? 'Bhej rahe hain...' : 'Reset Link Bhejein'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;