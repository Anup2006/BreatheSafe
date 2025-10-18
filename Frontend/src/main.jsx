// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import Home from './Pages/Home/Home.jsx';
import Dashboard from './Pages/Dashboard/Dashboard.jsx';
import HealthInsights from './Pages/HealthInsights/HealthInsights.jsx';
import AirQuality from './Pages/AirQuality/AirQuality.jsx';
import AuthLanding from './Pages/AuthLanding/AuthLanding.jsx'; 

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Auth Route */}
      <Route path="/" element={<AuthLanding />} />

      {/* Protected / Main App Layout */}
      <Route path="/app" element={<App />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="health-insights" element={<HealthInsights />} />
        <Route path="air-quality" element={<AirQuality />} />
      </Route>

    </>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
