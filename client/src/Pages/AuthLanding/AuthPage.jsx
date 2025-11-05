import AuthForm from "./AuthForm";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  );
}
