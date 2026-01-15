import "./BeatTheAQI.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";

const PAR_AQI = 120;
const EXCELLENT_AQI = 90;

const quizData = [
  {
    question: "How do you commute today?",
    options: [
      { text: "Drive alone in a petrol car", impact: +15 },
      { text: "Public transport or carpool", impact: -20 },
      { text: "Work from home", impact: -30 },
      { text: "Bike without mask", impact: +10 },
    ],
  },
  {
    question: "It’s cold outside. What do you do?",
    options: [
      { text: "Burn wood or coal", impact: +25 },
      { text: "Use electric heater", impact: -10 },
      { text: "Wear warm clothes instead", impact: -20 },
      { text: "Light incense indoors", impact: +15 },
    ],
  },
  {
    question: "You notice garbage being burned nearby.",
    options: [
      { text: "Ignore and move on", impact: +15 },
      { text: "Politely ask them to stop", impact: -15 },
      { text: "Report to authorities", impact: -25 },
      { text: "Join them briefly", impact: +30 },
    ],
  },
  {
    question: "What fuel is used in your kitchen?",
    options: [
      { text: "Coal / wood", impact: +20 },
      { text: "LPG / PNG", impact: -15 },
      { text: "Electric induction", impact: -20 },
      { text: "Mixed usage", impact: +5 },
    ],
  },
  {
    question: "Stepping out during peak pollution hours?",
    options: [
      { text: "No mask", impact: +20 },
      { text: "Cloth mask", impact: +5 },
      { text: "N95 mask", impact: -15 },
      { text: "Avoid peak hours", impact: -25 },
    ],
  },
  {
    question: "Trees around your home?",
    options: [
      { text: "None nearby", impact: +10 },
      { text: "Few roadside trees", impact: -5 },
      { text: "Park or green zone nearby", impact: -15 },
      { text: "I actively plant trees", impact: -25 },
    ],
  },
];

const getAward = (finalAQI) => {
  if (finalAQI <= EXCELLENT_AQI) {
    return {
      id: "green_champion",
      title: "Green Champion 🌿",
      description: "Exceptional choices for cleaner air",
    };
  }
  if (finalAQI <= PAR_AQI) {
    return {
      id: "air_aware",
      title: "Air Aware Citizen 💨",
      description: "Your choices helped improve air quality",
    };
  }
  return null;
};

export default function BeatTheAQI() {
  const { awards, addAward } = useAuth();
  const [params] = useSearchParams();

  const START_AQI = Number(params.get("aqi")) || 220;
  const city = params.get("city") || "Your City";

  const [aqi, setAqi] = useState(START_AQI);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [delta, setDelta] = useState(null);
  const [earnedAward, setEarnedAward] = useState(null);

  const handleAnswer = (impact) => {
    setDelta(impact);
    setAqi((prev) => Math.max(0, prev + impact));

    setTimeout(() => {
      setDelta(null);
      if (index === quizData.length - 1) setFinished(true);
      else setIndex((i) => i + 1);
    }, 350);
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
    setEarnedAward(null);
  };

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <h1>BreatheSafe Quiz</h1>
        <p className="quiz-subtitle">
          {city} is facing poor air. Your choices matter.
        </p>
      </header>

      {/* AQI Card */}
      <div className="quiz-aqi-card">
        <div className="quiz-aqi-value">
          {city}: {aqi}
        </div>
        <div className="quiz-aqi-status">
          {aqi <= 100 ? "Moderate" : aqi <= 200 ? "Poor" : "Very Poor"}
        </div>

        {delta !== null && (
          <div
            className={`quiz-aqi-delta ${delta < 0 ? "negative" : "positive"}`}
          >
            {delta > 0 ? `+${delta}` : delta}
          </div>
        )}
      </div>

      {/* Quiz Body */}
      {!finished ? (
        <div className="quiz-card">
          <div className="quiz-progress">
            Question {index + 1} of {quizData.length}
          </div>

          <h2 className="quiz-question">{quizData[index].question}</h2>

          <div className="quiz-options">
            {quizData[index].options.map((opt, i) => (
              <button
                key={i}
                className="quiz-option-btn"
                onClick={() => handleAnswer(opt.impact)}
              >
                {opt.text}
                <br></br>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="quiz-result-card">
          <h2 className="quiz-result-title">Quiz Complete</h2>

          <p className="quiz-result-desc">
            Final AQI: <strong>{aqi}</strong>
          </p>

          <p className="quiz-result-desc">
            {aqi <= PAR_AQI
              ? "Your decisions made the air healthier 🌱"
              : "The air still struggles. Try again tomorrow."}
          </p>

          {earnedAward && (
            <div className="quiz-award-box">
              <h3>{earnedAward.title}</h3>
              <p>{earnedAward.description}</p>
              <span>Saved to your profile</span>
            </div>
          )}

          <button className="quiz-primary-btn" onClick={resetQuiz}>
            Retry Quiz
          </button>
        </div>
      )}
    </div>
  );
}
