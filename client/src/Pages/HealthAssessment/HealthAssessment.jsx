import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiActivity,
  FiAlertCircle,
  FiFileText,
  FiSend,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import "./HealthAssessment.css";

const initialForm = {
  name: "",
  age: "",
  chronicDiseases: [],
  symptoms: [],
  additionalNotes: "",
  consent: false, // ✅ Added consent
};

const chronicDiseaseOptions = [
  "Asthma",
  "Bronchitis",
  "COPD",
  "Pneumonia",
  "Sinusitis",
  "Tuberculosis",
  "Lung Cancer",
  "Cystic Fibrosis",
  "Pulmonary Fibrosis",
  "Pulmonary Hypertension",
  "Sleep Apnea",
  "Bronchiectasis",
  "Pleurisy",
  "Emphysema",
  "Sarcoidosis",
];

const symptomOptions = [
  "Fever",
  "Cough",
  "Breathlessness",
  "Chest Pain",
  "Wheezing",
  "Chest Tightness",
  "Rapid Breathing",
  "Coughing up Blood",
  "Blue Lips or Fingernails",
  "High Fever",
  "Severe Headache",
  "Loss of Smell/Taste",
  "Night Sweats",
  "Fatigue",
  "Loss of Appetite",
];

export default function ResponsiveHorizontalForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("chronicDiseases");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "chronicDiseases" || name === "symptoms") {
        setForm((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }));
      } else if (name === "consent") {
        setForm((prev) => ({ ...prev, consent: checked }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!form.age || isNaN(form.age) || Number(form.age) < 0) {
      toast.error("Please enter a valid age");
      return false;
    }
    if (!form.consent) {
      toast.error("Please accept the consent agreement");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to submit health assessment");
        navigate("/auth");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/health/assessment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Backend extracts userId from this
          },
          body: JSON.stringify({
            // ✅ No userId - backend gets it from token
            name: form.name.trim(),
            age: Number(form.age),
            chronicDiseases: form.chronicDiseases,
            symptoms: form.symptoms,
            additionalNotes: form.additionalNotes.trim(),
            consent: form.consent, // ✅ Include consent
            timestamp: new Date().toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }

      if (data.success) {
        toast.success("Health assessment submitted successfully!");
        setForm(initialForm);

        // Optional: Navigate to dashboard after success
        setTimeout(() => {
          navigate("/app/health-report");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to submit health assessment");
      }
    } catch (error) {
      console.error("Error submitting health assessment:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    toast.info("Form has been reset");
  };

  return (
    <div className="health-assessment-container">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Hero Header */}
      <div className="assessment-hero">
        <div className="hero-icon">
          <FiActivity size={40} />
        </div>
        <h1>Respiratory Health Assessment</h1>
        <p>
          Help us understand your health condition for personalized
          recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="assessment-form">
        {/* Personal Information Section */}
        <div className="form-section">
          <div className="section-header">
            <FiUser className="section-icon" />
            <h2>Personal Information</h2>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="age">
                Age <span className="required">*</span>
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="150"
                value={form.age}
                onChange={handleChange}
                required
                placeholder="Enter your age"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="selection-summary">
          <div className="summary-item">
            <span className="summary-label">Chronic Diseases:</span>
            <span className="summary-count">
              {form.chronicDiseases.length} selected
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Symptoms:</span>
            <span className="summary-count">
              {form.symptoms.length} selected
            </span>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="form-section">
          <div className="section-header">
            <FiAlertCircle className="section-icon" />
            <h2>Health Conditions</h2>
          </div>

          <div className="tabs-container">
            <div className="tabs-header">
              <button
                type="button"
                onClick={() => setActiveTab("chronicDiseases")}
                className={`tab-button ${
                  activeTab === "chronicDiseases" ? "active" : ""
                }`}
              >
                <FiActivity size={16} />
                Chronic Diseases ({form.chronicDiseases.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("symptoms")}
                className={`tab-button ${
                  activeTab === "symptoms" ? "active" : ""
                }`}
              >
                <FiAlertCircle size={16} />
                Current Symptoms ({form.symptoms.length})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "chronicDiseases" ? (
                <div className="checkbox-grid">
                  {chronicDiseaseOptions.map((disease) => (
                    <label key={disease} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="chronicDiseases"
                        value={disease}
                        checked={form.chronicDiseases.includes(disease)}
                        onChange={handleChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{disease}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="checkbox-grid">
                  {symptomOptions.map((symptom) => (
                    <label key={symptom} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="symptoms"
                        value={symptom}
                        checked={form.symptoms.includes(symptom)}
                        onChange={handleChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{symptom}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Notes Section */}
        <div className="form-section">
          <div className="section-header">
            <FiFileText className="section-icon" />
            <h2>Additional Information</h2>
          </div>

          <div className="input-group">
            <label htmlFor="additionalNotes">
              Additional Notes
              <span className="optional-text">
                (Other conditions or symptoms not listed above)
              </span>
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={form.additionalNotes}
              onChange={handleChange}
              rows={4}
              placeholder="Please mention any other conditions, allergies, or symptoms you are experiencing..."
              className="form-textarea"
            />
          </div>
        </div>

        {/* Consent Section */}
        <div className="form-section consent-section">
          <div className="section-header">
            <FiShield className="section-icon" />
            <h2>Privacy & Consent</h2>
          </div>

          <label className="consent-label">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              required
              className="consent-checkbox"
            />
            <span className="consent-text">
              I consent to the collection and processing of my health
              information for the purpose of receiving personalized air quality
              and health recommendations. I understand that my data will be kept
              confidential and secure.
              <span className="required"> *</span>
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" onClick={handleReset} className="btn-secondary">
            <FiRefreshCw size={18} />
            Reset Form
          </button>
          <button
            type="submit"
            disabled={submitting || !form.consent}
            className="btn-primary"
          >
            {submitting ? (
              <>
                <div className="spinner"></div>
                Submitting...
              </>
            ) : (
              <>
                <FiSend size={18} />
                Submit Assessment
              </>
            )}
          </button>
        </div>
      </form>

      {/* Information Banner */}
      <div className="info-banner">
        <FiAlertCircle size={24} />
        <div>
          <h3>Privacy Notice</h3>
          <p>
            Your health information is confidential and will only be used to
            provide personalized air quality recommendations. We do not share
            your data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
