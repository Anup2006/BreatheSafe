import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait until auth initializes
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-600">
        Loading...
      </div>
    );

  // If no user after loading, redirect to login
  if (!user) return <Navigate to="/auth" replace />;

  // User is authenticated, render child routes
  return <Outlet />;
}
