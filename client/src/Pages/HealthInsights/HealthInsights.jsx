import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Sun,
  MapPin,
  Wind,
  Zap,
  Heart,
  MessageSquare,
  AlertTriangle,
  Cloud,
} from "lucide-react";
import { toast } from "react-toastify";
import "./HealthInsights.css";

const HealthInsights = () => {
  const [location, setLocation] = useState({
    name: "Pune",
    lat: 18.5214,
    lon: 73.8545,
  });
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [inputValue, setInputValue] = useState("Pune");
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Fetch real-time AQI data (dynamic for both search & geolocation)
  const fetchAQI = async (isFromGeo = false) => {
    try {
      setLoading(true);
      setError(null);

      let lat = location.lat;
      let lon = location.lon;
      let cityName = location.name;

      // 📍 If user typed a city (not using geolocation)
      if (!isFromGeo && inputValue.trim()) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            inputValue
          )}&count=1&language=en&format=json`
        );

        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          throw new Error("City not found. Please check spelling.");
        }

        const { latitude, longitude, name } = geoData.results[0];
        lat = latitude;
        lon = longitude;
        cityName = name;
      }

      // 🌫️ Fetch AQI for resolved coordinates
      const res = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi`
      );

      const data = await res.json();

      const currentData =
        data?.current ??
        (data?.hourly && {
          pm2_5: data.hourly.pm2_5?.slice(-1)[0],
          pm10: data.hourly.pm10?.slice(-1)[0],
          nitrogen_dioxide: data.hourly.nitrogen_dioxide?.slice(-1)[0],
          ozone: data.hourly.ozone?.slice(-1)[0],
          carbon_monoxide: data.hourly.carbon_monoxide?.slice(-1)[0],
          sulphur_dioxide: data.hourly.sulphur_dioxide?.slice(-1)[0],
          european_aqi: data.hourly.european_aqi?.slice(-1)[0],
        });

      if (!currentData) throw new Error("No AQI data available for this city.");

      setAqiData(currentData);
      setLocation({ name: cityName, lat, lon });
      setHasData(true);
      toast.success(`AQI data loaded for ${cityName}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error fetching AQI data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAQI(); // loads Pune by default
  }, []);

  // ✅ Detect user location
  const detectUserLocation = async () => {
    setGeoLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) throw new Error("Failed to reverse geocode");

      const data = await response.json();
      const locationName =
        data.address?.city ||
        data.address?.town ||
        data.name ||
        "Current Location";

      setLocation({ name: locationName, lat: latitude, lon: longitude });
      setInputValue(locationName);
      setError(null);
      toast.success(`📍 Location detected: ${locationName}`, {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => fetchAQI(true), 500);
    } catch (err) {
      const errorMsg =
        err.code === 1
          ? "Location permission denied. Please enable location access."
          : err.code === 3
          ? "Location detection timed out. Please try again."
          : err.message || "Failed to detect location";

      toast.error(errorMsg, { position: "top-right", autoClose: 5000 });
    } finally {
      setGeoLoading(false);
    }
  };

  // ✅ Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      toast.info("Searching for AQI data...", {
        position: "top-right",
        autoClose: 1000,
      });
      fetchAQI();
    }
  };

  // 💡 Different action plans based on AQI
  const getAdvice = (status) => {
    switch (status) {
      case "Good":
        return [
          { icon: Sun, text: "Enjoy outdoor activities freely today." },
          { icon: Heart, text: "Maintain hydration and regular exercise." },
          { icon: Wind, text: "Keep windows open for fresh airflow." },
          { icon: Zap, text: "Plan outdoor workouts or picnics." },
          { icon: MessageSquare, text: "Share the good air day with friends!" },
        ];

      case "Moderate":
        return [
          { icon: Cloud, text: "Sensitive groups should reduce exposure." },
          { icon: Heart, text: "Keep medications nearby just in case." },
          {
            icon: Wind,
            text: "Use air purifiers in the evening if necessary.",
          },
          { icon: ShieldAlert, text: "Avoid staying near high-traffic roads." },
          { icon: Zap, text: "Plan indoor workouts during peak hours." },
        ];

      case "Poor":
        return [
          { icon: ShieldAlert, text: "Limit outdoor activity, wear a mask." },
          { icon: Wind, text: "Run air purifiers indoors." },
          { icon: Heart, text: "Stay hydrated and avoid outdoor exercise." },
          { icon: AlertTriangle, text: "Close windows during traffic hours." },
          { icon: MessageSquare, text: "Monitor children or elderly closely." },
          { icon: Zap, text: "Avoid burning candles or incense indoors." },
        ];

      case "Very Poor":
        return [
          { icon: AlertTriangle, text: "Stay indoors as much as possible." },
          { icon: MessageSquare, text: "Inform family about air conditions." },
          { icon: Zap, text: "Avoid exercise near roads or factories." },
          { icon: Wind, text: "Use HEPA filters and keep them clean." },
          { icon: ShieldAlert, text: "Avoid cooking with strong fumes." },
          { icon: Heart, text: "Use steam inhalation to ease breathing." },
          { icon: MapPin, text: "Track air quality before stepping outside." },
        ];

      case "Hazardous":
        return [
          { icon: ShieldAlert, text: "Stay indoors with windows sealed." },
          { icon: Wind, text: "Use air purifiers continuously." },
          { icon: Heart, text: "Keep asthma or allergy medication ready." },
          { icon: MessageSquare, text: "Alert family or caregivers." },
          { icon: AlertTriangle, text: "Avoid all outdoor exposure." },
          {
            icon: Cloud,
            text: "Use N95 masks if stepping out is unavoidable.",
          },
          { icon: Zap, text: "Avoid cooking that produces smoke or fumes." },
          { icon: MapPin, text: "Relocate temporarily if high AQI persists." },
        ];

      default:
        return [];
    }
  };

  // 🌫️ AQI Quality & Conditional Colors
  const getAQIStatusColor = (aqi) => {
    if (aqi <= 50) return { label: "Good", color: "green" };
    if (aqi <= 100) return { label: "Moderate", color: "yellow" };
    if (aqi <= 200) return { label: "Poor", color: "orange" };
    if (aqi <= 300) return { label: "Very Poor", color: "red" };
    return { label: "Hazardous", color: "purple" };
  };

  if (loading) {
    return (
      <div className="insight-container flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Fetching real-time air quality data...
      </div>
    );
  }

  if (!aqiData) {
    return (
      <div className="insight-container text-center text-red-500">
        Failed to load AQI data.
      </div>
    );
  }
  const { label, color } = getAQIStatusColor(aqiData.european_aqi);
  const advice = getAdvice(label);

  return (
    <div className="insight-container">
      <header className="insight-header">
        <h1 className="insight-title">Personalized Health Insights</h1>
        <p className="insight-subtitle">
          Early Warning System for Asthma Risk Reduction
        </p>
      </header>

      {/* LOCATION & TIME SELECTION */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-map-marker-alt"></i> Location Selection
          </h3>
        </div>

        <div className="card-content ">
          <div className="form-section">
            <div className="location-header mt-0">
              <button
                className="geo-btn"
                onClick={detectUserLocation}
                disabled={geoLoading}
                title="Detect your location automatically"
              >
                <i
                  className={`fas ${
                    geoLoading ? "fa-spinner" : "fa-location-dot"
                  }`}
                ></i>
                {geoLoading ? "Detecting..." : "My Location"}
              </button>
            </div>

            <div className="search-box">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city name (e.g., Berlin, Tokyo, Mumbai)"
                disabled={loading}
              />
              <button
                onClick={() => fetchAQI()}
                disabled={loading || !inputValue.trim()}
              >
                <i
                  className={`fas ${
                    loading ? "fa-spinner fa-spin" : "fa-search"
                  }`}
                ></i>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {hasData && (
              <p className="location-info">
                ✓ <strong>{location.name}</strong> • Lat:{" "}
                {location.lat.toFixed(3)}° • Lon: {location.lon.toFixed(3)}°
              </p>
            )}

            {error && <p className="location-error">⚠️ {error}</p>}
          </div>
        </div>
      </div>

      <div
        className={`alert-section border bg-${color}-100 border-${color}-500`}
      >
        <div className="alert-header">
          <AlertTriangle className={`alert-icon text-${color}-600`} />
          <h2 className="alert-title">AIR QUALITY : {label.toUpperCase()} </h2>
        </div>
        <p className="alert-aqi">
          AQI Level: <strong>{aqiData.european_aqi}</strong> ({label})
        </p>

        <div className="alert-details-grid">
          <div className="alert-detail-item">
            <p className="detail-label">Key Pollutants:</p>
            <p className="detail-value-pollutant">
              PM2.5:{" "}
              <span className="font-bold">
                {aqiData.pm2_5?.toFixed(1)} µg/m³
              </span>{" "}
              | NO₂: {aqiData.nitrogen_dioxide?.toFixed(1)} ppb
            </p>
          </div>
          <div className="alert-detail-item">
            <p className="detail-label">O₃ & CO Levels:</p>
            <p className="detail-value-pollutant">
              O₃: {aqiData.ozone?.toFixed(1)} µg/m³ | CO:{" "}
              {aqiData.carbon_monoxide?.toFixed(1)} µg/m³
            </p>
          </div>
          <div className="alert-detail-item">
            <p className="detail-label">Location:</p>
            <p className="detail-value location-text">
              <MapPin className="map-icon" />
              {location ? location.name : "Pune, India"}
            </p>
          </div>
        </div>
        <p className="alert-forecast">
          ⚠️ Conditions may change with weather fluctuations. Stay updated.
        </p>
      </div>

      {/* --- Action Plan --- */}
      <div className="insight-card-section">
        <h3 className="card-heading">Immediate Action Plan</h3>
        <div className="action-plan-grid">
          {advice.map((item, index) => (
            <div key={index} className="insight-card action-card">
              <div className="action-icon-wrapper">
                <item.icon className="action-icon" />
              </div>
              <p className="action-text">{item.text.split(".")[0]}</p>
              <p className="action-subtext">{item.text.split(".")[1] || ""}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Historical Trends Placeholder --- */}
      <div className="insight-card chart-placeholder-card">
        <h3 className="card-heading">Your Recent Exposure & Response</h3>
        <p className="text-gray-600 mb-4">
          This section would feature charts comparing personalized air quality
          exposure to recorded symptom days.
        </p>
        <div className="chart-placeholder">
          [Placeholder for detailed Chart showing PM2.5/NO₂ vs. Symptom Logs]
        </div>
      </div>
    </div>
  );
};

export default HealthInsights;
