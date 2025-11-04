import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },  
    email: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String },           // OTP for email verification
    emailOtpExpiry: { type: Date },

    password: { type: String, select: false },
    phone: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    phoneOtp: { type: String },           // OTP for phone verification
    phoneOtpExpiry: { type: Date },

    googleId: { type: String },
    type: { type: String, default: "regular" },
    triggers: { type: [String], default: [] },
    medicalHistory: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    airQualityPreferences: { type: Object, default: {} },
    predictions: { type: [Object], default: [] },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Prevent double hashing
  const isAlreadyHashed = this.password.startsWith("$2b$");
  if (isAlreadyHashed) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// Password comparison helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Clean output (remove sensitive info)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.phoneOtp;
  delete obj.phoneOtpExpiry;
  delete obj.emailOtp;
  delete obj.emailOtpExpiry;
  return obj;
};

export default mongoose.model("User", userSchema);
