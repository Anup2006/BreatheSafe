import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Smartphone } from "lucide-react";
import { toast } from "sonner";
import GoogleButton from "./GoggleButton";
import PhoneButton from "./PhoneButton";
import OtpForm from "./OtpForm";
import PhoneOtpModal from "./PhoneOtpModal";
import breathSafeLogo from "/src/assets/lungsLogo.png";
import useAuthApi from "../../hooks/useAuthApi";

export default function AuthForm({ onSuccess }) {
  const [activeTab, setActiveTab] = useState("login");
  const [loginMethod, setLoginMethod] = useState("email");
  const { loginUser, signupUser, loading, error } = useAuthApi();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // UI state
  // const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [phoneOtpOpen, setPhoneOtpOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const identifier = loginMethod === "email" ? loginEmail : loginPhone;
    const fieldName = loginMethod === "email" ? "email" : "phone";
    if (!identifier || !loginPassword) {
      toast.error(`Please enter your ${fieldName} and password`);
      return;
    }

    try {
      const data = await loginUser({
        email: loginEmail,
        phone: "+91" + loginPhone,
        password: loginPassword,
      });

      if (data.token && data.user) {
        toast.success("Login successful!");
        onSuccess(data.token, data.user);
      } else {
        // no token means verification needed
        toast.info("Please verify your account using the OTP sent.");
        if (loginMethod === "email") {
          setPendingEmail(loginEmail);
          setShowOtpForm(true);
        } else {
          setPhoneOtpOpen(true);
        }
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword)
      return toast.error("Please fill all fields");

    try {
      const data = await signupUser({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      if (data.email) {
        setPendingEmail(signupEmail);
        setShowOtpForm(true);
        toast.info(data.message || "Please verify your email to continue");
        return;
      }

      // Fallback (shouldn't normally reach here)
      toast.success("Signup successful!");
    } catch (err) {
      console.error("Signup failed:", err);
      if (err.message.includes("login")) {
        toast.error("This email is already registered. Please log in instead.");
        setActiveTab("login");
      } else {
        toast.error(err.message || "Signup failed. Please try again.");
      }
    }
  };

  const handleOtpVerified = (token) => {
    toast.success("Welcome to BreatheSafeAI!");
    onSuccess(token);
  };

  if (showOtpForm) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-6">
        <OtpForm
          email={pendingEmail}
          onVerified={handleOtpVerified}
          onBack={() => setShowOtpForm(false)}
          onSuccess={onSuccess}
        />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen w-full flex items-center justify-evenly bg-gradient-to-br from-blue-50 via-sky-200 to-cyan-400 px-4 py-6 sm:px-6 md:p-10"
      >
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
          <motion.div
            className="md:w-1/2 w-full flex justify-center items-center p-10 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-md  bg-white rounded-xl shadow-xl p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  BreatheSafeAI
                </h1>
                <p className="text-gray-500">
                  Your intelligent air quality companion
                </p>
              </div>

              {/* Tabs */}
              <div className="flex mb-6 rounded-lg overflow-hidden bg-gray-100">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-2 px-4 transition-all ${
                    activeTab === "login"
                      ? "bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 py-2 px-4 transition-all ${
                    activeTab === "signup"
                      ? "bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "login" && (
                  <motion.div
                    key="login-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <GoogleButton />
                    <PhoneButton
                      text="Continue with Phone"
                      onClick={() => setPhoneOtpOpen(true)}
                    />

                    <div className="relative my-6">
                      <hr />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500">
                        or
                      </span>
                    </div>

                    {/* Login Method Toggle */}
                    <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setLoginMethod("email")}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                          loginMethod === "email"
                            ? "bg-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Mail className="w-4 h-4 inline mr-2" /> Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod("phone")}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                          loginMethod === "phone"
                            ? "bg-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Phone className="w-4 h-4 inline mr-2" /> Phone
                      </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* Email or Phone */}
                      {loginMethod === "email" ? (
                        <div className="space-y-1">
                          <label
                            htmlFor="login-email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email
                          </label>
                          <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <input
                              id="login-email"
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="flex-1 ml-3 outline-none"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label
                            htmlFor="login-phone"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Phone
                          </label>
                          <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <input
                              id="login-phone"
                              type="tel"
                              value={loginPhone}
                              onChange={(e) => setLoginPhone(e.target.value)}
                              placeholder="+91 9876543210"
                              className="flex-1 ml-3 outline-none"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Password */}
                      <div className="space-y-1">
                        <label
                          htmlFor="login-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Password
                        </label>
                        <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <input
                            id="login-password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="flex-1 ml-3 outline-none"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white p-2 rounded-md disabled:opacity-50 transition-all"
                      >
                        {loading ? "Logging in..." : "Login"}
                      </button>
                    </form>

                    {/* <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setPhoneOtpOpen(true)}
                    className="text-blue-600 hover:underline inline-flex items-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" /> Login with Phone OTP
                  </button>
                </div> */}
                  </motion.div>
                )}

                {activeTab === "signup" && (
                  <motion.div
                    key="signup-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <GoogleButton text="Sign up with Google" />
                    <PhoneButton
                      text="Sign Up  with Phone"
                      onClick={() => setPhoneOtpOpen(true)}
                    />

                    <div className="relative my-6">
                      <hr />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500">
                        or
                      </span>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label
                          htmlFor="signup-name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>
                        <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                          <User className="w-5 h-5 text-gray-400" />
                          <input
                            id="signup-name"
                            type="text"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            placeholder="Your Name"
                            className="flex-1 ml-3 outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label
                          htmlFor="signup-email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <input
                            id="signup-email"
                            type="email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="flex-1 ml-3 outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <label
                          htmlFor="signup-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Password
                        </label>
                        <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <input
                            id="signup-password"
                            type="password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="••••••••"
                            className="flex-1 ml-3 outline-none"
                            required
                          />
                        </div>
                        <p className="text-gray-500 text-sm">
                          Minimum 6 characters
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white p-2 rounded-md disabled:opacity-50 transition-all"
                      >
                        {loading ? "Creating Account..." : "Sign Up"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <PhoneOtpModal
        open={phoneOtpOpen}
        onClose={() => setPhoneOtpOpen(false)}
        onSuccess={onSuccess}
        mode="login"
      />
    </>
  );
}
