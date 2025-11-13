import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiVolume2,
  FiVolumeX,
  FiSearch,
  FiAlertCircle,
  FiWind,
  FiDroplet,
  FiCloud,
  FiSun,
  FiActivity,
  FiArrowLeft,
} from "react-icons/fi";
import "./DiseaseInfo.css";

const DiseaseInfoPage = () => {
  const [speakingDisease, setSpeakingDisease] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const diseases = [
    {
      name: "Asthma",
      symptoms: [
        "Shortness of breath",
        "Wheezing",
        "Chest tightness",
        "Chronic cough",
        "Difficulty breathing during exercise or at night",
      ],
      causes:
        "Exposure to outdoor and indoor air pollutants such as particulate matter, ozone, nitrogen dioxide, sulfur dioxide, and allergens. Other triggers include tobacco smoke, pet dander, dust, and mold.",
      pollutants: [
        "Particulate Matter (PM2.5 and PM10)",
        "Nitrogen Dioxide (NO₂)",
        "Ozone (O₃)",
        "Sulfur Dioxide (SO₂)",
        "Carbon Monoxide (CO)",
        "Tobacco Smoke",
        "Animal Dander and Indoor Allergens",
      ],
      icon: <FiWind className="disease-icon" />,
      color: "#2EC4B6",
      severity: "Moderate to Severe",
    },
    {
      name: "Bronchitis",
      symptoms: [
        "Persistent cough",
        "Mucus production",
        "Fatigue",
        "Shortness of breath",
      ],
      causes: "Exposure to smoke, air pollution, and viral infections",
      pollutants: [
        "Particulate matter (PM2.5, PM10)",
        "Carbon monoxide (CO)",
        "Sulfur dioxide (SO₂)",
      ],
      icon: <FiDroplet className="disease-icon" />,
      color: "#3B82F6",
      severity: "Moderate",
    },
    {
      name: "COPD",
      symptoms: [
        "Progressive breathlessness",
        "Chronic cough",
        "Frequent respiratory infections",
        "Fatigue",
      ],
      causes: "Long-term exposure to harmful gases and particulate matter",
      pollutants: [
        "Tobacco smoke",
        "Industrial dust",
        "Chemical fumes",
        "Air pollution",
      ],
      icon: <FiCloud className="disease-icon" />,
      color: "#8B5CF6",
      severity: "Severe",
    },
    {
      name: "Pneumonia",
      symptoms: [
        "High fever",
        "Cough with phlegm",
        "Difficulty breathing",
        "Chest pain",
      ],
      causes: "Bacterial or viral infections, weakened immune system",
      pollutants: [
        "Air pollution",
        "Smoke inhalation",
        "Chemical fumes",
        "Dust particles",
      ],
      icon: <FiAlertCircle className="disease-icon" />,
      color: "#EF4444",
      severity: "Severe",
    },
    {
      name: "Sinusitis",
      symptoms: [
        "Nasal congestion",
        "Facial pain",
        "Headache",
        "Post-nasal drip",
      ],
      causes: "Viral infections, allergies, air pollution",
      pollutants: [
        "Airborne allergens",
        "Pollution particles",
        "Mold spores",
        "Dust",
      ],
      icon: <FiSun className="disease-icon" />,
      color: "#F59E0B",
      severity: "Mild",
    },
    {
      name: "Tuberculosis",
      symptoms: [
        "Persistent cough",
        "Night sweats",
        "Weight loss",
        "Chest pain",
      ],
      causes: "Bacterial infection, poor air quality",
      pollutants: [
        "Indoor air pollution",
        "Tobacco smoke",
        "Industrial emissions",
        "Dust particles",
      ],
      icon: <FiActivity className="disease-icon" />,
      color: "#DC2626",
      severity: "Severe",
    },
    {
      name: "Lung Cancer",
      symptoms: [
        "Persistent cough",
        "Chest pain",
        "Shortness of breath",
        "Unexplained weight loss",
      ],
      causes: "Long-term exposure to carcinogens",
      pollutants: ["Tobacco smoke", "Radon gas", "Asbestos", "Air pollution"],
      icon: <FiAlertCircle className="disease-icon" />,
      color: "#7C2D12",
      severity: "Critical",
    },
    {
      name: "Allergic Rhinitis",
      symptoms: ["Sneezing", "Runny nose", "Itchy eyes", "Nasal congestion"],
      causes: "Allergic reactions to airborne particles",
      pollutants: ["Pollen", "Dust mites", "Pet dander", "Mold spores"],
      icon: <FiSun className="disease-icon" />,
      color: "#10B981",
      severity: "Mild",
    },
  ];

  const toggleSpeech = (disease) => {
    if (speakingDisease === disease.name) {
      window.speechSynthesis.cancel();
      setSpeakingDisease(null);
      return;
    }

    const text = `Disease: ${
      disease.name
    }. Symptoms include: ${disease.symptoms.join(", ")}. Caused by: ${
      disease.causes
    }. Major pollutants are: ${disease.pollutants.join(", ")}.`;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (voice) => voice.name.includes("Female") || voice.gender === "female"
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => setSpeakingDisease(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingDisease(disease.name);
  };

  const handleBack = () => {
    navigate("/app");
  };

  const filteredDiseases = diseases.filter(
    (disease) =>
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.symptoms.some((symptom) =>
        symptom.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      disease.pollutants.some((pollutant) =>
        pollutant.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getSeverityBadge = (severity) => {
    const badges = {
      Mild: "severity-mild",
      Moderate: "severity-moderate",
      Severe: "severity-severe",
      Critical: "severity-critical",
    };
    return badges[severity] || "severity-moderate";
  };

  return (
    <div className="disease-info-container">
      {/* TOP NAVIGATION */}
      <div className="top-nav">
        <Link to="/app" className="back-link">
          <FiArrowLeft size={20} />
          Back to Home
        </Link>
        <h1 className="nav-title mx-auto">❤️‍🩹 Airborne Disease Information</h1>
        <div style={{ width: "120px" }}></div>
      </div>
      {/* Hero Section */}
      <div className="disease-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FiActivity size={48} />
          </div>

          <p>
            Learn about common airborne diseases and their relationship with air
            quality
          </p>

          {/* Search Bar */}
          <div className="search-wrapper">
            <div className="search-icon">
              <FiSearch size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diseases, symptoms, or pollutants..."
              className="search-input"
            />
          </div>

          {/* Stats Overview */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{diseases.length}</div>
              <div className="stat-label">Diseases Tracked</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{filteredDiseases.length}</div>
              <div className="stat-label">Search Results</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {diseases.reduce((acc, d) => acc + d.pollutants.length, 0)}
              </div>
              <div className="stat-label">Pollutants Listed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Cards Section */}
      <div className="disease-cards-container">
        <div className="disease-grid">
          {filteredDiseases.map((disease, index) => (
            <div
              key={disease.name}
              className="disease-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div className="disease-card-header">
                <div className="header-left">
                  <div
                    className="icon-wrapper"
                    style={{ backgroundColor: `${disease.color}15` }}
                  >
                    <div style={{ color: disease.color }}>{disease.icon}</div>
                  </div>
                  <div>
                    <h2 className="disease-name">{disease.name}</h2>
                    <span
                      className={`severity-badge ${getSeverityBadge(
                        disease.severity
                      )}`}
                    >
                      {disease.severity}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleSpeech(disease)}
                  className={`speech-button ${
                    speakingDisease === disease.name ? "speaking" : ""
                  }`}
                  aria-label={
                    speakingDisease === disease.name ? "Stop" : "Listen"
                  }
                >
                  {speakingDisease === disease.name ? (
                    <FiVolumeX size={20} />
                  ) : (
                    <FiVolume2 size={20} />
                  )}
                </button>
              </div>

              {/* Card Content */}
              <div className="disease-card-content">
                {/* Symptoms */}
                <div className="info-section">
                  <h3 className="section-title">
                    <FiActivity size={16} style={{ color: disease.color }} />
                    Symptoms
                  </h3>
                  <ul className="symptoms-list">
                    {disease.symptoms.map((symptom) => (
                      <li key={symptom}>
                        <span
                          className="bullet"
                          style={{ backgroundColor: disease.color }}
                        />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Causes */}
                <div className="info-section">
                  <h3 className="section-title">
                    <FiAlertCircle size={16} style={{ color: disease.color }} />
                    Caused By
                  </h3>
                  <p className="causes-text">{disease.causes}</p>
                </div>

                {/* Pollutants */}
                <div className="info-section">
                  <h3 className="section-title">
                    <FiWind size={16} style={{ color: disease.color }} />
                    Major Pollutants
                  </h3>
                  <div className="pollutant-tags">
                    {disease.pollutants.map((pollutant) => (
                      <span
                        key={pollutant}
                        className="pollutant-tag"
                        style={{
                          backgroundColor: `${disease.color}15`,
                          color: disease.color,
                          borderColor: `${disease.color}30`,
                        }}
                      >
                        {pollutant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="disease-card-footer"></div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredDiseases.length === 0 && (
          <div className="no-results">
            <FiAlertCircle size={64} />
            <h3>No diseases found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Information Banner */}
      <div className="info-banner">
        <div className="banner-icon">
          <FiAlertCircle size={24} />
        </div>
        <div className="banner-content">
          <h3>Important Notice</h3>
          <p>
            This information is for educational purposes only. If you experience
            any of these symptoms, please consult a healthcare professional for
            proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiseaseInfoPage;
