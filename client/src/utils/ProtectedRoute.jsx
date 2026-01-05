import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation(); // Needed to check the current path

  // 1. Wait until auth initializes
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  // 2. If no user exists, redirect to login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. If user exists but profile is incomplete, force them to setup
  // We check location.pathname to prevent a "redirect loop"
  if (!user.isProfileComplete && location.pathname !== "/app/complete-profile") {
    return <Navigate to="/app/complete-profile" replace />;
  }

  // 4. If user is complete and tries to go back to setup, send to dashboard
  if (user.isProfileComplete && location.pathname === "/app/complete-profile") {
    return <Navigate to="/app/dashboard" replace />;
  }

  // User is authenticated and profile is ready, render child routes
  return <Outlet />;
}