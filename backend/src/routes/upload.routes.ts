import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../config/upload.js";
import { processUploadedFile } from "../controllers/process.controller.js";
import { getUploadStatus } from "../controllers/status.controller.js";
import { generateUploadAnalytics, getUploadAnalytics , getDashboard } from "../controllers/analytics.controller.js";


const router = Router();

router.post("/", authenticate, upload.single("file"), uploadFile);

router.post("/:id/process", authenticate, processUploadedFile);

router.get("/:id/status", authenticate, getUploadStatus);

router.post("/:id/analytics", authenticate, generateUploadAnalytics);

router.get("/:id/analytics", authenticate, getUploadAnalytics);

router.get("/:id/dashboard", authenticate, getDashboard);

export default router;