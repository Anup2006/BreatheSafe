import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import useAuthApi from '../../hooks/useAuthApi';

const COUNTRY_CODES = [
  { code: '+91', name: 'India 🇮🇳' },
];

export default function PhoneOtpModal({ open, onClose, onSuccess, mode = 'login' }) {
  const [step, setStep] = useState('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [localNumber, setLocalNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
const { sendPhoneOtp, verifyPhoneOtp, completePhoneSignup } = useAuthApi();

  const resetForm = () => {
    setStep('phone');
    setCountryCode('+91');
    setLocalNumber('');
    setOtp('');
    setName('');
    setPassword('');
    setIsNewUser(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const phone = `${countryCode}${localNumber}`;

const handleSendOtp = async () => {
  if (!localNumber || localNumber.length < 7) {
    toast.error('Please enter a valid phone number');
    return;
  }
  setLoading(true);
  try {
    await sendPhoneOtp(phone);   
    toast.success('OTP sent to your phone!');
    setStep('otp');
  } catch (err) {
    toast.error(err.message || 'Failed to send OTP');
  } finally {
    setLoading(false);
  }
};

const handleVerifyOtp = async () => {
  if (otp.length !== 6) {
    toast.error('Please enter a valid 6-digit OTP');
    return;
  }
  setLoading(true);
  try {
    const data = await verifyPhoneOtp(phone, otp); // ✅ Use hook
    if (!data.user?.name) {
      setIsNewUser(true);
      setStep('password');
      toast.success('Phone verified! Please complete your profile.');
    } else if (data.token) {
      toast.success('Phone verified successfully!');
      // login(data.token, data.user); // ✅ Save user & token in context
      handleClose();
      // onSuccess?.(data.token);
    }
  } catch (err) {
    toast.error(err.message || 'Failed to verify OTP');
  } finally {
    setLoading(false);
  }
};


 const handleSetPassword = async () => {
  if (!name?.trim()) {
    toast.error('Please enter your full name');
    return;
  }
  if (!password || password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }
  setLoading(true);
  try {
    const data = await completePhoneSignup(phone, name, password); // ✅ Use hook
    console.log(data);
    console.log(!!data.user);
    console.log(data.user);
    
    if (data.token ) {
      toast.success('Account created successfully!');
      onSuccess(data.token,data.user);
      handleClose();
      
    }
  } catch (err) {
    toast.error(err.message || 'Failed to create account');
  } finally {
    setLoading(false);
  }
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {step === 'phone' ? 'Enter Phone' : step === 'otp' ? 'Verify OTP' : 'Complete Signup'}
        </h2>

        <AnimatePresence mode="wait">
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <label className="block text-sm font-medium">Phone Number</label>
              <div className="flex items-center gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="border rounded-md p-2 bg-gray-50"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={localNumber}
                    onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, ''))}
                    className="pl-10 w-full border rounded-md p-2"
                  />
                </div>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <label className="block text-sm font-medium">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full border rounded-md p-2 text-center tracking-widest"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </motion.div>
          )}

          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <label className="block text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full border rounded-md p-2"
                />
              </div>

              <label className="block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full border rounded-md p-2"
                />
              </div>

              <button
                onClick={handleSetPassword}
                disabled={loading}
                className="w-full bg-green-600 text-white p-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Complete Signup'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
