import "./ImageAnimation.css";
// Path remains correct: Go up THREE levels to reach src, then go down into assets
import airQualityVideo from "../../../assets/air_quality.mp4";
import { motion } from "framer-motion";

export default function ImageAnimation() {
  return (
    <div className="image-animation-container">
      <video
        // 1. **Crucial Optimization:** Add preload="auto" to start fetching immediately.
        // 2. **Add dimensions:** Helps the browser reserve space instantly.
        //    (Adjust these width/height values to match your intended element size)
        width="1920"
        height="300"
        poster="https://via.placeholder.com/1200x300.png?text=BreatheSafe+AI+Video+Loading"
        autoPlay
        loop
        muted
        playsInline
        // Setting source to the imported file
        src={airQualityVideo}
        alt="Animated visualization of air quality data"
        // The style will ensure it fits the container, overriding the explicit dimensions
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        preload="auto"
      >
        {/* Fallback source for better browser compatibility (optional but recommended) */}
        {/* You would need to convert your mp4 to a webm file as well */}
        {/* <source src={airQualityVideo} type="video/mp4" /> */}
        Your browser does not support the video tag.
      </video>
      <div className="overlay-text">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Real-time Global Air Quality & Health Insights
        </motion.h1>
        <p>Monitoring the air we breathe to keep you informed and safe.</p>
      </div>
    </div>
  );
}
