import React, { useState, useEffect } from "react";
import "./AirQuality.css";

function AirQuality() {
  const [localData, setLocalData] = useState({
    city: "Pune",
    temp: "—",
    humidity: "—",
    aqi: "—",
    aqiCategory: { text: "Loading...", class: "loading" }
  });

  const [cityRankings, setCityRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const cities = [
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Delhi", lat: 28.7041, lon: 77.1025 }
  ];

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return { text: "Good", class: "good" };
    if (aqi <= 100) return { text: "Moderate", class: "moderate" };
    if (aqi <= 150) return { text: "Sensitive", class: "sensitive" };
    if (aqi <= 200) return { text: "Unhealthy", class: "poor" };
    return { text: "Hazardous", class: "vpoor" };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const allData = await Promise.all(cities.map(async (city) => {
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
        const wData = await wRes.json();
        const aRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi`);
        const aData = await aRes.json();
        
        return {
          city: city.name,
          temp: Math.round(wData.current.temperature_2m),
          humidity: wData.current.relative_humidity_2m,
          aqi: Math.round(aData.current.us_aqi),
          aqiCategory: getAQICategory(aData.current.us_aqi)
        };
      }));

      const pune = allData.find(c => c.city === "Pune");
      if (pune) setLocalData(pune);
      setCityRankings([...allData].sort((a, b) => a.aqi - b.aqi));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="aq-loader">Fetching Live Environment Data...</div>;

  return (
    <div className="aq-wrapper">
      {/* LOCAL WEATHER CARD */}
      <div className="aq-main-card">
        <div className="aq-card-header">
          <i className="fa-solid fa-location-dot"></i>
          <h2>{localData.city}, India</h2>
        </div>
        
        <div className="aq-stats-grid">
          <div className="aq-stat-box">
            <i className="fa-solid fa-temperature-half"></i>
            <div>
              <span className="aq-label">Temperature</span>
              <span className="aq-value">{localData.temp}°C</span>
            </div>
          </div>
          <div className="aq-stat-box">
            <i className="fa-solid fa-droplet"></i>
            <div>
              <span className="aq-label">Humidity</span>
              <span className="aq-value">{localData.humidity}%</span>
            </div>
          </div>
          <div className="aq-stat-box">
            <i className="fa-solid fa-wind"></i>
            <div>
              <span className="aq-label">Air Quality Index</span>
              <span className={`aq-value ${localData.aqiCategory.class}`}>{localData.aqi}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CITY RANKINGS LIST */}
      <div className="aq-ranking-card">
        <div className="aq-card-header">
          <i className="fa-solid fa-ranking-star"></i>
          <h2>Top Cleanest Cities Today</h2>
        </div>
        
        <div className="aq-list">
          {cityRankings.map((city, index) => (

            <div className="aq-list-item" key={city.city}>
              <div className="aq-item-left">
                <span className="aq-rank-badge">{index + 1}</span>
                <span className="aq-city-name">{city.city}</span>
              </div>
              <div className="aq-item-right">
                <span className="aq-value-small">AQI {city.aqi}</span>
                <i className="fa-solid fa-arrow-right aq-arrow"></i>
                <span className={`aq-status-tag ${city.aqiCategory.class}`}>
                  {city.aqiCategory.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AirQuality;