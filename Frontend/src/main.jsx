import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Home from './Pages/Home/Home.jsx'
import Dashboard from './Pages/Dashboard/Dashboard.jsx'
import HealthInsights from './Pages/HealthInsights/HealthInsights.jsx'
import AirQuality from './Pages/AirQuality/AirQuality.jsx'

// const router = createBrowserRouter([
//   {
//     path:"/",
//     element:<App/>,
//     children:[
//       {
//         path:"",
//         element:<Home/>
//       },
//       {
//         path:"dashboard",
//         element:<Dashboard/>
//       },
//       {
//         path:"health-insights",
//         element:<HealthInsights/>
//       },
//       {
//         path:"air-quality",
//       }
//     ]
//   }
// ])

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="health-insights" element={<HealthInsights />} />
      <Route path="air-quality" element={<AirQuality/>} />
    </Route>
  )
)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
