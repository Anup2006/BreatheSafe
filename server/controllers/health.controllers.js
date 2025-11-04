import { HealthForm } from "../models/healthForm.model.js";

export const submitHealthForm = async (req, res) => {
  try {
    const { name, age, chronicDiseases, symptoms, additionalNotes, consent } =
      req.body;

    // ✅ Validate required fields
    if (!name || !age || consent === undefined) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing required fields" });
    }

    // ✅ Create a new record linked to logged-in user
    const newForm = new HealthForm({
      user: req.user._id,
      name: name.trim(),
      age: Number(age),
      chronicDiseases: chronicDiseases || [],
      symptoms: symptoms || [],
      additionalNotes: additionalNotes?.trim() || "",
      consent,
      timestamp: new Date().toISOString(),
    });

    await newForm.save();

    res.status(201).json({
      success: true,
      message: "Health form submitted successfully",
      data: newForm,
    });
  } catch (err) {
    console.error("Error saving health form:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const getReports = () => {};
