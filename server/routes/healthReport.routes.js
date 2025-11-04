import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  generateHealthReport,
  getMyReports,
  getReportById,
  getReportCount,
} from "../controllers/healthReport.controller.js";

const router = express.Router();

router.post("/generate", requireAuth, generateHealthReport);
router.get("/my-reports", requireAuth, getMyReports);
router.get("/reports/:id", requireAuth, getReportById);
router.get("/count", requireAuth, getReportCount);

export default router;
