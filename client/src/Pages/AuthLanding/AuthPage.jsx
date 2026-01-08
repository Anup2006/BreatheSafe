// src/Pages/AuthLanding/AuthPage.jsx
import AuthForm from "./AuthForm";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import TranslateWidget from "../../Components/widget/TranslateWidget";

export default function AuthPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.isProfileComplete) {
        navigate("/app/dashboard", { replace: true });
      } else {
        navigate("/app/complete-profile", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = (token, userData) => {
    login(token, userData);
    toast.success("Welcome back!");
    
    if (userData.isProfileComplete) {
      navigate("/app/dashboard");
    } else {
      navigate("/app/complete-profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-blue-600">
        <div className="animate-pulse">Loading BreatheSafeAI...</div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <TranslateWidget />
      </div>

      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  );
}