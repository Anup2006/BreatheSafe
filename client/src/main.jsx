import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Home from "./Pages/Home/Home.jsx";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
import HealthInsights from "./Pages/HealthInsights/HealthInsights.jsx";
import AirQuality from "./Pages/AirQuality/AirQuality.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import AuthPage from "./Pages/AuthLanding/AuthPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuthInit } from "./hooks/useAuthInit.js"; // 👈 Import this hook

// Wrapper to initialize OAuth token detection
function AppWrapper() {
  useAuthInit();  
  return <App />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Optional: redirect root to /app */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* Public Auth Route */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Routes */}
<Route path="/app" element={<ProtectedRoute />}>
  <Route path="" element={<App />}>
    <Route index element={<Home />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="health-insights" element={<HealthInsights />} />
    <Route path="air-quality" element={<AirQuality />} />
  </Route>
</Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
