import React, { useState } from "react";
import "./AuthLanding.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AuthLanding = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(isLogin ? "Logging in..." : "Signing up...", formData);

    // ✅ Save the user's name in localStorage
    // For login, we’ll just use email prefix as fallback
    const userName = isLogin
      ? formData.email.split("@")[0]
      : formData.name || formData.email.split("@")[0];

    localStorage.setItem("userName", userName);

    // Redirect to the main app
    navigate("/app");
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="auth-title">
          {isLogin ? "Welcome back!" : "Join BreatheSafeAI 🌿"}
        </h2>
        <p className="auth-subtext">
          {isLogin
            ? "Log in to continue monitoring your air and health insights."
            : "Create your account to personalize your air quality and health overview."}
        </p>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
        </div>

        <p className="auth-footer">
          © 2025 BreatheSafeAI — Breathe better, live smarter.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthLanding;
