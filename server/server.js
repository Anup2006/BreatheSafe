import dotenv from "dotenv";
dotenv.config();
// console.log("🔍 ENV TEST:", {
//   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
//   GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
//   SESSION_SECRET: process.env.SESSION_SECRET,
//   FRONTEND_URL: process.env.FRONTEND_URL,
// });
// console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

import express from "express";
import cors from "cors";
import session from "express-session";
const { default: passport } = await import("./config/passport.config.js");
const { default: ConnectDB } = await import("./config/DB.config.js");
const { default: userRoutes } = await import("./routes/auth.routes.js");
const { default: healthAssessmentRoutes } = await import(
  "./routes/healthAssessment.routes.js"
);
const { default: healthReportRoutes } = await import(
  "./routes/healthReport.routes.js"
);

ConnectDB();

const app = express();
app.use(express.json());
const allowedOrigins = process.env.NODE_ENV === "production"
  ? process.env.FRONTEND_URL
  : "http://localhost:5173";
  console.log("CORS allowed origins:", allowedOrigins);
  console.log("NODE_ENV:", process.env.NODE_ENV);
app.use(cors({ origin:allowedOrigins || "http://localhost:5173", credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/health-assessment", healthAssessmentRoutes);
app.use("/api/health-report", healthReportRoutes);

// Test
app.get("/", (_, res) => res.send("BreatheSafeAI Backend Running 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
