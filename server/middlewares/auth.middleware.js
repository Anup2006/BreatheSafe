import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId || decoded.id || decoded._id;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure. Please log in again.",
      });
    }

    // Optional: Attach full user data if needed
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId || decoded.id || decoded._id;
      req.user = decoded;
    }

    next();
  } catch (err) {
    // Don't fail - just continue without userId
    next();
  }
};
