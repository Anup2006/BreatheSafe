import HealthAssessment from "../models/HealthAssessment.js";

// ➤ Submit Health Assessment
export const submitAssessment = async (req, res) => {
  try {
    const { name, age, symptoms, other, consent } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!age || isNaN(age) || age < 0 || age > 120) {
      return res.status(400).json({
        success: false,
        message: "Valid age between 0 and 120 is required",
      });
    }

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one symptom must be selected",
      });
    }

    const assessment = new HealthAssessment({
      userId: req.userId,
      name: name.trim(),
      age: Number(age),
      symptoms,
      other: other || "",
      consent,
      timestamp: new Date(),
    });

    await assessment.save();
    res.status(201).json({
      success: true,
      message: "Health assessment submitted successfully",
      assessment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting assessment",
      error: error.message,
    });
  }
};

// ➤ Get User’s Assessments
export const getMyAssessments = async (req, res) => {
  try {
    const assessments = await HealthAssessment.find({
      userId: req.userId,
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      assessments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching assessments",
      error: error.message,
    });
  }
};

// ➤ Get Assessment by ID
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await HealthAssessment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.json({
      success: true,
      assessment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching assessment",
      error: error.message,
    });
  }
};
