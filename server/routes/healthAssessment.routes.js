import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  submitAssessment,
  getMyAssessments,
  getAssessmentById,
} from "../controllers/healthAssessment.controller.js";

const router = express.Router();

router.post("/", requireAuth, submitAssessment);
router.get("/my-assessments", requireAuth, getMyAssessments);
router.get("/:id", requireAuth, getAssessmentById);

export default router;
