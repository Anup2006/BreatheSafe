import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  submitHealthForm,
  getReports,
} from "../controllers/health.controllers.js";

const router = express.Router();

router.route("/assessment").post(requireAuth, submitHealthForm);
router.route("/reports").post(requireAuth, getReports);

export default router;
