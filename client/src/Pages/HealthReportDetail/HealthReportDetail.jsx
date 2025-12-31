import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiMapPin,
  FiDownload,
  FiUser,
  FiActivity,
  FiShield,
  FiClock,
  FiWind,
  FiCheckCircle,
  FiRefreshCw,
  FiChevronRight,
  FiFileText,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import html2pdf from "html2pdf.js";
import "react-toastify/dist/ReactToastify.css";
import "./HealthReportDetail.css";

const HealthReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [healthAssessment, setHealthAssessment] = useState(null);
  const [previousReports, setPreviousReports] = useState([]);
  const [pendingAssessment, setPendingAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [assessmentPending, setAssessmentPending] = useState(false);
  const [daysOld, setDaysOld] = useState(0);
  const [expandPreviousReports, setExpandPreviousReports] = useState(false);

  // NEW: Location modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationMethod, setLocationMethod] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Popular Indian cities
  const popularCities = [
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { name: "Delhi", lat: 28.6139, lon: 77.209 },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, report]);

  const checkAssessmentAge = (timestamp) => {
    const assessmentDate = new Date(timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - assessmentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isAssessmentNewer = (assessmentTimestamp, reportTimestamp) => {
    const assessmentDate = new Date(assessmentTimestamp);
    const reportDate = new Date(reportTimestamp);
    return assessmentDate > reportDate;
  };

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // ✅ NEW: Fetch AQI data from Open-Meteo API
  const fetchAQIData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&forecast_days=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch AQI data");
      }

      const data = await response.json();
      const hourly = data.hourly;
      const currentHourIndex = new Date().getHours();

      // Get current hour's data (first day, current hour)
      const currentIndex =
        currentHourIndex < hourly.time.length ? currentHourIndex : 0;
      const aqiValue = data.hourly.us_aqi[currentIndex] || 0;

      let status = "Good";
      if (aqiValue > 300) status = "Hazardous";
      else if (aqiValue > 200) status = "Very Unhealthy";
      else if (aqiValue > 150) status = "Unhealthy";
      else if (aqiValue > 100) status = "Unhealthy for Sensitive Groups";
      else if (aqiValue > 50) status = "Moderate";

      return {
        value: aqiValue,
        status: status,
        pollutants: {
          pm25: data.hourly.pm2_5[currentIndex] || 0,
          pm10: data.hourly.pm10[currentIndex] || 0,
          no2: data.hourly.nitrogen_dioxide[currentIndex] || 0,
          o3: data.hourly.ozone[currentIndex] || 0,
          co: data.hourly.carbon_monoxide[currentIndex] || 0,
          so2: data.hourly.sulphur_dioxide[currentIndex] || 0,
        },
        forecast: {
          pm25: data.hourly.pm2_5.slice(0, 24),
          pm10: data.hourly.pm10.slice(0, 24),
          aqi: data.hourly.us_aqi.slice(0, 24),
        },
      };
    } catch (err) {
      console.error("Error fetching AQI data:", err);
      throw new Error("Failed to fetch air quality data");
    }
  };

  // ✅ NEW: Get location name from coordinates
  const getLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        return "Current Location";
      }

      const data = await response.json();
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state;
      const country = data.address.country;

      return city ? `${city}, ${country}` : "Current Location";
    } catch (err) {
      console.error("Error getting location name:", err);
      return "Current Location";
    }
  };

  // ✅ NEW: Detect user's current location
  const detectLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      toast.info("Detecting your location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              name: "Current Location",
            };

            try {
              location.name = await getLocationName(
                location.latitude,
                location.longitude
              );
            } catch (err) {
              console.error("Failed to get location name:", err);
            }

            toast.success(`Location detected: ${location.name}`);
            resolve(location);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);

          let errorMessage = "Failed to detect location";
          if (error.code === 1) {
            errorMessage = "Location access denied by user";
          } else if (error.code === 2) {
            errorMessage = "Location unavailable";
          } else if (error.code === 3) {
            errorMessage = "Location request timeout";
          }

          reject(new Error(errorMessage));
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      );
    });
  };

  // ✅ NEW: Get city coordinates from city name
  const getCityCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cityName
        )}&limit=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch city coordinates");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          name: data[0].display_name.split(",")[0],
        };
      } else {
        throw new Error("City not found");
      }
    } catch (err) {
      console.error("Error fetching city coordinates:", err);
      throw err;
    }
  };

  const base_url = import.meta.env.VITE_BACKEND_URL  || "http://localhost:5000";

  // ✅ NEW: Proceed with report generation
  const proceedWithReportGeneration = async (location) => {
    setGenerating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again");
        navigate("/auth");
        return;
      }

      toast.info("Fetching air quality data...");
      let aqiData;

      try {
        aqiData = await fetchAQIData(location.latitude, location.longitude);
        toast.success(`AQI: ${aqiData.value} (${aqiData.status})`);
      } catch (aqiError) {
        console.error("AQI fetch failed:", aqiError);
        toast.warning("Using estimated air quality data");

        aqiData = {
          value: 65,
          status: "Unknown",
          pollutants: {
            pm25: 44,
            pm10: 23,
            no2: 4,
            o3: 55,
            co: 3,
            so2: 0,
          },
        };
      }

      toast.info("Generating your personalized health report...");

      const response = await fetch(`${base_url}api/health-report/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location,
          aqiData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate report");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Report generated successfully! 🎉");
        setTimeout(() => {
          navigate(`/app/health-report/${data.report._id}`);
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(data.message || "Failed to generate report");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      toast.error(err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  // ✅ NEW: Handle location selection
  const handleLocationSelect = async (method) => {
    setLocationMethod(method);

    if (method === "detect") {
      try {
        const location = await detectLocation();
        setSelectedLocation(location);
        setShowLocationModal(false);
        proceedWithReportGeneration(location);
      } catch (err) {
        toast.error(err.message);
        toast.warning("Using Pune as fallback location");

        const puneLocation = {
          latitude: 18.5204,
          longitude: 73.8567,
          name: "Pune, India (Fallback)",
        };
        setSelectedLocation(puneLocation);
        setShowLocationModal(false);
        proceedWithReportGeneration(puneLocation);
      }
    }
  };

  // ✅ NEW: Handle manual city submission
  const handleManualCitySubmit = async () => {
    if (!manualCity.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    try {
      toast.info("Searching for city...");
      const location = await getCityCoordinates(manualCity);
      setSelectedLocation(location);
      setShowLocationModal(false);
      toast.success(`Location set: ${location.name}`);
      proceedWithReportGeneration(location);
    } catch (err) {
      toast.error("City not found. Using Pune as fallback.");

      const puneLocation = {
        latitude: 18.5204,
        longitude: 73.8567,
        name: "Pune, India (Fallback)",
      };
      setSelectedLocation(puneLocation);
      setShowLocationModal(false);
      proceedWithReportGeneration(puneLocation);
    }
  };

  // ✅ NEW: Handle popular city selection
  const handlePopularCitySelect = (city) => {
    const location = {
      latitude: city.lat,
      longitude: city.lon,
      name: city.name,
    };
    setSelectedLocation(location);
    setShowLocationModal(false);
    toast.success(`Location set: ${city.name}`);
    proceedWithReportGeneration(location);
  };

  // ✅ UPDATED: Open modal instead of direct generation
  const handleGenerateReport = () => {
    if (!healthAssessment) {
      toast.error("Please complete health assessment first");
      return;
    }
    setShowLocationModal(true);
  };

  const fetchAllReportsAndAssessments = async (token) => {
    try {
      const reportsResponse = await fetch(
        `${base_url}api/health-report/my-reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let reports = [];
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        if (reportsData.success && reportsData.reports) {
          reports = reportsData.reports;
        }
      }

      const assessmentsResponse = await fetch(
        `${base_url}api/health-assessment/my-assessments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let assessments = [];
      if (assessmentsResponse.ok) {
        const assessmentsData = await assessmentsResponse.json();
        if (assessmentsData.success && assessmentsData.assessments) {
          assessments = assessmentsData.assessments;
        }
      }

      if (assessments.length > 0 && reports.length > 0) {
        const latestAssessment = assessments[0];
        const latestReport = reports[0];

        if (
          isAssessmentNewer(
            latestAssessment.timestamp,
            latestReport.report?.timestamp || latestReport.timestamp
          )
        ) {
          setPendingAssessment(latestAssessment);
        }
      } else if (assessments.length > 0 && reports.length === 0) {
        setPendingAssessment(assessments[0]);
      }

      if (id && reports.length > 1) {
        const otherReports = reports.filter((r) => r._id !== id);
        setPreviousReports(otherReports);
      } else if (!id && reports.length > 1) {
        setPreviousReports(reports.slice(1));
      }

      return { reports, assessments };
    } catch (err) {
      console.error("Error fetching reports and assessments:", err);
      return { reports: [], assessments: [] };
    }
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view health reports");
          navigate("/auth");
          return;
        }

        const { reports, assessments } = await fetchAllReportsAndAssessments(
          token
        );

        let endpoint;
        if (id) {
          endpoint = `${base_url}api/health-report/reports/${id}`;
        } else {
          endpoint = `${base_url}api/health-report/my-reports`;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          if (id) {
            setReport(data.report);
          } else {
            if (data.reports && data.reports.length > 0) {
              const latestReport = data.reports[0];

              if (assessments && assessments.length > 0) {
                const latestAssessment = assessments[0];

                if (
                  isAssessmentNewer(
                    latestAssessment.timestamp,
                    latestReport.report?.timestamp || latestReport.timestamp
                  )
                ) {
                  setHealthAssessment(latestAssessment);
                  const days = checkAssessmentAge(latestAssessment.timestamp);
                  setDaysOld(days);

                  if (days > 30) {
                    setAssessmentPending(true);
                  }
                } else {
                  setReport(latestReport);
                  navigate(`/app/health-report/${latestReport._id}`, {
                    replace: true,
                  });
                }
              } else {
                setReport(latestReport);
                navigate(`/app/health-report/${latestReport._id}`, {
                  replace: true,
                });
              }
            } else {
              const { assessments: allAssessments } =
                await fetchAllReportsAndAssessments(token);
              if (allAssessments && allAssessments.length > 0) {
                setHealthAssessment(allAssessments[0]);
                const days = checkAssessmentAge(allAssessments[0].timestamp);
                setDaysOld(days);
              } else {
                setError("no_assessment");
              }
            }
          }
        } else {
          setError(data.message || "Failed to fetch report");
        }
      } catch (err) {
        console.error("Error fetching health report:", err);
        setError(err.message || "Failed to fetch health report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  const getAQIColorClass = (aqi) => {
    if (aqi <= 50) return "aqi-good";
    if (aqi <= 100) return "aqi-moderate";
    if (aqi <= 150) return "aqi-unhealthy-sensitive";
    if (aqi <= 200) return "aqi-unhealthy";
    if (aqi <= 300) return "aqi-very-unhealthy";
    return "aqi-hazardous";
  };

  const getRiskBadgeClass = (level) => {
    if (level === "High") return "risk-high";
    if (level === "Moderate") return "risk-moderate";
    return "risk-low";
  };

  const downloadReport = () => {
    if (!report) return;

    setDownloading(true);
    toast.info("Generating PDF...");

    const reportElement = document.getElementById("health-report");
    const options = {
      margin: 10,
      filename: `health-report-${report._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(reportElement)
      .set(options)
      .save()
      .then(() => {
        setDownloading(false);
        toast.success("Report downloaded successfully!");
      })
      .catch((err) => {
        console.error("Error generating PDF:", err);
        setDownloading(false);
        toast.error("Failed to download report. Please try again.");
      });
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="report-container">
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <div className="loading-state">
          <div className="loading-content">
            <div className="loading-icon">
              <FiActivity size={48} className="pulse-icon" />
            </div>
            <div className="spinner-large"></div>
            <h2>Loading Health Report</h2>
            <p>Please wait while we fetch your report...</p>
          </div>
        </div>
      </div>
    );
  }

  // SHOW HEALTH ASSESSMENT WITH PENDING BADGE
  if (healthAssessment && !report) {
    return (
      <div className="report-container">
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <div className="report-header">
          <Link to="/app/dashboard" className="back-link">
            <FiArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        <div className="assessment-display">
          {/* PENDING ASSESSMENT ALERT */}
          {assessmentPending && (
            <div className="pending-assessment-alert">
              <div className="pending-header">
                <FiRefreshCw size={24} className="pending-icon" />
                <div className="pending-content">
                  <h3>New Health Assessment Detected</h3>
                  <p>Your latest assessment is {daysOld} days old</p>
                </div>
              </div>
              <p className="pending-message">
                For accurate and personalized recommendations, we recommend
                taking a fresh health assessment.
              </p>
              <div className="pending-actions">
                <Link
                  to="/app/health-assessment"
                  className="btn-renew-assessment"
                >
                  <FiActivity size={18} />
                  Take New Assessment
                </Link>
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="btn-continue-old"
                >
                  {generating ? (
                    <>
                      <div className="spinner"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiWind size={18} />
                      Generate Report from This Assessment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="assessment-header">
            <div className="title-icon">
              <FiActivity size={40} />
            </div>
            <h1>Your Health Assessment</h1>
            <p className="assessment-date">
              <FiClock size={16} />
              Completed on {formatDate(healthAssessment.timestamp)}
              {daysOld > 0 && (
                <span className="days-old"> ({daysOld} days ago)</span>
              )}
            </p>
          </div>

          {/* Personal Info */}
          <div className="report-section">
            <div className="section-header">
              <FiUser className="section-icon" />
              <h2>Personal Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">
                  {healthAssessment.name || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">
                  {healthAssessment.age
                    ? `${healthAssessment.age} years`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Health Conditions */}
          <div className="report-section">
            <div className="section-header">
              <FiActivity className="section-icon" />
              <h2>Health Conditions</h2>
            </div>

            {healthAssessment.chronicDiseases?.length > 0 && (
              <div className="health-subsection">
                <h3>Chronic Diseases</h3>
                <div className="tag-list">
                  {healthAssessment.chronicDiseases.map((disease, index) => (
                    <span key={index} className="health-tag chronic">
                      <FiCheckCircle size={14} />
                      {disease}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {healthAssessment.symptoms?.length > 0 && (
              <div className="health-subsection">
                <h3>Current Symptoms</h3>
                <div className="tag-list">
                  {healthAssessment.symptoms.map((symptom, index) => (
                    <span key={index} className="health-tag symptom">
                      <FiAlertCircle size={14} />
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {healthAssessment.additionalNotes && (
              <div className="health-subsection">
                <h3>Additional Information</h3>
                <p className="additional-notes">
                  {healthAssessment.additionalNotes}
                </p>
              </div>
            )}
          </div>

          {/* Generate Report Section */}
          <div className="generate-report-section">
            <div className="generate-card">
              <FiShield size={48} className="generate-icon" />
              <h2>Generate Your Health Report</h2>
              <p>
                Get personalized health recommendations based on your assessment
                and current air quality conditions.
              </p>
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="btn-generate"
              >
                {generating ? (
                  <>
                    <div className="spinner"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FiWind size={20} />
                    Generate Health Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ✅ LOCATION SELECTION MODAL */}
          {showLocationModal && (
            <div className="location-modal-overlay">
              <div className="location-modal">
                <div className="location-modal-header">
                  <h2>📍 Select Your Location</h2>
                  <p>
                    We need your location to provide accurate air quality data
                  </p>
                </div>

                <div className="location-options">
                  {/* Option 1: Auto-detect */}
                  <button
                    className="location-option-btn detect"
                    onClick={() => handleLocationSelect("detect")}
                    disabled={generating}
                  >
                    <FiMapPin size={32} />
                    <h3>Detect My Location</h3>
                    <p>Use GPS to automatically detect your current location</p>
                  </button>

                  {/* Option 2: Popular Cities */}
                  <div className="popular-cities-section">
                    <h3>Popular Cities</h3>
                    <div className="popular-cities-grid">
                      {popularCities.map((city) => (
                        <button
                          key={city.name}
                          className="popular-city-btn"
                          onClick={() => handlePopularCitySelect(city)}
                          disabled={generating}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option 3: Manual Entry */}
                  <div className="manual-entry-section">
                    <h3>Enter City Manually</h3>
                    <div className="manual-entry-input">
                      <input
                        type="text"
                        placeholder="Enter city name (e.g., Pune, Mumbai)"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleManualCitySubmit()
                        }
                        disabled={generating}
                      />
                      <button
                        className="manual-submit-btn"
                        onClick={handleManualCitySubmit}
                        disabled={generating || !manualCity.trim()}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="close-modal-btn"
                  onClick={() => setShowLocationModal(false)}
                  disabled={generating}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // NO ASSESSMENT STATE
  if (error === "no_assessment") {
    return (
      <div className="report-container">
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <div className="error-state">
          <FiAlertCircle size={80} className="error-icon" />
          <h2>No Health Assessment Found</h2>
          <p>
            Please complete a health assessment first to generate your report.
          </p>
          <div className="error-actions">
            <Link to="/app/health-assessment" className="btn-primary">
              <FiActivity size={18} />
              Take Health Assessment
            </Link>
            <Link to="/app/dashboard" className="btn-secondary">
              <FiArrowLeft size={18} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="report-container">
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <div className="error-state">
          <FiAlertCircle size={80} className="error-icon" />
          <h2>Error Loading Report</h2>
          <p>{error}</p>
          <div className="error-actions">
            <Link to="/app/dashboard" className="btn-primary">
              <FiArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NO REPORT DATA STATE
  if (!report) {
    return (
      <div className="report-container">
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <div className="error-state">
          <FiAlertCircle size={80} className="error-icon" />
          <h2>No Report Data</h2>
          <p>Unable to load report data. Please try again.</p>
          <div className="error-actions">
            <Link to="/app/dashboard" className="btn-primary">
              <FiArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <Link to="/app/health-assessment" className="btn-secondary">
              <FiActivity size={18} />
              New Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // REPORT DISPLAY
  return (
    <div className="report-container">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="report-header">
        <Link to="/app/dashboard" className="back-link">
          <FiArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <button
          onClick={downloadReport}
          disabled={downloading}
          className="btn-download"
        >
          {downloading ? (
            <>
              <div className="spinner"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <FiDownload size={18} />
              Download Report
            </>
          )}
        </button>
      </div>

      {/* ✅ PENDING ASSESSMENT BANNER */}
      {pendingAssessment && (
        <div className="pending-assessment-banner">
          <div className="banner-content">
            <FiRefreshCw size={20} className="banner-icon" />
            <div className="banner-text">
              <h3>New Health Assessment Available</h3>
              <p>
                You have a pending health assessment ready to generate a new
                report
              </p>
            </div>
          </div>
          <Link to="/app/health-report" className="banner-action">
            Generate Report
            <FiChevronRight size={18} />
          </Link>
        </div>
      )}

      <div id="health-report" className="report-content">
        {/* Report Title */}
        <div className="report-title-section">
          <div className="title-icon">
            <FiActivity size={40} />
          </div>
          <h1>Health Report</h1>
          <p className="report-date">
            <FiClock size={16} />
            Generated on {formatDate(report?.report?.timestamp)}
          </p>
        </div>

        {/* Personal Information */}
        <div className="report-section">
          <div className="section-header">
            <FiUser className="section-icon" />
            <h2>Personal Information</h2>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">
                {report.healthData?.name || "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-value">
                {report.healthData?.age
                  ? `${report.healthData.age} years`
                  : "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Age Group</span>
              <span className="info-value">
                {report.report?.userProfile?.ageGroup || "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Risk Level</span>
              <span
                className={`risk-badge ${getRiskBadgeClass(
                  report.report?.userProfile?.riskLevel
                )}`}
              >
                {report.report?.userProfile?.riskLevel || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Air Quality Status */}
        <div className="report-section">
          <div className="section-header">
            <FiWind className="section-icon" />
            <h2>Air Quality Status</h2>
          </div>
          <div className="aqi-status-card">
            <div className="aqi-main">
              <div className="aqi-value-large">
                <span
                  className={`aqi-badge ${getAQIColorClass(
                    report.aqiData?.value || 0
                  )}`}
                >
                  {report.aqiData?.value || "N/A"}
                </span>
                <span className="aqi-status-text">
                  {report.aqiData?.status || "N/A"}
                </span>
              </div>
              <div className="aqi-location">
                <FiMapPin size={16} />
                <span>{report.location?.name || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className="report-section">
          <div className="section-header">
            <FiActivity className="section-icon" />
            <h2>Health Conditions</h2>
          </div>

          {report.healthData?.chronicDiseases?.length > 0 && (
            <div className="health-subsection">
              <h3>Chronic Diseases</h3>
              <div className="tag-list">
                {report.healthData.chronicDiseases.map((disease, index) => (
                  <span key={index} className="health-tag chronic">
                    {disease}
                  </span>
                ))}
              </div>
            </div>
          )}

          {report.healthData?.symptoms?.length > 0 && (
            <div className="health-subsection">
              <h3>Current Symptoms</h3>
              <div className="tag-list">
                {report.healthData.symptoms.map((symptom, index) => (
                  <span key={index} className="health-tag symptom">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {report.healthData?.additionalNotes && (
            <div className="health-subsection">
              <h3>Additional Information</h3>
              <p className="additional-notes">
                {report.healthData.additionalNotes}
              </p>
            </div>
          )}

          {!report.healthData?.chronicDiseases?.length &&
            !report.healthData?.symptoms?.length &&
            !report.healthData?.additionalNotes && (
              <p className="no-data">No health conditions reported</p>
            )}
        </div>

        {/* Health Recommendations */}
        <div className="report-section">
          <div className="section-header">
            <FiShield className="section-icon" />
            <h2>Health Recommendations</h2>
          </div>

          {report.report?.healthSpecificRecommendations?.length > 0 ? (
            <div className="recommendations-list">
              {report.report.healthSpecificRecommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-number">{index + 1}</div>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">
              No health-specific recommendations available
            </p>
          )}

          {report.report?.ageSpecificRecommendations?.length > 0 && (
            <div className="recommendations-subsection">
              <h3>Age-Specific Recommendations</h3>
              <div className="recommendations-list">
                {report.report.ageSpecificRecommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.report?.generalRecommendations?.length > 0 && (
            <div className="recommendations-subsection">
              <h3>General Recommendations</h3>
              <div className="recommendations-list">
                {report.report.generalRecommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.report?.medicationGuidance?.length > 0 && (
            <div className="recommendations-subsection">
              <h3>Medication Guidance</h3>
              <div className="recommendations-list">
                {report.report.medicationGuidance.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.report?.outdoorActivitySafety?.recommendation && (
            <div className="safety-section">
              <h3>Outdoor Activities</h3>
              <div className="safety-card">
                <p className="safety-status">
                  <strong>Safe:</strong>{" "}
                  {report.report.outdoorActivitySafety.isSafe
                    ? "Yes ✓"
                    : "No ✗"}
                </p>
                <p>{report.report.outdoorActivitySafety.recommendation}</p>
                {report.report.outdoorActivitySafety.timeRestrictions && (
                  <p className="time-restrictions">
                    <strong>Best Times:</strong>{" "}
                    {report.report.outdoorActivitySafety.timeRestrictions}
                  </p>
                )}
                {report.report.outdoorActivitySafety.activityModifications && (
                  <p className="activity-mods">
                    <strong>Modifications:</strong>{" "}
                    {report.report.outdoorActivitySafety.activityModifications}
                  </p>
                )}
              </div>
            </div>
          )}

          {report.report?.maskRecommendations?.usage && (
            <div className="safety-section">
              <h3>Mask Guidance</h3>
              <div className="safety-card">
                <p className="mask-status">
                  <strong>Recommended:</strong>{" "}
                  {report.report.maskRecommendations.isRecommended
                    ? "Yes ✓"
                    : "No ✗"}
                </p>
                <p>{report.report.maskRecommendations.usage}</p>
                {report.report.maskRecommendations.type && (
                  <p className="mask-type">
                    <strong>Recommended mask:</strong>{" "}
                    {report.report.maskRecommendations.type}
                  </p>
                )}
                {report.report.maskRecommendations.maintenance && (
                  <p className="mask-maintenance">
                    <strong>Care Instructions:</strong>{" "}
                    {report.report.maskRecommendations.maintenance}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p>Report generated by BreatheSafeAI</p>
          <p>
            This report is for informational purposes only. Consult a healthcare
            professional for medical advice.
          </p>
        </div>
      </div>

      {/* ✅ PREVIOUS REPORTS SECTION */}
      {previousReports.length > 0 && (
        <div className="previous-reports-section">
          <div className="section-header-standalone">
            <FiFileText className="section-icon" />
            <h2>Previous Reports</h2>
            <button
              className="expand-toggle"
              onClick={() => setExpandPreviousReports(!expandPreviousReports)}
            >
              {expandPreviousReports ? "Hide" : "Show"} (
              {previousReports.length})
            </button>
          </div>

          {expandPreviousReports && (
            <div className="reports-list">
              {previousReports.map((prevReport, index) => (
                <Link
                  key={prevReport._id}
                  to={`/app/health-report/${prevReport._id}`}
                  className="report-list-item"
                >
                  <div className="report-item-content">
                    <div className="report-item-header">
                      <h3>Report #{previousReports.length - index}</h3>
                      <span className="report-date-small">
                        {formatDate(prevReport?.report?.timestamp)}
                      </span>
                    </div>
                    <div className="report-item-details">
                      <span className="aqi-indicator">
                        AQI:{" "}
                        <strong>{prevReport.aqiData?.value || "N/A"}</strong>
                      </span>
                      <span className="location-indicator">
                        📍 {prevReport.location?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <FiChevronRight size={20} className="chevron-icon" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthReportDetail;
