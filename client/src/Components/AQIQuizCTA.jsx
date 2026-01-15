import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AQIQuizCTA({ aqi, city }) {
  const navigate = useNavigate();

  const getMessage = () => {
    if (aqi > 200) return "This AQI won’t fix itself 😷";
    if (aqi > 100) return "Air looks bad. Want to help? 🌫️";
    return "Curious how choices affect air? 🌱";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 flex justify-center"
    >
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        animate={
          aqi > 200
            ? {
                boxShadow: [
                  "0 0 0 rgba(0,0,0,0)",
                  "0 0 18px rgba(46,196,182,0.6)",
                  "0 0 0 rgba(0,0,0,0)",
                ],
              }
            : {}
        }
        transition={{ repeat: aqi > 200 ? Infinity : 0, duration: 2 }}
        onClick={() => navigate(`/app/aqi-quiz?aqi=${aqi}&city=${city}`)}
        style={{
          backgroundColor: "#2ec4b6",
        }}
        className="px-7 py-3 rounded-xl text-white font-semibold tracking-wide shadow-lg"
      >
        {getMessage()}
      </motion.button>
    </motion.div>
  );
}
