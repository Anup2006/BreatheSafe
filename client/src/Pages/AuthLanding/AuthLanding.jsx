import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import breathSafeLogo from "/src/assets/lungsLogo.png";

const BACKEND_URL = "http://localhost:5000/api/users";

const AuthLanding = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const res = await axios.post(`${BACKEND_URL}${endpoint}`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);
      navigate("/app");
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/users/auth/google";
  };

  // Phone OTP login
  const handleSendOtp = async () => {
    if (!formData.phone)
      return alert("Enter your phone number with country code.");
    try {
      await axios.post(`${BACKEND_URL}/phone/send-otp`, {
        phone: formData.phone,
      });
      setOtpSent(true);
      alert("OTP sent to your phone!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/phone/verify-otp`, {
        phone: formData.phone,
        otp,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);
      navigate("/app");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  // Handle OAuth redirect token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/app");
    }
  }, []);

  return (
    <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-100 p-4">
      <motion.div className="flex flex-col md:flex-row w-full max-w-6xl rounded-3xl shadow-2xl bg-white overflow-hidden">
        {/* Left - Logo */}
        <motion.div className="md:w-1/2 w-full flex flex-col justify-center items-center p-10 bg-gradient-to-br from-sky-200 to-blue-300 text-center md:text-left">
          <motion.img
            src={breathSafeLogo}
            alt="Logo"
            className="w-44 mb-8 drop-shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.h1 className="text-5xl font-extrabold text-gray-800 mb-4">
            BreatheSafeAI
          </motion.h1>
          <motion.p className="text-lg text-gray-700 max-w-md">
            AI-powered respiratory safety and environmental health companion.
            Monitor air quality, predict risks, and help breathe better.
          </motion.p>
        </motion.div>

        {/* Right - Auth Form */}
        <motion.div className="md:w-1/2 w-full flex flex-col justify-center items-center p-10">
          <h2 className="text-3xl font-semibold text-gray-800 mb-3">
            {isLogin ? "Welcome Back 👋" : "Join BreatheSafeAI 🌿"}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {isLogin
              ? "Log in to continue monitoring your air and health insights."
              : "Create your account to personalize your health overview."}
          </p>

          {/* Toggle Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 rounded-full text-lg font-medium ${
                isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 rounded-full text-lg font-medium ${
                !isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Social Logins */}
          {!otpSent ? (
            <div className="flex flex-col space-y-3 mt-4 w-full max-w-md">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg rounded-xl font-medium hover:from-sky-500 hover:to-blue-600 transition-all"
              >
                Continue with Google
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSendOtp}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg rounded-xl font-medium hover:from-green-500 hover:to-green-600 transition-all"
              >
                Continue with Phone
              </motion.button>
            </div>
          ) : (
            <div className="w-full max-w-md mt-4 flex flex-col space-y-3">
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-green-500 text-white shadow-lg rounded-xl font-medium hover:bg-green-600 transition-all"
              >
                Verify OTP
              </button>
            </div>
          )}

          {/* Manual Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-5 mt-5"
          >
            {!isLogin && (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all"
            >
              {isLoading
                ? isLogin
                  ? "Logging in..."
                  : "Signing up..."
                : isLogin
                ? "Login"
                : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-gray-500 text-sm">
            © 2025 BreatheSafeAI — Breathe better, live smarter.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AuthLanding;
