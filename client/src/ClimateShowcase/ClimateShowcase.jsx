import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import "./ClimateShowcase.css";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ClimateForecaster() {
  const [location, setLocation] = useState({
    name: "Pune",
    lat: 18.5214,
    lon: 73.8545,
  });
  const [inputValue, setInputValue] = useState("Pune");
  const [forecastData, setForecastData] = useState(null);
  const [selectedVariables, setSelectedVariables] = useState([
    "temperature_2m_max",
    "temperature_2m_min",
  ]);
  const [dateRange, setDateRange] = useState({
    start: "2020-01-01",
    end: "2050-12-31",
  });
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const debounceTimer = useRef(null);
  const cacheRef = useRef({});
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/app");
  };
  // ✅ EXPANDED WEATHER VARIABLES WITH ALL OPTIONS
  const weatherVariables = [
    // Temperature
    {
      id: "temperature_2m_max",
      name: "Max Temperature",
      unit: "°C",
      category: "Temperature",
      icon: "🌡️",
      color: "#FF6B6B",
    },
    {
      id: "temperature_2m_min",
      name: "Min Temperature",
      unit: "°C",
      category: "Temperature",
      icon: "❄️",
      color: "#4ECDC4",
    },
    {
      id: "temperature_2m_mean",
      name: "Mean Temperature",
      unit: "°C",
      category: "Temperature",
      icon: "🌤️",
      color: "#45B7D1",
    },

    // Relative Humidity
    {
      id: "relative_humidity_2m_max",
      name: "Max Humidity",
      unit: "%",
      category: "Humidity",
      icon: "💦",
      color: "#FFD93D",
    },
    {
      id: "relative_humidity_2m_mean",
      name: "Mean Humidity",
      unit: "%",
      category: "Humidity",
      icon: "💧",
      color: "#FFA500",
    },
    {
      id: "relative_humidity_2m_min",
      name: "Min Humidity",
      unit: "%",
      category: "Humidity",
      icon: "🏜️",
      color: "#FF8C42",
    },

    // Wind Speed
    {
      id: "wind_speed_10m_mean",
      name: "Mean Wind Speed",
      unit: "km/h",
      category: "Wind",
      icon: "💨",
      color: "#BB8FCE",
    },
    {
      id: "wind_speed_10m_max",
      name: "Max Wind Speed",
      unit: "km/h",
      category: "Wind",
      icon: "🌪️",
      color: "#9B59B6",
    },

    // Cloud & Radiation
    {
      id: "cloud_cover_mean",
      name: "Cloud Cover",
      unit: "%",
      category: "Cloud",
      icon: "☁️",
      color: "#95A5A6",
    },

    // Pressure
    {
      id: "pressure_msl_mean",
      name: "Sea Level Pressure",
      unit: "hPa",
      category: "Pressure",
      icon: "📊",
      color: "#8E44AD",
    },
  ];

  const quickDateRanges = [
    { label: "1950-2050", start: "1950-01-01", end: "2050-12-31" },
    { label: "2015-2050", start: "2015-01-01", end: "2050-12-31" },
    { label: "2020-2050", start: "2020-01-01", end: "2050-12-31" },
    { label: "2030-2050", start: "2030-01-01", end: "2050-12-31" },
  ];

  // ✅ Get coordinates from location name
  const getCoordinates = async (locationName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}&limit=1`,
        { timeout: 5000 }
      );

      if (!response.ok) throw new Error("Failed to fetch location");

      const data = await response.json();

      if (data.length > 0) {
        return {
          name: data[0].name || locationName,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      throw new Error(
        `Location "${locationName}" not found. Please try another location.`
      );
    } catch (err) {
      throw new Error(err.message || "Failed to fetch location coordinates");
    }
  };

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
        `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=${latitude}&lon=${longitude}`
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

      setTimeout(() => handleLocationSearch(true), 500);
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

  // ✅ Fetch climate forecast data with caching
  const fetchClimateData = async (lat, lon) => {
    try {
      const variables = selectedVariables.join(",");
      const cacheKey = `${lat}_${lon}_${dateRange.start}_${dateRange.end}_${variables}`;

      if (cacheRef.current[cacheKey]) {
        return cacheRef.current[cacheKey];
      }

      const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_date=${dateRange.start}&end_date=${dateRange.end}&daily=${variables}&temperature_unit=celsius`;

      const response = await fetch(url, { timeout: 15000 });

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        throw new Error("No climate data available for this location");
      }

      cacheRef.current[cacheKey] = data;

      return data;
    } catch (err) {
      throw new Error(err.message || "Failed to fetch climate forecast data");
    }
  };

  // ✅ Handle location search
  const handleLocationSearch = async (isGeolocation = false) => {
    if (!isGeolocation && !inputValue.trim()) {
      toast.warning("Please enter a location", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let coords = location;

      if (!isGeolocation) {
        coords = await getCoordinates(inputValue);
        setLocation(coords);
      }

      setChartLoading(true);
      const climateData = await fetchClimateData(coords.lat, coords.lon);
      setForecastData(climateData);
      setHasData(true);
      setChartLoading(false);

      toast.success(`✓ Climate data loaded for ${coords.name}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      setError(err.message);
      setHasData(false);
      toast.error(err.message, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLocationSearch();
    }
  };

  // ✅ Toggle variable selection
  const toggleVariable = (varId) => {
    if (selectedVariables.includes(varId)) {
      if (selectedVariables.length > 1) {
        setSelectedVariables(selectedVariables.filter((v) => v !== varId));
      } else {
        toast.warning("Select at least one variable", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      if (selectedVariables.length < 6) {
        setSelectedVariables([...selectedVariables, varId]);
      } else {
        toast.warning("Maximum 6 variables allowed for better visualization", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // ✅ Generate user-friendly chart data
  const generateChartData = () => {
    try {
      if (!forecastData || !forecastData.daily) return null;

      const daily = forecastData.daily;
      const timeData = daily.time || [];

      if (timeData.length === 0) return null;

      // Sample every 365th day for better visualization
      const sampleIndices = timeData
        .map((_, i) => (i % 365 === 0 ? i : null))
        .filter((i) => i !== null);

      if (sampleIndices.length === 0) return null;

      const sampledTime = sampleIndices.map((i) => timeData[i]).slice(0, 100);

      const datasets = selectedVariables.map((varId, idx) => {
        const variable = weatherVariables.find((v) => v.id === varId);
        const varName = variable?.name || varId;
        const varColor =
          variable?.color || `hsl(${Math.random() * 360}, 70%, 50%)`;

        const validData = sampleIndices.slice(0, 100).map((i) => {
          const value = daily[varId]?.[i];
          return typeof value === "number" && !isNaN(value)
            ? parseFloat(value.toFixed(2))
            : 0;
        });

        return {
          label: varName,
          data: validData,
          borderColor: varColor,
          backgroundColor: varColor + "20",
          fill: idx === 0 ? true : false,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: varColor,
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          segment: {
            borderDash: (ctx) => (ctx.p1 === ctx.p0 ? [5, 5] : undefined),
          },
        };
      });

      return {
        labels: sampledTime.map((date) => {
          const d = new Date(date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        }),
        datasets,
      };
    } catch (err) {
      console.error("Chart data generation error:", err);
      return null;
    }
  };

  // ✅ Get grouped variables by category
  const groupedVariables = weatherVariables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {});

  useEffect(() => {
    handleLocationSearch();

    if (hasData && forecastData && location) {
      // Regenerate chart data instantly on variable change
      setChartLoading(true);
      setTimeout(() => {
        setChartLoading(false);
      }, 300); // small delay for smoother UI transition
    }
  }, [selectedVariables]);
  const chartData = generateChartData();
  const isDateRangeValid =
    dateRange.start && dateRange.end && dateRange.start <= dateRange.end;

  return (
    <div className="climate-forecaster">
      {/* TOP NAVIGATION */}
      <div className="top-nav text-center">
        <Link to="/app" className="back-link">
          <FiArrowLeft size={20} />
          Back to Home
        </Link>
        <h1 className="nav-title mx-auto">🌍 Climate Forecast Predictor</h1>
      </div>

      {/* HEADER */}
      <div className="header1">
        <p>Explore climate projections using high-resolution climate models</p>
      </div>

      {/* LOCATION & TIME SELECTION */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-map-marker-alt"></i> Location & Time Selection
          </h3>
        </div>

        <div className="card-content">
          <div className="form-section">
            <div className="location-header">
              <label>📍 Location</label>
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
              <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                <i className="fas fa-search search-icon "></i>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter city name (e.g., Berlin, Tokyo, Mumbai)"
                  disabled={loading}
                />
              </div>
              <button
                onClick={() => handleLocationSearch()}
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

          <div className="form-section">
            <label>📅 Date Range</label>
            <div className="date-inputs">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                disabled={loading}
              />
              <span className="date-sep">→</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {!isDateRangeValid && (
              <p className="date-warning">
                ⚠️ Invalid date range. Start date must be before end date.
              </p>
            )}

            <div className="quick-dates">
              <label>Quick Select:</label>
              <div className="quick-buttons">
                {quickDateRanges.map((range) => (
                  <button
                    key={range.label}
                    className="quick-btn"
                    onClick={() =>
                      setDateRange({ start: range.start, end: range.end })
                    }
                    disabled={loading}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAP */}
      {hasData && (
        <div className="card map-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-globe"></i> Location Map
            </h3>
          </div>
          <div className="card-content">
            <div className="map-container">
              <iframe
                title="Location Map"
                width="100%"
                height="400"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  location.lon - 0.5
                },${location.lat - 0.5},${location.lon + 0.5},${
                  location.lat + 0.5
                }&layer=mapnik&marker=${location.lat},${location.lon}`}
                style={{ borderRadius: "8px" }}
              ></iframe>
              <p className="map-credit">
                ©{" "}
                <a
                  href="https://www.openstreetmap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap
                </a>{" "}
                contributors
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VARIABLES SELECTION - GROUPED BY CATEGORY */}
      {hasData && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-sliders-h"></i> Daily Variables (
              {selectedVariables.length}/{weatherVariables.length})
            </h3>
            <p className="card-subtitle">
              Select up to 6 variables for chart visualization
            </p>
          </div>

          <div className="card-content">
            {Object.entries(groupedVariables).map(([category, variables]) => (
              <div key={category} className="variable-category">
                <h4 className="category-title">{category}</h4>
                <div className="variables-grid">
                  {variables.map((variable) => (
                    <button
                      key={variable.id}
                      className={`variable-item ${
                        selectedVariables.includes(variable.id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleVariable(variable.id)}
                      title={`${variable.name} (${variable.unit})`}
                      disabled={loading}
                      style={{
                        "--var-color": variable.color,
                      }}
                    >
                      <div className="var-check">
                        {selectedVariables.includes(variable.id) && (
                          <i className="fas fa-check"></i>
                        )}
                      </div>
                      <div className="var-icon">{variable.icon}</div>
                      <div className="var-info">
                        <div className="var-name">{variable.name}</div>
                        <div className="var-unit">{variable.unit}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLIMATE FORECAST CHART */}
      {hasData && chartData && !chartLoading && (
        <div className="chart-card">
          <div className="chart-header">
            <h2>
              <i className="fas fa-chart-line"></i> Climate Forecast Trends
            </h2>
            <p className="chart-subtitle">
              {dateRange.start} to {dateRange.end}
            </p>
          </div>
          <div className="chart-wrapper">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: "index",
                  intersect: false,
                },
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
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    padding: 14,
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 13 },
                    footerFont: { size: 12 },
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                      title: (context) => {
                        return `📅 ${context[0].label}`;
                      },
                      label: (context) => {
                        const label = context.dataset.label || "";
                        const value = context.parsed.y;
                        const unit =
                          weatherVariables.find((v) => v.name === label)
                            ?.unit || "";
                        return `${label}: ${value.toFixed(2)} ${unit}`;
                      },
                      footer: () => {
                        return "Data sampled annually";
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: true,
                      lineWidth: 1,
                    },
                    ticks: {
                      font: { size: 12, weight: "500" },
                      color: "#6b7280",
                      callback: function (value) {
                        return value.toFixed(1);
                      },
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                      drawBorder: true,
                    },
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
                },
              }}
            />
          </div>
          <div className="chart-info">
            <div className="info-item">
              <i className="fas fa-info-circle"></i>
              <span>Data sampled annually for visualization clarity</span>
            </div>
            <div className="info-item">
              <i className="fas fa-lightbulb"></i>
              <span>Hover over data points to see exact values</span>
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {chartLoading && (
        <div className="card">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Generating climate forecast chart...</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
