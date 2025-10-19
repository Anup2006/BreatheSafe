import express from "express";
import passport from "passport";
import {
  signup,
  login,
  getCurrentUser,
  updateUser,
  phoneSendOtp,
  phoneVerifyOtp,
} from "../controllers/user.controllers.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Email/Password
router.post("/signup", signup);
router.post("/login", login);

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
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);

export default router;
