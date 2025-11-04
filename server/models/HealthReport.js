import mongoose from "mongoose";

const healthReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    name: String
  },
  aqiData: {
    value: Number,
    status: String,
    pollutants: [{
      name: String,
      label: String,
      value: Number,
      unit: String
    }],
    timestamp: Date
  },
  healthData: {
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    symptoms: [String],
    other: String,
    assessmentDate: Date
  },
  report: {
    userProfile: {
      name: String,
      age: Number,
      ageGroup: String,
      riskLevel: String
    },
    generalRecommendations: [String],
    ageSpecificRecommendations: [String],
    healthSpecificRecommendations: [String],
    medicationRecommendations: {
      general: String,
      specific: {
        type: Map,
        of: String
      },
      disclaimer: String
    },
    activityGuidelines: {
      outdoor: String,
      indoor: String,
      exercise: String
    },
    protectiveMeasures: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
});

// Add index for faster queries
healthReportSchema.index({ userId: 1, timestamp: -1 });

const HealthReport = mongoose.model('HealthReport', healthReportSchema);

export default  HealthReport;
