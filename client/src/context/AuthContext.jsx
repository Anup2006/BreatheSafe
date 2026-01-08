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
        const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");

      if (urlToken) {
        localStorage.setItem("token", urlToken);
        // window.history.replaceState({}, document.title, window.location.pathname);
      }

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

  const updateUserProfile = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token");

    try {
      const res = await fetch(`${BACKEND_URL}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      // 🔥 Update global user state
      setUser(data.user);

      return data.user;
    } catch (err) {
      console.error("Update profile failed:", err);
      throw err;
    }
  };


  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout,updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);