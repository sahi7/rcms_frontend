import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '../landing/components/Header';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get(`/onboarding/verify-email/${token}/`);
        setStatus('success');
        toast.success('Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.detail || 'Verification link is invalid or expired');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    try {
      await api.post('/onboarding/resend-verification/');
      toast.success('Verification email resent. Please check your inbox.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resend email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-md mx-auto pt-40 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-10 text-center"
        >
          {status === 'loading' && (
            <div className="py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto" />
              <p className="mt-6 text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-8">
                Your account has been activated. You can now log in.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-6">
                <AlertCircle size={48} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-8">{errorMessage}</p>

              <div className="space-y-4">
                <Button
                  onClick={handleResend}
                  variant="outline"
                  className="w-full h-12 flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Resend verification email
                </Button>

                <Button
                  onClick={() => navigate('/')}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}