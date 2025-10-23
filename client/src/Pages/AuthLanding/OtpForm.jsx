import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import useAuthApi from '../../hooks/useAuthApi';

export default function OtpForm({ email, onVerified, onBack ,onSuccess}) {
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const { verifyOtp, resendOtp, loading, error,login } = useAuthApi();

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      const data = await verifyOtp(email, otp);
      console.log(data);
      
      if (data.token) {
        toast.success('Email verified successfully!');
        onSuccess(data.token, data.user);
        // login(data.token, data.user || { email });  
        // toast.success('Login successful!');
        // onVerified(data.token, data.user);
      } else {
        toast.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to verify OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await resendOtp(email);
      toast.success('OTP resent to your email!');
    } catch {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center text-gray-700 p-0 h-auto hover:bg-transparent"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-lg font-semibold">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={otp[i] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setOtp((prev) => prev.substring(0, i) + val + prev.substring(i + 1));
                if (val && i < 5) {
                  document.getElementById(`otp-${i + 1}`)?.focus();
                }
              }}
              id={`otp-${i}`}
              className="w-10 h-12 text-center border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.length !== 6}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white p-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="text-blue-600 hover:underline disabled:opacity-50"
          >
            {resending ? 'Resending...' : "Didn't receive the code? Resend"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
