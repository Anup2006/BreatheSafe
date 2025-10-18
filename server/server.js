import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./config/DB.config.js";

dotenv.config();

ConnectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("BreatheSafeAI Backend Running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
