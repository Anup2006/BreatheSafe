import mongoose from "mongoose";

const healthFormSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    chronicDiseases: {
      type: [String],
      default: [],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    consent: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const HealthForm = mongoose.model("HealthForm", healthFormSchema);
