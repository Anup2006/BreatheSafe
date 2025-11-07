import React, { useState, useEffect, useRef, use } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";

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

export default function Dashboard() {
  // State management with proper defaults
  const [currentAQI, setCurrentAQI] = useState(null);
  const [airQualityData, setAirQualityData] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const { user } = useAuth();
  // Separate input value from actual search location
  const [inputValue, setInputValue] = useState("Pune, India");
  const [searchLocation, setSearchLocation] = useState("Pune, India");
  const [lastSuccessfulLocation, setLastSuccessfulLocation] =
    useState("Pune, India");

  // Debounce timer ref
  const debounceTimer = useRef(null);

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
      throw new Error(
        `Location "${locationName}" not found. Please try a different search term.`
      );
    } catch (err) {
      throw new Error(err.message || "Failed to fetch coordinates");
    }
  };

  // Function to fetch AQI data with 5-day forecast
  const fetchAQIData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&forecast_days=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch AQI data from server");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(
        "Failed to fetch AQI data. Please check your connection."
      );
    }
  };

  // Safe number formatting helper
  const safeToFixed = (value, decimals = 1) => {
    return value != null ? Number(value).toFixed(decimals) : "N/A";
  };

  // Process API data with null safety
  const processAQIData = (data) => {
    const hourly = data.hourly;
    const currentHourIndex = new Date().getHours();

    // Get current hour's data (first day, current hour)
    const currentIndex =
      currentHourIndex < hourly.time.length ? currentHourIndex : 0;

    // Set current AQI with fallback
    setCurrentAQI(hourly.us_aqi?.[currentIndex] ?? 0);

    // Build air components with null checks
    const airComponents = [
      {
        name: "PM2.5",
        value: safeToFixed(hourly.pm2_5?.[currentIndex]),
        unit: "μg/m³",
      },
      {
        name: "PM10",
        value: safeToFixed(hourly.pm10?.[currentIndex]),
        unit: "μg/m³",
      },
      {
        name: "NO₂",
        value: safeToFixed(hourly.nitrogen_dioxide?.[currentIndex]),
        unit: "ppb",
      },
      {
        name: "O₃",
        value: safeToFixed(hourly.ozone?.[currentIndex]),
        unit: "ppb",
      },
      {
        name: "CO",
        value: hourly.carbon_monoxide?.[currentIndex]
          ? safeToFixed(hourly.carbon_monoxide[currentIndex] / 1145.7, 2)
          : "N/A",
        unit: "ppm",
      },
    ];
    setAirQualityData(airComponents);

    // Process 5-day forecast using actual dates from API
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

    // Loop through hourly data and extract one data point per day (at noon)
    for (let i = 0; i < hourly.time.length; i++) {
      const dateTime = new Date(hourly.time[i]);
      const dateString = dateTime.toISOString().split("T")[0]; // Get YYYY-MM-DD

      // Only process if we haven't seen this date and it's around noon (hour 12)
      if (!processedDates.has(dateString) && dateTime.getHours() === 12) {
        processedDates.add(dateString);

        // Get values with null fallbacks
        const aqiValue = hourly.us_aqi?.[i] ?? 0;
        const pm25Value = hourly.pm2_5?.[i] ?? 0;
        const pm10Value = hourly.pm10?.[i] ?? 0;

        forecast5Days.push({
          day: daysOfWeek[dateTime.getDay()],
          date: dateTime.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: dateString,
          aqi: aqiValue,
          pm25: pm25Value,
          pm10: pm10Value,
          risk: Math.min(100, (pm25Value / 150) * 100),
        });

        // Stop after collecting 5 days
        if (forecast5Days.length >= 5) break;
      }
    }

    setForecastData(forecast5Days);

    // Also set weekly trend for the chart
    setWeeklyTrend(forecast5Days);

    // Mark that we have valid data
    setHasData(true);
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer - only search after user stops typing for 1 second
    debounceTimer.current = setTimeout(() => {
      if (newValue.trim()) {
        setSearchLocation(newValue);
      }
    }, 1000);
  };

  // Handle manual search button click
  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchLocation(inputValue);
    }
  };

  // Handle Enter key press
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
        // Only show loading for initial load
        if (!hasData) {
          setLoading(true);
        }

        const coords = await getCoordinates(searchLocation);
        const aqiData = await fetchAQIData(coords.lat, coords.lon);

        if (!ignore) {
          processAQIData(aqiData);
          setLoading(false);
          setLastSuccessfulLocation(searchLocation);

          // Show success toast only after initial load
          if (hasData) {
            toast.success(`Air quality data updated for ${searchLocation}`, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }
      } catch (err) {
        if (!ignore) {
          setLoading(false);

          // Show error toast with specific message
          toast.error(err.message || "Failed to fetch air quality data", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Reset input to last successful location if we have data
          if (hasData) {
            setInputValue(lastSuccessfulLocation);
            setSearchLocation(lastSuccessfulLocation);
          } else {
            // If no data yet, show empty state
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
        // Force refresh by triggering a new fetch with last successful location
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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Get AQI status and color
  const getAQIStatus = (aqi) => {
    const aqiValue = aqi ?? 0;
    if (aqiValue <= 50) return { status: "Good", color: "#10B981" };
    if (aqiValue <= 100) return { status: "Moderate", color: "#F59E0B" };
    if (aqiValue <= 150)
      return { status: "Unhealthy for Sensitive Groups", color: "#EF4444" };
    if (aqiValue <= 200) return { status: "Unhealthy", color: "#DC2626" };
    if (aqiValue <= 300) return { status: "Very Unhealthy", color: "#9333EA" };
    return { status: "Hazardous", color: "#7C2D12" };
  };

  // Initial loading state (only on first load)
  if (loading && !hasData) {
    return (
      <div className="dashboard">
        <div className="header1">
          <h1>Loading air quality data...</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <div
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #2EC4B6",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no data available
  if (!hasData && !loading) {
    return (
      <div className="dashboard">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <div className="header1">
          <h1>Welcome to Air Quality Monitor</h1>
          <p>Search for a location to view air quality data</p>

          {/* Search Interface */}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
              <i
                className="fas fa-map-marker-alt"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6B7280",
                  pointerEvents: "none",
                }}
              ></i>
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
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
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
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 4px rgba(46, 196, 182, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(46, 196, 182, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(46, 196, 182, 0.2)";
              }}
            >
              <i className="fas fa-search"></i>
              Search
            </button>
          </div>
        </div>

        {/* Empty State Illustration */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <i
            className="fas fa-cloud-sun"
            style={{
              fontSize: "6rem",
              color: "#87CEFA",
              marginBottom: "1.5rem",
              opacity: 0.7,
            }}
          ></i>
          <h2 style={{ color: "#374151", marginBottom: "0.5rem" }}>
            No Data Available
          </h2>
          <p style={{ color: "#6B7280", maxWidth: "500px" }}>
            Enter a location in the search box above to get started with air
            quality monitoring. We'll show you current conditions and a 5-day
            forecast.
          </p>
        </div>
      </div>
    );
  }

  const aqiStatus = getAQIStatus(currentAQI);

  // Air Components (Bar Chart) - with null handling
  const airComponentData = {
    labels: airQualityData.map((item) => item.name),
    datasets: [
      {
        label: "Current Value",
        data: airQualityData.map((item) => {
          const value = parseFloat(item.value);
          return isNaN(value) ? 0 : value;
        }),
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

  // Weekly Trend (Line + Area)
  const weeklyTrendData = {
    labels: weeklyTrend.map((item) => item.day),
    datasets: [
      {
        label: "Air Quality Index",
        data: weeklyTrend.map((item) => item.aqi ?? 0),
        borderColor: "#2EC4B6",
        backgroundColor: "rgba(46, 196, 182, 0.3)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Health Risk Level",
        data: weeklyTrend.map((item) => item.risk ?? 0),
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
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
      <div className="header1">
        <h1>Welcome back, {user?.name || "User"}!</h1>
        <p>
          Here's your personalized air quality and health overview for{" "}
          {lastSuccessfulLocation}.
          {lastSuccessfulLocation !== searchLocation && (
            <span style={{ color: "#6B7280", fontSize: "0.9rem" }}>
              {" "}
              (Showing last successful location)
            </span>
          )}
        </p>

        {/* Improved Location Search */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
            <i
              className="fas fa-map-marker-alt"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280",
                pointerEvents: "none",
              }}
            ></i>
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
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
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
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 2px 4px rgba(46, 196, 182, 0.2)",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(46, 196, 182, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(46, 196, 182, 0.2)";
              }
            }}
          >
            <i className="fas fa-search"></i>
            Search
          </button>
        </div>

        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#6B7280",
          }}
        >
          <i className="fas fa-info-circle"></i> Type a location and press Enter
          or click Search
        </p>
      </div>

      {/* AQI Overview */}
      <div className="aqi-overview">
        <span>
          <i
            className="fas fa-cloud cloud-icon"
            style={{ color: "#87CEFA" }}
          ></i>{" "}
          Air Quality Overview
        </span>
        <div className="aqi-value">AQI: {currentAQI ?? 0}</div>
        <span className="badge" style={{ backgroundColor: aqiStatus.color }}>
          {aqiStatus.status}
        </span>
        <div className="aqi-bar">
          <div
            className="aqi-fill"
            style={{
              width: `${Math.min(((currentAQI ?? 0) / 300) * 100, 100)}%`,
              backgroundColor: aqiStatus.color,
            }}
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
        <div className="chart-card">
          <h2>Current Air Components</h2>
          <Bar data={airComponentData} options={{ responsive: true }} />
        </div>

        <div className="chart-card">
          <h2>Asthma Risk Factors in India</h2>
          <Pie data={riskFactorData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Detailed Measurements */}
      <div className="card">
        <div className="card-header">
          <div className="header-content">
            <h4 className="card-title">
              <i className="fa-regular fa-eye" style={{ color: "#87CEFA" }}></i>{" "}
              Detailed Measurements
            </h4>
          </div>
        </div>

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

      {/* 5-Day Forecast Table */}
      {forecastData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="header-content">
              <h4 className="card-title">
                <i
                  className="fa-solid fa-calendar-days"
                  style={{ color: "#87CEFA" }}
                ></i>{" "}
                5-Day Air Quality Forecast
              </h4>
            </div>
          </div>

          <div className="card-content">
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "1rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#F3F4F6",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Day
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Date
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      AQI
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      Status
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      PM2.5
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>
                      PM10
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((day, index) => {
                    const status = getAQIStatus(day.aqi);
                    return (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid #E5E7EB",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#F9FAFB")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td style={{ padding: "0.75rem", fontWeight: "600" }}>
                          {day.day}
                        </td>
                        <td style={{ padding: "0.75rem", color: "#6B7280" }}>
                          {day.date}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            textAlign: "center",
                            fontWeight: "600",
                          }}
                        >
                          {day.aqi ?? "N/A"}
                        </td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              backgroundColor: status.color,
                              color: "white",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                            }}
                          >
                            {status.status}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>
                          {safeToFixed(day.pm25)} μg/m³
                        </td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>
                          {safeToFixed(day.pm10)} μg/m³
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Trend Chart */}
      {weeklyTrend.length > 0 && (
        <div className="chart-card">
          <h2>
            <i className="fa-solid fa-wind" style={{ color: "#87CEFA" }}></i>{" "}
            5-Day Air Quality Trend
          </h2>
          <Line data={weeklyTrendData} options={{ responsive: true , interaction: {
                  mode: "index",
                  intersect: false,
           } ,
              plugins: {
               filler: {
                    propagate: true,
                  },
                  legend: {
                    position: "top",
                    labels: {
                      boxWidth: 14,
                      padding: 15,
                      font: { size: 13, weight: "600" },
                      color: "#374151",
                      usePointStyle: true,
                      pointStyle: "circle",
                    },
                  },
                },
              scales: {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      font: { size: 12, weight: "500" },
                      color: "#6b7280",
                      callback: function (value) {
                        return value.toFixed(1);
                      },
                    },
                  },
                  x: {
                    ticks: {
                      font: { size: 12, weight: "500" },
                      color: "#6b7280",
                      maxRotation: 45,
                      minRotation: 0,
                    },
                  },
                },
                animation: {
                  duration: 750,
                  easing: "easeInOutQuart",
                }

          }} />
          <div className="legend">
            <div>
              <span className="dot aq"></span> Air Quality Index
            </div>
            <div>
              <span className="dot risk"></span> Health Risk Level
            </div>
          </div>
        </div>
      )}

      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
