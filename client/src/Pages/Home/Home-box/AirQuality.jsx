import React, { useState, useEffect } from "react";
import "./AirQuality.css";

function AirQuality() {
  const [localData, setLocalData] = useState({
    city: "Pune",
    temp: "Loading...",
    humidity: "Loading...",
    aqi: "Loading...",
    aqiCategory: "Loading..."
  });

  const [cityRankings, setCityRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cities to track with coordinates
  const cities = [
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Delhi", lat: 28.7041, lon: 77.1025 }
  ];

  // Function to determine AQI category based on US EPA standard
  const getAQICategory = (aqi) => {
    if (aqi <= 50) return { text: "Good", class: "good" };
    if (aqi <= 100) return { text: "Moderate", class: "moderate" };
    if (aqi <= 150) return { text: "Unhealthy for Sensitive Groups", class: "moderate" };
    if (aqi <= 200) return { text: "Unhealthy", class: "poor" };
    if (aqi <= 300) return { text: "Very Unhealthy", class: "poor" };
    return { text: "Hazardous", class: "poor" };
  };

  // Fetch weather data from Open-Meteo
  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`
      );
      const data = await response.json();
      
      return {
        temp: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return { temp: "N/A", humidity: "N/A" };
    }
  };

  // Fetch AQI data from Open-Meteo Air Quality API
  const fetchAQIData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,us_aqi&hourly=us_aqi&forecast_days=1`
      );
      const data = await response.json();
      
      // Get current hour index for more accurate data
      const currentHourIndex = new Date().getHours();
      const hourlyIndex = currentHourIndex < data.hourly?.time?.length ? currentHourIndex : 0;
      
      // Use current data or fall back to hourly data
      const usAqi =  
                    data.hourly?.us_aqi?.[hourlyIndex] ?? 
                    data.hourly?.us_aqi?.slice(-1)[0];
      
      return {
        aqi: usAqi || 0,
        pm25: data.current?.pm2_5 || 0,
        pm10: data.current?.pm10 || 0
      };
    } catch (error) {
      console.error("Error fetching AQI data:", error);
      return { aqi: 0, pm25: 0, pm10: 0 };
    }
  };

  // Fetch complete data for a city
  const fetchCityData = async (city) => {
    try {
      const [weatherData, aqiData] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAQIData(city.lat, city.lon)
      ]);

      const category = getAQICategory(aqiData.aqi);

      return {
        city: city.name,
        temp: weatherData.temp,
        humidity: weatherData.humidity,
        aqi: Math.round(aqiData.aqi),
        aqiCategory: category,
        pm25: aqiData.pm25,
        pm10: aqiData.pm10
      };
    } catch (error) {
      console.error(`Error fetching data for ${city.name}:`, error);
      return null;
    }
  };

  // Fetch data for all cities
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      try {
        // Fetch data for all cities in parallel
        const allCitiesData = await Promise.all(
          cities.map(city => fetchCityData(city))
        );

        // Filter out failed requests
        const validCities = allCitiesData.filter(city => city !== null);

        // Set Pune data as local city
        const puneData = validCities.find(city => city.city === "Pune");
        if (puneData) {
          setLocalData(puneData);
        }

        // Sort cities by AQI (lowest first) for rankings
        const sortedCities = [...validCities].sort((a, b) => a.aqi - b.aqi);
        setCityRankings(sortedCities);

      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Refresh data every 30 minutes
    const interval = setInterval(fetchAllData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get health message based on AQI
  const getAQIMessage = (aqi) => {
    if (aqi <= 50) return "Air quality is safe today — a great day to go outside! 🌿";
    if (aqi <= 100) return "Air quality is acceptable for most people. 🌤️";
    if (aqi <= 150) return "Sensitive groups should consider limiting prolonged outdoor activities. ⚠️";
    if (aqi <= 200) return "Everyone should limit prolonged outdoor exertion. 😷";
    if (aqi <= 300) return "Health alert: Everyone may experience serious health effects. 🚨";
    return "Health warning: Emergency conditions. Avoid outdoor activities. ⛔";
  };

  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

  if (loading) {
    return (
      <section className="air-quality-section">
        <div className="loading">Loading real-time data...</div>
      </section>
    );
  }

  return (
    <section className="air-quality-section">
      <div className="local-aqi">
        <h3>🌤️ {localData.city}, India</h3>
        <div className="local-aqi-info">
          <div className="stat">
            <span className="label">Temperature:</span>
            <span className="value">{localData.temp}°C</span>
          </div>
          <div className="stat">
            <span className="label">Humidity:</span>
            <span className="value">{localData.humidity}%</span>
          </div>
          <div className="stat">
            <span className="label">AQI:</span>
            <span className={`value ${localData.aqiCategory.class}`}>
              {localData.aqi} ({localData.aqiCategory.text})
            </span>
          </div>
        </div>
        <p className="aqi-note">{getAQIMessage(localData.aqi)}</p>
      </div>

      <div className="city-rankings">
        <h3>🌏 Top Cleanest Cities Today</h3>
        <ul>
          {cityRankings.map((city, index) => (
            <li key={city.city}>
              <span>{numberEmojis[index]} {city.city}</span> — AQI {city.aqi}{" "}
              <span className={city.aqiCategory.class}>
                ({city.aqiCategory.text})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AirQuality;
