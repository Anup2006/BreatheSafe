import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import "./Dashboard.css";
import { color } from "chart.js/helpers";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

export default function Dashboard({ user }) {
  const currentAQI = 87;

  // Air Components (Bar Chart)
  const airComponentData = {
    labels: ["PM2.5", "PM10", "NO₂", "O₃", "CO"],
    datasets: [
      {
        label: "Value",
        data: [35, 72, 28, 40, 0.8],
        backgroundColor: "#2EC4B6",
        borderRadius: 6,
      },
    ],
  };

  // Risk Factors (Pie Chart)
  const riskFactorData = {
    labels: [
      "PM2.5 exposure",
      "PM10 particles",
      "NO₂ emissions",
      "O₃ ozone",
      "Other factors",
    ],
    datasets: [
      {
        data: [40, 25, 15, 10, 10],
        backgroundColor: [
          "#FF8C00",
          "#FF4444",
          "#8B5CF6",
          "#06B6D4",
          "#10B981",
        ],
      },
    ],
  };

  
    const airQualityData = [
    { name: "PM2.5", value: 35, unit: "μg/m³" },
    { name: "PM10", value: 72, unit: "μg/m³" },
    { name: "NO₂", value: 28, unit: "ppb" },
    { name: "O₃", value: 40, unit: "ppb" },
    { name: "CO", value: 0.8, unit: "ppm" },
    ];

  // Weekly Trend (Line + Area)
  const weeklyTrendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Air Quality Index",
        data: [45, 52, 48, 67, 87, 72, 58],
        borderColor: "#2EC4B6",
        backgroundColor: "rgba(46, 196, 182, 0.3)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Health Risk Level",
        data: [20, 30, 25, 45, 65, 50, 35],
        borderColor: "#FF6B6B",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#FF6B6B",
      },
    ],
  };

  

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header1">
        <h1>Welcome back, {user?.name || "User"}!</h1>
        <p>Here's your personalized air quality and health overview for today.</p>
      </div>

      {/* AQI Overview */}
      <div className="aqi-overview">
        <span> <i className="fas fa-cloud cloud-icon" style={{color: "#87CEFA"}}></i> Air Quality Overview</span>
        <div className="aqi-value">AQI: {currentAQI}</div>
        <span className="badge">Unhealthy</span>
        <div className="aqi-bar">
          <div
            className="aqi-fill"
            style={{ width: `${(currentAQI / 300) * 100}%` }}
          ></div>
        </div>
        <div className="aqi-labels">
          <span>0</span>
          <span className="good">Good</span>
          <span className="moderate">Moderate</span>
          <span className="poor">Poor</span>
          <span className="severe">Severe</span>
          <span>300</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Bar Chart */}
        <div className="chart-card">
          <h2>Current Air Components</h2>
          <Bar data={airComponentData} options={{ responsive: true }} />
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h2>Asthma Risk Factors in India</h2>
          <Pie data={riskFactorData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="card">
        {/* Card Header */}
        <div className="card-header">
            <div className="header-content">
                <h4 className="card-title"><i class="fa-slab-press fa-regular fa-eye" style={{color:"#87CEFA"}}></i> Detailed Measurements</h4>
            </div>
        </div>

        {/* Card Content */}
        <div className="card-content">
            <div className="grid">
                {airQualityData.map((item, index) => (
                    <div key={index} className="grid-item">
                        <div className="value">{item.value}</div>
                        <div className="unit">{item.unit}</div>
                        <div className="name">{item.name}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>      

      {/* Weekly Trend */}
      <div className="chart-card">
        <h2><i className="fa-solid fa-wind" style={{color:"#87CEFA"}}></i> 7-Day Air Quality Trend</h2>
        <Line data={weeklyTrendData} options={{ responsive: true }} />
        <div className="legend">
          <div><span className="dot aq"></span> Air Quality Index</div>
          <div><span className="dot risk"></span> Health Risk Level</div>
        </div>
      </div>
    </div>
  );
}
