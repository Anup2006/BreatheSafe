import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Twilio from "twilio";
import sendOtpEmail from '../utils/sendOtpEmail.js';
import bcrypt from "bcryptjs";

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Helper: generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Complete signup (phone + optional email)
export const completeSignup = async (req, res) => {
  try {
    const { phone, name, password, email } = req.body;

    // Validation
    if (!phone || !name || !password) {
      return res.status(400).json({ message: "Phone, name, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user details
    user.name = name;

    // Only update email if provided and not already set
    if (email && (!user.email || user.email.trim() === "")) {
      user.email = email;
      user.isEmailVerified = false; // mark email unverified, can send OTP separately
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);

    // Mark phone as verified if not already
    user.isPhoneVerified = true;

    await user.save();

    // Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Signup completed successfully", token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete signup", error: err.message });
  }
};
// Update user
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Prevent updates to protected fields
    const restrictedFields = ["_id", "email", "emailOtp", "emailOtpExpiry", "phoneOtp", "phoneOtpExpiry", "googleId", "isEmailVerified", "isPhoneVerified"];
    restrictedFields.forEach((field) => delete updates[field]);

    // Password hashing handled by model pre-save
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Signup with email OTP
export const signup = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const existingUser = await User.findOne({ email });

    const otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ error: 'User already registered and verified with this email' });
      }
      // Resend OTP
      existingUser.emailOtp = otp;
      existingUser.emailOtpExpiry = otpExpiry;
      await existingUser.save();
      await sendOtpEmail(existingUser.email, otp);

      return res.status(200).json({ message: 'OTP resent. Please verify your email.', email: existingUser.email });
    }

    // New user
    const user = new User({ name, email, password, phone, emailOtp: otp, emailOtpExpiry: otpExpiry });
    await user.save();
    await sendOtpEmail(user.email, otp);

    res.status(201).json({ message: 'OTP sent. Please verify your email.', email: user.email });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
// Send Email OTP
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) {
      // If user does not exist, create a temporary user with only email
      user = new User({ email });
    }

    const otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.emailOtp = otp;
    user.emailOtpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(user.email, otp); // your existing utility

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// Login
// Login (email or phone)
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    let user;
    if (email) {
      user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!user.isEmailVerified) {
        const otp = generateOtp();
        user.emailOtp = otp;
        user.emailOtpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendOtpEmail(user.email, otp);

        return res.status(403).json({ error: 'Please verify your email using the OTP sent' });
      }

    } else if (phone) {
      user = await User.findOne({ phone }).select("+password");
      console.log(user);
      console.log(phone,password);
      console.log(!user);
      console.log(await user.comparePassword(password));
      console.log("Stored hash:", user.password);
console.log("Entered password:", password);
     if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid Phones or password" });
      }

      if (!user.isPhoneVerified) {
        const otp = generateOtp();
        user.phoneOtp = otp;
        user.phoneOtpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await twilioClient.messages.create({
          body: `Your BreatheSafeAI OTP is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });

        return res.status(403).json({ error: 'Please verify your phone using the OTP sent' });
      }

    } else {
      return res.status(400).json({ error: "Please provide email or phone to login" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Verify Email OTP
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isEmailVerified) return res.status(400).json({ error: 'Already verified' });

    if (user.emailOtp !== otp || user.emailOtpExpiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Email verified', token,user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Send Phone OTP
export const phoneSendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    let user = await User.findOne({ phone });
    if (!user) user = new User({ phone });

    user.phoneOtp = otp;
    user.phoneOtpExpiry = otpExpiry;
    await user.save();

    await twilioClient.messages.create({
      body: `Your BreatheSafeAI OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify Phone OTP
export const phoneVerifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || user.phoneOtp !== otp || user.phoneOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
