import mongoose from "mongoose";

const healthAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 120,
  },
  symptoms: [
    {
      type: String,
      required: true,
    },
  ],
  other: {
    type: String,
    default: "",
  },
  consent: {
    type: Boolean,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster queries
healthAssessmentSchema.index({ userId: 1, timestamp: -1 });

const HealthAssessment = mongoose.model(
  "HealthAssessment",
  healthAssessmentSchema
);

export default HealthAssessment;
