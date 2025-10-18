import React, { useState } from 'react';
import { ShieldAlert, MapPin, Wind, Zap, Heart, MessageSquare, AlertTriangle } from 'lucide-react';
import './HealthInsights.css'; // Importing the custom styles

// Data structure for demonstration
const currentAlert = {
    city: "Pune, Maharashtra",
    userLocation: "Wakad, Pune",
    pm25: 145, // High value, indicating 'Hazardous'
    no2: 85,
    airQualityIndex: "Very Poor (305)",
    status: "Immediate Alert",
    forecast: "Conditions are expected to worsen in the next 4 hours.",
    prediction: "PM2.5 hotspot detected near your area (1.5km radius)."
};

// Simplified advice tailored for high pollution levels (for an asthma patient)
const advice = [
    { icon: Heart, text: "Stay Indoors. Avoid all non-essential outdoor activity." },
    { icon: ShieldAlert, text: "Ensure quick-relief inhaler is immediately accessible." },
    { icon: Wind, text: "Run air purifier continuously, set to high filtration." },
    { icon: Zap, text: "Keep windows and doors tightly sealed." },
    { icon: MessageSquare, text: "Notify family/carer about the current alert status." },
];

const HealthInsights = () => {
    // We can add state for the chat messages later here
    return (
        <div className="insight-container">
            <header className="insight-header">
                <h1 className="insight-title">Personalized Health Insights</h1>
                <p className="insight-subtitle">Early Warning System for Asthma Risk Reduction</p>
            </header>

            {/* --- Alert Card (Warning/Prediction) --- */}
            <div className="alert-section">
                <div className="alert-header">
                    <AlertTriangle className="alert-icon" />
                    <h2 className="alert-title">AIR QUALITY EMERGENCY ALERT</h2>
                </div>
                <p className="alert-aqi">{currentAlert.status} (AQI: {currentAlert.airQualityIndex})</p>
                
                <div className="alert-details-grid">
                    <div className="alert-detail-item">
                        <p className="detail-label">Predicted Hotspot:</p>
                        <p className="detail-value">{currentAlert.prediction}</p>
                    </div>
                    <div className="alert-detail-item">
                        <p className="detail-label">Key Pollutants:</p>
                        <p className="detail-value-pollutant">
                            PM2.5: <span className="font-bold">{currentAlert.pm25} µg/m³</span> 
                            | NO₂: {currentAlert.no2} ppb
                        </p>
                    </div>
                    <div className="alert-detail-item">
                        <p className="detail-label">Location:</p>
                        <p className="detail-value location-text"><MapPin className="map-icon"/>{currentAlert.userLocation}</p>
                    </div>
                </div>
                <p className="alert-forecast">⚠️ {currentAlert.forecast}</p>
            </div>

            {/* --- Action Plan Section --- */}
            <div className="insight-card-section">
                <h3 className="card-heading">Immediate Action Plan</h3>
                <div className="action-plan-grid">
                    {advice.map((item, index) => (
                        <div key={index} className="insight-card action-card">
                            <div className="action-icon-wrapper">
                                <item.icon className="action-icon" />
                            </div>
                            <p className="action-text">{item.text.split('.')[0]}</p>
                            <p className="action-subtext">{item.text.split('.')[1] || ''}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* --- Historical Trends (Placeholder for Chart) --- */}
            <div className="insight-card chart-placeholder-card">
                <h3 className="card-heading">Your Recent Exposure & Response</h3>
                <p className="text-gray-600 mb-4">This section would feature charts comparing personalized air quality exposure to recorded symptom days.</p>
                <div className="chart-placeholder">
                    [Placeholder for detailed Chart showing PM2.5/NO₂ vs. Symptom Logs]
                </div>
            </div>

            

        </div>
    );
};

export default HealthInsights;
