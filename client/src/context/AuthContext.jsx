// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const base_uri = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
// Fixed: Ensure no double slashes by cleaning the base_uri
const BACKEND_URL = `${base_uri.replace(/\/$/, "")}/api/users`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // src/context/AuthContext.jsx
// Update the initAuth function inside the useEffect
const initAuth = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const userData = await res.json();
      // Ensure we are setting the full user object including city/state
      setUser(userData); 
      console.log("✅ Auth Sync Success:", userData); // Check your console for this!
    } else {
      localStorage.removeItem("token");
    }
  } catch (err) {
    console.error("Auth init failed:", err);
  } finally {
    setLoading(false);
  }
};

    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);