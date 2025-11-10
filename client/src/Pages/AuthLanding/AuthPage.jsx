import AuthForm from "./AuthForm";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import TranslateWidget from "../../Components/widget/TranslateWidget";

export default function AuthPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/app/health-assessment", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = (token, userData) => {
    login(token, userData);
    toast.success("Welcome to BreatheSafeAI!");
    navigate("/app/health-assessment");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <TranslateWidget />
      </div>

      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  );
}
