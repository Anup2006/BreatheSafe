import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const base = import.meta.env.VITE_BACKEND_URL  || "http://localhost:5000";
const Backend = `${base}/api/users`;

export default function useAuthApi() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (url, body) => {
    setLoading(true);
    setError(null);

    try {
      console.log("📤 Sending to backend:", `${Backend}${url}`, body);
      const res = await fetch(`${Backend}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || data.error || "Something went wrong");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async ({ email, phone, password }) => {
    const payload = email ? { email, password } : { phone, password };
    const data = await apiCall("/login", payload);

    if (data.token && data.user) login(data.token, data.user);
    return data;
  };

  const signupUser = async ({ name, email, password }) => {
    const data = await apiCall("/signup", { name, email, password });
    return data;
  };

  const loginWithGoogle = () => {
    setLoading(true);
    setError(null);
    try {
      window.location.href = `${Backend}/auth/google`;
    } catch (err) {
      setError(err.message || "Failed to redirect for Google login");
      setLoading(false);
    }
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = (token, user) => {
    if (token && user) {
      login(token, user);
      console.log("Google login successful:", user);
    } else {
      setError("Google login failed: no token received");
    }
    setLoading(false);
  };
  const verifyOtp = async (email, otp) => {
    return await apiCall("/email/verify-otp", { email, otp });
  };

  const resendOtp = async (email) => {
    return await apiCall("/signup", { email, resend: true });
  };
  // Phone OTP
  const sendPhoneOtp = async (phone) => {
    return await apiCall("/phone/send-otp", { phone });
  };

  const verifyPhoneOtp = async (phone, otp) => {
    return await apiCall("/phone/verify-otp", { phone, otp });
  };

  const completePhoneSignup = async (phone, name, password) => {
    return await apiCall("/phone/complete-signup", { phone, name, password });
  };

  return {
    loginUser,
    signupUser,
    loginWithGoogle,
    handleGoogleCallback,
    verifyOtp,
    resendOtp,
    loading,
    sendPhoneOtp,
    verifyPhoneOtp,
    completePhoneSignup,
    error,
  };
}
