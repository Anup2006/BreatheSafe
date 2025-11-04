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

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false,
  }),
  (req, res) => {
    // Issue JWT
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // Redirect with token
res.redirect(`${process.env.FRONTEND_URL}/app?token=${token}`);
    console.log("successfuly logged in with google");
    
  }
);

export default router;
