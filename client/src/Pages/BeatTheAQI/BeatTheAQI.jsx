import "./BeatTheAQI.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";

const PAR_AQI = 100; // Target to beat
const EXCELLENT_AQI = 50; // Challenge goal

const quizData = [
  {
    question: "How do you commute today?",
    category: "Transport",
    options: [
      { text: "Drive alone in a petrol car", impact: +25, feedback: "Exhaust fumes added! 🚗💨" },
      { text: "Public transport or carpool", impact: -15, feedback: "Traffic reduced! 🚌" },
      { text: "Work from home", impact: -30, feedback: "Zero commute emissions! 🏠" },
      { text: "Bike without mask", impact: +10, feedback: "Health risk increased! 🚴" },
    ],
  },
  {
    question: "It’s cold outside. What do you do?",
    category: "Household",
    options: [
      { text: "Burn wood or coal", impact: +40, feedback: "Heavy particulate matter released! 🔥" },
      { text: "Use electric heater", impact: -5, feedback: "Clean localized heat. ⚡" },
      { text: "Wear warm clothes instead", impact: -15, feedback: "No energy consumed! 🧥" },
      { text: "Light incense indoors", impact: +15, feedback: "Indoor smoke accumulation. 🕯️" },
    ],
  },
  {
    question: "You notice garbage being burned nearby.",
    category: "Community",
    options: [
      { text: "Ignore and move on", impact: +10, feedback: "Passive pollution continues. 😒" },
      { text: "Politely ask them to stop", impact: -10, feedback: "Source reduced slightly. 🗣️" },
      { text: "Report to authorities", impact: -35, feedback: "Major pollution source stopped! 🚨" },
      { text: "Join them briefly", impact: +20, feedback: "Direct exposure to toxins! ☠️" },
    ],
  },
  {
    question: "What fuel is used in your kitchen?",
    category: "Household",
    options: [
      { text: "Coal / wood", impact: +35, feedback: "High indoor pollution! 🌫️" },
      { text: "LPG / PNG", impact: -10, feedback: "Cleaner burning fuel. 🔥" },
      { text: "Electric induction", impact: -25, feedback: "Zero kitchen emissions. 🍳" },
      { text: "Mixed usage", impact: +5, feedback: "Inconsistent emissions. 📉" },
    ],
  },
];

const getAward = (finalAQI) => {
  if (finalAQI <= EXCELLENT_AQI) {
    return {
      id: "green_champion",
      title: "Green Champion 🌿",
      description: "You kept the air pristine!",
    };
  }
  if (finalAQI <= PAR_AQI) {
    return {
      id: "air_aware",
      title: "Air Aware Citizen 💨",
      description: "You successfully lowered pollution levels.",
    };
  }
  return null;
};

// Helper to get color based on AQI value
const getAQIColor = (val) => {
  if (val <= 50) return "#16a34a";   // Darker Green (Readable)
  if (val <= 100) return "#d97706";  // Dark Golden/Mustard (Readable Yellow)
  if (val <= 150) return "#ea580c";  // Dark Orange
  if (val <= 200) return "#dc2626";  // Red
  if (val <= 300) return "#7e22ce";  // Purple
  return "#991b1b";                  // Dark Maroon
};

export default function BeatTheAQI() {
  const { awards, addAward } = useAuth();
  const [params] = useSearchParams();

  const START_AQI = Number(params.get("aqi")) || 220;
  const city = params.get("city") || "Your City";

  const [aqi, setAqi] = useState(START_AQI);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  
  // New state for better feedback
  const [feedback, setFeedback] = useState(null); 
  const [delta, setDelta] = useState(null);
  const [earnedAward, setEarnedAward] = useState(null);

  const handleAnswer = (option) => {
    let rawImpact = option.impact;

    // --- 🚀 NEW LOGIC: DYNAMIC SCALING ---
    // If AQI is already bad (>250), bad choices hurt MORE (1.5x damage)
    // If AQI is already good (<50), good choices help LESS (diminishing returns)
    if (aqi > 250 && rawImpact > 0) {
      rawImpact = Math.round(rawImpact * 1.5);
    } else if (aqi < 50 && rawImpact < 0) {
      rawImpact = Math.round(rawImpact * 0.5);
    }

    setDelta(rawImpact);
    setFeedback(option.feedback);
    
    // Smooth transition logic (optional clamp)
    setAqi((prev) => Math.max(10, Math.min(500, prev + rawImpact)));

    setTimeout(() => {
      setDelta(null);
      setFeedback(null);
      if (index === quizData.length - 1) setFinished(true);
      else setIndex((i) => i + 1);
    }, 1200); // Increased delay slightly to let user read feedback
  };

  useEffect(() => {
    if (!finished) return;
    const award = getAward(aqi);
    if (award && !awards.some((a) => a.id === award.id)) {
      addAward({ ...award, earnedAt: new Date().toISOString() });
      setEarnedAward(award);
    }
  }, [finished]);

  const resetQuiz = () => {
    setAqi(START_AQI);
    setIndex(0);
    setFinished(false);
    setDelta(null);
    setFeedback(null);
    setEarnedAward(null);
  };

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <h1>BreatheSafe Quiz</h1>
        <p className="quiz-subtitle">
          Save {city} from pollution. Current status: 
          <span style={{ fontWeight: "bold", marginLeft: "6px", color: getAQIColor(aqi) }}>
             {aqi <= 100 ? "Breathable" : "Choking"}
          </span>
        </p>
      </header>

      {/* AQI Scoreboard */}
      <div className="quiz-aqi-card" style={{ borderColor: getAQIColor(aqi) }}>
        <div className="quiz-aqi-value" style={{ color: getAQIColor(aqi) }}>
          AQI: {aqi}
        </div>

        {/* Dynamic Feedback Overlay */}
        {delta !== null && (
          <div className={`quiz-feedback-overlay ${delta < 0 ? "good-choice" : "bad-choice"}`}>
            <div className="feedback-delta">
              {delta > 0 ? `+${delta} 😷` : `${delta} 🍃`}
            </div>
            <div className="feedback-text">{feedback}</div>
          </div>
        )}
      </div>

      {/* Quiz Area */}
      {!finished ? (
        <div className="quiz-card">
          <div className="quiz-progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((index) / quizData.length) * 100}%` }}
            ></div>
          </div>
          
          <h2 className="quiz-question">{quizData[index].question}</h2>

          <div className="quiz-options">
            {quizData[index].options.map((opt, i) => (
              <button
                key={i}
                className="quiz-option-btn"
                onClick={() => handleAnswer(opt)}
                disabled={delta !== null} // Prevent double clicking
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="quiz-result-card">
          <h2 className="quiz-result-title">Test Over</h2>
          
          <div className="quiz-final-score">
            Final AQI: <span style={{ color: getAQIColor(aqi) }}>{aqi}</span>
          </div>

          <p className="quiz-result-desc">
            {aqi <= PAR_AQI
              ? "🎉 Great work! You made the city breathable again."
              : "⚠️ The pollution levels are still dangerous. Better choices are needed."}
          </p>

          {earnedAward && (
            <div className="quiz-award-box">
              <h3>{earnedAward.title}</h3>
              <p>{earnedAward.description}</p>
            </div>
          )}

          <button className="quiz-primary-btn" onClick={resetQuiz}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}