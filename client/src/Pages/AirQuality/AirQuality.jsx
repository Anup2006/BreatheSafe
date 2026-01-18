import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AirQuality.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MapPin, Bell, Calendar, Wind, Eye, Sun, Search } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import AQIQuizCTA from "../../Components/AQIQuizCTA";

export default function AirQualityFlow() {
  const { user } = useAuth();
  let userLocation = user?.city || "Pune, India";
  // State management
  const [currentAQI, setCurrentAQI] = useState(null);
  const [location, setLocation] = useState(userLocation);
  const [inputValue, setInputValue] = useState(userLocation);
  const [searchLocation, setSearchLocation] = useState(userLocation);
  const [lastSuccessfulLocation, setLastSuccessfulLocation] =
    useState(userLocation);

  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [pollutants, setPollutants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const debounceTimer = useRef(null);

  const navigate = useNavigate();

  // Function to get coordinates from location name
  const getCoordinates = async (locationName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      throw new Error(`Location "${locationName}" not found`);
    } catch (err) {
      throw new Error(err.message || "Failed to fetch coordinates");
    }
  };

  // Function to fetch AQI data
  const fetchAQIData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&forecast_days=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch AQI data");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error("Failed to fetch air quality data");
    }
  };

  // Get AQI status
  const getAQIStatus = (aqi) => {
    const aqiValue = aqi ?? 0;
    if (aqiValue <= 50)
      return {
        status: "Good",
        color: "#00C851",
        description: "Air quality is satisfactory",
      };
    if (aqiValue <= 100)
      return {
        status: "Moderate",
        color: "#FFB800",
        description: "Air quality is acceptable for most people",
      };
    if (aqiValue <= 150)
      return {
        status: "Unhealthy for Sensitive Groups",
        color: "#FF6B00",
        description: "Sensitive groups should limit outdoor activities",
      };
    if (aqiValue <= 200)
      return {
        status: "Unhealthy",
        color: "#FF4444",
        description: "Everyone should limit prolonged outdoor exertion",
      };
    if (aqiValue <= 300)
      return {
        status: "Very Unhealthy",
        color: "#9333EA",
        description: "Avoid outdoor activities",
      };
    return {
      status: "Hazardous",
      color: "#7C2D12",
      description: "Stay indoors",
    };
  };

  // Generate recommendations based on forecast
  // Generate recommendations based on forecast
  const generateRecommendations = (hourly, currentIdx) => {
    const recs = [];

    // 🕒 Find best time for outdoor activities (daytime only: 6 AM - 6 PM)
    let minAQI = Infinity;
    let bestHour = null;
    for (
      let i = currentIdx;
      i < Math.min(currentIdx + 24, hourly.us_aqi.length);
      i++
    ) {
      const hour = new Date(hourly.time[i]).getHours();
      if (hour >= 6 && hour <= 18) {
        // Daytime only
        if (hourly.us_aqi[i] < minAQI) {
          minAQI = hourly.us_aqi[i];
          bestHour = hour;
        }
      }
    }

    if (bestHour !== null) {
      const endHour = (bestHour + 2) % 24;
      const timeStr = `${bestHour}:00 - ${endHour}:00`;
      recs.push({
        title: "Best Time for Outdoor Activities",
        time: timeStr,
        description: `Air quality will be best around ${bestHour}:00 (AQI ${Math.round(
          minAQI
        )}).`,
      });
    } else {
      recs.push({
        title: "No Safe Outdoor Window",
        time: "Today",
        description:
          "Air quality is poor throughout the day. Avoid outdoor activities.",
      });
    }

    // 🧍‍♂️ Current recommendation
    const currentAQI = hourly.us_aqi[currentIdx] ?? 0;
    const status = getAQIStatus(currentAQI);
    recs.push({
      title: "Recommended Action",
      time: "Now",
      description: status.description,
    });

    // 🌙 Evening forecast (6 PM - 12 AM)
    const today = new Date().toISOString().split("T")[0];
    let eveningAQI = 0;
    let eveningCount = 0;
    hourly.time.forEach((time, i) => {
      const date = new Date(time);
      if (
        date.toISOString().split("T")[0] === today &&
        date.getHours() >= 18 &&
        date.getHours() <= 23
      ) {
        eveningAQI += hourly.us_aqi[i] ?? 0;
        eveningCount++;
      }
    });

    if (eveningCount > 0) {
      const avgEvening = eveningAQI / eveningCount;
      const eveningStatus = getAQIStatus(avgEvening);
      recs.push({
        title: "Tonight's Forecast",
        time: "6 PM - 12 AM",
        description: `Expected AQI: ${Math.round(avgEvening)} - ${
          eveningStatus.status
        }`,
      });
    }

    return recs;
  };

  // Process API data
  const processAQIData = (data) => {
    const hourly = data.hourly;
    const currentHourIndex = new Date().getHours();
    const currentIndex =
      currentHourIndex < hourly.time.length ? currentHourIndex : 0;

    // Set current AQI
    setCurrentAQI(hourly.us_aqi?.[currentIndex] ?? 0);

    // Process hourly forecast (next 24 hours, every 3 hours)
    const hourly24 = [];
    for (
      let i = currentIndex;
      i < Math.min(currentIndex + 24, hourly.time.length);
      i += 3
    ) {
      const date = new Date(hourly.time[i]);
      hourly24.push({
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        }),
        aqi: hourly.us_aqi?.[i] ?? 0,
      });
    }
    setHourlyForecast(hourly24);

    // Process 5-day forecast
    const forecast5Days = [];
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const processedDates = new Set();

    for (let i = 0; i < hourly.time.length; i++) {
      const dateTime = new Date(hourly.time[i]);
      const dateString = dateTime.toISOString().split("T")[0];

      if (!processedDates.has(dateString) && dateTime.getHours() === 12) {
        processedDates.add(dateString);

        const aqiValue = hourly.us_aqi?.[i] ?? 0;
        const status = getAQIStatus(aqiValue);

        const dayLabel =
          forecast5Days.length === 0
            ? "Today"
            : forecast5Days.length === 1
            ? "Tomorrow"
            : daysOfWeek[dateTime.getDay()];

        forecast5Days.push({
          day: dayLabel,
          aqi: aqiValue,
          condition: status.status,
          color: status.color,
        });

        if (forecast5Days.length >= 5) break;
      }
    }
    setWeeklyForecast(forecast5Days);

    // Process pollutants
    const safeLimits = {
      pm25: 25,
      pm10: 50,
      no2: 40,
      o3: 100,
      co: 9,
    };

    const pollutantData = [
      {
        name: "PM2.5",
        current: hourly.pm2_5?.[currentIndex] ?? 0,
        safe: safeLimits.pm25,
        unit: "μg/m³",
        status:
          (hourly.pm2_5?.[currentIndex] ?? 0) <= safeLimits.pm25
            ? "Good"
            : "Moderate",
        color:
          (hourly.pm2_5?.[currentIndex] ?? 0) <= safeLimits.pm25
            ? "#00C851"
            : "#FFB800",
      },
      {
        name: "PM10",
        current: hourly.pm10?.[currentIndex] ?? 0,
        safe: safeLimits.pm10,
        unit: "μg/m³",
        status:
          (hourly.pm10?.[currentIndex] ?? 0) <= safeLimits.pm10
            ? "Good"
            : "Moderate",
        color:
          (hourly.pm10?.[currentIndex] ?? 0) <= safeLimits.pm10
            ? "#00C851"
            : "#FFB800",
      },
      {
        name: "NO₂",
        current: hourly.nitrogen_dioxide?.[currentIndex] ?? 0,
        safe: safeLimits.no2,
        unit: "ppb",
        status:
          (hourly.nitrogen_dioxide?.[currentIndex] ?? 0) <= safeLimits.no2
            ? "Good"
            : "Moderate",
        color:
          (hourly.nitrogen_dioxide?.[currentIndex] ?? 0) <= safeLimits.no2
            ? "#00C851"
            : "#FFB800",
      },
      {
        name: "O₃",
        current: hourly.ozone?.[currentIndex] ?? 0,
        safe: safeLimits.o3,
        unit: "ppb",
        status:
          (hourly.ozone?.[currentIndex] ?? 0) <= safeLimits.o3
            ? "Good"
            : "Moderate",
        color:
          (hourly.ozone?.[currentIndex] ?? 0) <= safeLimits.o3
            ? "#00C851"
            : "#FFB800",
      },
    ];
    setPollutants(pollutantData);

    // Generate recommendations
    const recs = generateRecommendations(hourly, currentIndex);
    setRecommendations(recs);

    setLastUpdate(new Date());
    setHasData(true);
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (newValue.trim()) {
        setSearchLocation(newValue);
      }
    }, 1000);
  };

  // Handle search
  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchLocation(inputValue);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      handleSearch();
    }
  };

  // Fetch data when searchLocation changes
  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        if (!hasData) {
          setLoading(true);
        }

        const coords = await getCoordinates(searchLocation);
        const aqiData = await fetchAQIData(coords.lat, coords.lon);

        if (!ignore) {
          processAQIData(aqiData);
          setLocation(searchLocation);
          setLastSuccessfulLocation(searchLocation);
          setLoading(false);

          if (hasData) {
            toast.success(`Air quality data updated for ${searchLocation}`, {
              position: "top-right",
              autoClose: 3000,
            });
          }
        }
      } catch (err) {
        if (!ignore) {
          setLoading(false);

          toast.error(err.message || "Failed to fetch air quality data", {
            position: "top-right",
            autoClose: 5000,
          });

          if (hasData) {
            setInputValue(lastSuccessfulLocation);
            setSearchLocation(lastSuccessfulLocation);
          } else {
            setHasData(false);
          }
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [searchLocation]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasData && lastSuccessfulLocation) {
        const currentLocation = lastSuccessfulLocation;
        setSearchLocation("");
        setTimeout(() => setSearchLocation(currentLocation), 10);

        toast.info("Refreshing air quality data...", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [hasData, lastSuccessfulLocation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Loading state
  if (loading && !hasData) {
    return (
      <div
        className="airquality-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>Loading air quality data...</h1>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #2EC4B6",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
              margin: "2rem auto",
            }}
          ></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Empty state
  if (!hasData && !loading) {
    return (
      <div className="airquality-container">
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <header className="header-airquality">
          <h1>Air Quality Monitoring</h1>
          <p>Search for a location to view air quality data</p>
        </header>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
            <MapPin
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280",
              }}
            />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter city name (e.g., Mumbai, India)"
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                borderRadius: "8px",
                border: "2px solid #E5E7EB",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={handleSearch}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #2EC4B6 0%, #20A89E 100%)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Search size={16} />
            Search
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            textAlign: "center",
          }}
        >
          <Wind
            size={80}
            style={{ color: "#87CEFA", marginBottom: "1.5rem", opacity: 0.7 }}
          />
          <h2 style={{ color: "#374151", marginBottom: "0.5rem" }}>
            No Data Available
          </h2>
          <p style={{ color: "#6B7280", maxWidth: "500px" }}>
            Enter a location above to get started with air quality monitoring.
          </p>
        </div>
      </div>
    );
  }

  const aqiStatus = getAQIStatus(currentAQI);

  return (
    <div className="airquality-container">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <header className="header-airquality">
        <h1>Air Quality Monitoring</h1>
        <div className="location">
          <MapPin size={16} />
          <span>{location}</span>
          <span>•</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
            <MapPin
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280",
              }}
            />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Change location..."
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                borderRadius: "8px",
                border: "2px solid #E5E7EB",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {loading && (
              <div
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  style={{
                    border: "2px solid #f3f3f3",
                    borderTop: "2px solid #2EC4B6",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              background: loading
                ? "#9CA3AF"
                : "linear-gradient(135deg, #2EC4B6 0%, #20A89E 100%)",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </header>

      <section className="aqi-card">
        <h2 className="aqi-value">AQI {currentAQI ?? 0}</h2>
        <span
          className={`aqi-status ${aqiStatus.status
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          style={{ backgroundColor: aqiStatus.color }}
        >
          {aqiStatus.status}
        </span>
        <p class="m-4">{aqiStatus.description}</p>
        <div className="buttons">
          <button
            className="btn primary"
            onClick={() => navigate("/app/profile")}
          >
            <Bell size={14} /> Set Alert
          </button>
          <button
            className="btn outline"
            onClick={() => navigate("/app/profile")}
          >
            <MapPin size={14} /> Change Location
          </button>
        </div>
      </section>

      {recommendations.length > 0 && (
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
      )}

      <section className="charts">
        {hourlyForecast.length > 0 && (
          <div className="chart-card">
            <div className="section-header">
              <Calendar size={18} />
              <h3>24-Hour Forecast</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyForecast}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#2EC4B6"
                  fill="#2EC4B6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {weeklyForecast.length > 0 && (
          <div className="chart-card">
            <div className="section-header">
              <Wind size={18} />
              <h3>5-Day Forecast</h3>
            </div>
            {weeklyForecast.map((day, i) => (
              <div className="weekly-row" key={i}>
                <div className="day">
                  <span
                    className="color-dot"
                    style={{ backgroundColor: day.color }}
                  ></span>
                  {day.day}
                </div>
                <div className="info">
                  <span className="condition">{day.condition}</span>
                  <strong> AQI {day.aqi}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {pollutants.length > 0 && (
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
                  <span className={`pollutant-badge ${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </div>
                <div className="pollutant-details">
                  <p>
                    Current: {p.current.toFixed(1)} {p.unit}
                  </p>
                  <p>
                    Safe: ≤{p.safe} {p.unit}
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{
                        width: `${Math.min(
                          (p.current / (p.safe * 2)) * 100,
                          100
                        )}%`,
                        backgroundColor: p.color,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <AQIQuizCTA aqi={currentAQI} city={location} />
      <p className="text-xs text-gray-400 mt-2 text-center">
        2 minutes. Real impact.
      </p>
    </div>
  );
}
