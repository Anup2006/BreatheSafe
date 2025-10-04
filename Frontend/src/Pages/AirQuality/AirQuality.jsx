import React from "react";
import "./AirQuality.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  MapPin,
  Bell,
  Calendar,
  Wind,
  Eye,
  Sun,
} from "lucide-react";

export default function AirQualityFlow() {
  const currentAQI = 87;
  const location = "New Delhi, India";

  const hourlyForecast = [
    { time: "6AM", aqi: 92 },
    { time: "9AM", aqi: 87 },
    { time: "12PM", aqi: 78 },
    { time: "3PM", aqi: 82 },
    { time: "6PM", aqi: 95 },
    { time: "9PM", aqi: 103 },
    { time: "12AM", aqi: 98 },
  ];

  const weeklyForecast = [
    { day: "Today", aqi: 87, condition: "Moderate", color: "#FFB800" },
    { day: "Tomorrow", aqi: 72, condition: "Moderate", color: "#FFB800" },
    { day: "Wednesday", aqi: 58, condition: "Moderate", color: "#FFB800" },
    { day: "Thursday", aqi: 45, condition: "Good", color: "#00C851" },
    { day: "Friday", aqi: 52, condition: "Moderate", color: "#FFB800" },
  ];

  const pollutants = [
    { name: "PM2.5", current: 35, safe: 25, unit: "μg/m³", status: "Moderate", color: "#FFB800" },
    { name: "PM10", current: 72, safe: 50, unit: "μg/m³", status: "Moderate", color: "#FFB800" },
    { name: "NO₂", current: 28, safe: 40, unit: "ppb", status: "Good", color: "#00C851" },
  ];

  const recommendations = [
    { title: "Best Time for Outdoor Activities", time: "10 AM - 2 PM", description: "AQI will be lowest during midday hours" },
    { title: "Recommended Action", time: "Now", description: "Limit prolonged outdoor exertion" },
    { title: "Tonight's Forecast", time: "6 PM - 12 AM", description: "Air quality will worsen. Consider indoor activities." },
  ];

  return (
    <div className="airquality-container">
        <header className="header-airquality">
          <h1>Air Quality Monitoring</h1>
          <div className="location">
            <MapPin size={16} />
            <span>{location}</span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </header>
      <section className="aqi-card">
        <h2 className="aqi-value">AQI {currentAQI}</h2>
        <span className="aqi-status moderate">Moderate</span>
        <p>Air quality is acceptable for most people.</p>
        <div className="buttons">
          <button className="btn primary">
            <Bell size={14} /> Set Alert
          </button>
          <button className="btn outline">
            <MapPin size={14} /> Change Location
          </button>
        </div>
      </section>

      <section className="recommendations">
        <div className="section-header">
          <Sun size={18} />
          <h3>Today's Recommendations</h3>
        </div>
        <div className="recommendation-list">
          {recommendations.map((rec, i) => (
            <div className="recommendation-card" key={i}>
              <div className="recommendation-header">
                <h4>{rec.title}</h4>
                <span className="time-badge">{rec.time}</span>
              </div>
              <p>{rec.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="charts">
        <div className="chart-card">
          <div className="section-header">
            <Calendar size={18} />
            <h3>24-Hour Forecast</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyForecast}>
              <XAxis dataKey="time" />
              <YAxis />
              <Area type="monotone" dataKey="aqi" stroke="#2EC4B6" fill="#2EC4B6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="section-header">
            <Wind size={18} />
            <h3>Weekly Forecast</h3>
          </div>
          {weeklyForecast.map((day, i) => (
            <div className="weekly-row" key={i}>
              <div className="day">
                <span className="color-dot" style={{ backgroundColor: day.color }}></span>
                {day.day}
              </div>
              <div className="info">
                <span className="condition">{day.condition}</span>
                <strong>AQI {day.aqi}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pollutants">
        <div className="section-header">
          <Eye size={18} />
          <h3>Pollutant Breakdown</h3>
        </div>
        <div className="pollutant-grid">
          {pollutants.map((p, i) => (
            <div className="pollutant-card" key={i}>
              <div className="pollutant-header">
                <h4>{p.name}</h4>
                <span className={`pollutant-badge ${p.status.toLowerCase()}`}>{p.status}</span>
              </div>
              <div className="pollutant-details">
                <p>
                  Current: {p.current} {p.unit}
                </p>
                <p>
                  Safe: ≤{p.safe} {p.unit}
                </p>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${(p.current / (p.safe * 2)) * 100}%`, backgroundColor: p.color }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
