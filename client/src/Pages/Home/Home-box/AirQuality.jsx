import React from "react";
import "./AirQuality.css";
function AirQuality() {
  return (
    <section className="air-quality-section">
      <div className="local-aqi">
        <h3>🌤️ Pune, India</h3>
        <div className="local-aqi-info">
          <div className="stat">
            <span className="label">Temperature:</span>
            <span className="value">29°C</span>
          </div>
          <div className="stat">
            <span className="label">Humidity:</span>
            <span className="value">62%</span>
          </div>
          <div className="stat">
            <span className="label">AQI:</span>
            <span className="value good">45 (Good)</span>
          </div>
        </div>
        <p className="aqi-note">
          Air quality is safe today — a great day to go outside! 🌿
        </p>
      </div>

      <div className="city-rankings">
        <h3>🌏 Top Cleanest Cities Today</h3>
        <ul>
          <li>
            <span>1️⃣ Bengaluru</span> — AQI 38{" "}
            <span className="good">(Good)</span>
          </li>
          <li>
            <span>2️⃣ Pune</span> — AQI 45 <span className="good">(Good)</span>
          </li>
          <li>
            <span>3️⃣ Hyderabad</span> — AQI 52{" "}
            <span className="moderate">(Moderate)</span>
          </li>
          <li>
            <span>4️⃣ Chennai</span> — AQI 64{" "}
            <span className="moderate">(Moderate)</span>
          </li>
          <li>
            <span>5️⃣ Delhi</span> — AQI 112{" "}
            <span className="poor">(Unhealthy)</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default AirQuality;
