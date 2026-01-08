import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LanguageProvider } from "./context/LanguageContext.jsx";

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
import HealthAssessment from "./Pages/HealthAssessment/HealthAssessment.jsx";
import HealthReportDetail from "./Pages/HealthReportDetail/HealthReportDetail.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import AuthPage from "./Pages/AuthLanding/AuthPage.jsx";
// 1. Import the new CompleteProfile component
import CompleteProfile from "./Pages/AuthLanding/CompleteProfile.jsx"; 
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuthInit } from "./hooks/useAuthInit.js";
import DiseaseInfoPage from "./Pages/DiseaseInfo/DiseaseInfo.jsx";
import ErrorPage from "./Pages/ErrorPage/ErrorPage.jsx";
import ClimateShowcase from "./ClimateShowcase/ClimateShowcase.jsx";
import AirLab from "./Pages/Simulation/AirLab.jsx";
import ProfilePage from "./Pages/App/ProfilePage.jsx";  
// Wrapper to initialize OAuth token detection
function AppWrapper() {
  useAuthInit();
  return <App />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/ClimateModal" element={<ClimateShowcase />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/Diseases-info" element={<DiseaseInfoPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* 2. Add the Complete Profile route here */}
        <Route path="/app/complete-profile" element={<CompleteProfile />} />
        
        <Route path="/app" element={<AppWrapper />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="health-insights" element={<HealthInsights />} />
          <Route path="air-quality" element={<AirQuality />} />
          <Route path="health-assessment" element={<HealthAssessment />} />
          <Route path="health-report" element={<HealthReportDetail />} />
          <Route path="health-report/:id" element={<HealthReportDetail />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="/airLab" element={<AirLab />} />
      {/* 404 Page */}
      <Route path="*" element={<ErrorPage />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer position="top-right" autoClose={3000} theme="light" />
    <AuthProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>
);


