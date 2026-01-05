import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const Backend = `${base.replace(/\/$/, "")}/api/users`;

export default function useAuthApi() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (url, body) => {
    setLoading(true);
    setError(null);

    try {
      const targetUrl = `${Backend}/${url.replace(/^\//, "")}`;
      console.log("📤 API Request:", targetUrl);

      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Request failed");
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
    return await apiCall("/signup", { name, email, password });
  };

  const loginWithGoogle = () => {
    window.location.href = `${Backend}/auth/google`;
  };

  const verifyOtp = async (email, otp) => {
    return await apiCall("/email/verify-otp", { email, otp });
  };

  const resendOtp = async (email) => {
    return await apiCall("/signup", { email, resend: true });
  };

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
    verifyOtp,
    resendOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    completePhoneSignup,
    loading,
    error,
  };
}