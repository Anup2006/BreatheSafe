import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String }, // hashed password
    phone: { type: String },
    googleId: { type: String }, // for Google OAuth users
    type: { type: String, default: "regular" },
    triggers: { type: [String], default: [] },
    medicalHistory: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    airQualityPreferences: { type: Object, default: {} },
    predictions: { type: [Object], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
