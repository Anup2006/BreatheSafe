import { useEffect } from "react";
import { motion } from "framer-motion";
import News from "./News";
import Description from "./Description";
import Tweets from "./Tweets";
import Videos from "./Videos";
import "./Content.css";
import AirQuality from "./AirQuality";
import ChatBot from "./ChatBot";

export default function Content() {
  return (
    <motion.div
      className="content-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div whileHover={{ scale: 1.01 }}>
        <News />
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Description />
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <AirQuality />
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <ChatBot />
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Videos />
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Tweets />
      </motion.div>
    </motion.div>
  );
}
