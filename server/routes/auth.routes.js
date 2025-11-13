import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import {
  signup,
  login,
  getCurrentUser,
  updateUser,
  phoneSendOtp,
  phoneVerifyOtp,
  completeSignup ,
  verifyEmailOtp,
  sendEmailOtp
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
const isProduction = process.env.NODE_ENV === "production";

const FRONTEND_URL = isProduction
  ? process.env.FRONTEND_URL_PROD || "https://breathe-safe-s2xn.vercel.app"
  : process.env.FRONTEND_URL_DEV || "http://localhost:5173";
const router = express.Router();

// Email/Password
router.post("/signup", signup);
router.post("/login", login);
router.post("/phone/complete-signup", completeSignup);
router.post("/email/verify-otp", verifyEmailOtp);
router.post("/email/send-otp", sendEmailOtp);

// Phone OTP
router.post("/phone/send-otp", phoneSendOtp);
router.post("/phone/verify-otp", phoneVerifyOtp);

// Protected
router.get("/me", requireAuth, getCurrentUser);
router.put("/update", requireAuth, updateUser);

// Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      // Handles cancel or denied access
      return res.redirect(`${FRONTEND_URL}/auth?error=google_cancelled`);
    }

    // Success — issue JWT and redirect to app
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.redirect(`${FRONTEND_URL}/app?token=${token}`);
  })(req, res, next);
});


export default router;
