import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../config/upload.js";
import { processUploadedFile } from "../controllers/process.controller.js";
import { getUploadStatus } from "../controllers/status.controller.js";
import { generateUploadAnalytics, getUploadAnalytics , getDashboard } from "../controllers/analytics.controller.js";
import { downloadProcessedCsv } from "../controllers/download.controller.js";
import { getUserUploads } from "../controllers/uploads.controller.js";

const router = Router();

router.get("/", authenticate, getUserUploads);

router.post("/", authenticate, upload.single("file"), uploadFile);

router.post("/:id/process", authenticate, processUploadedFile);

router.get("/:id/status", authenticate, getUploadStatus);

router.post("/:id/analytics", authenticate, generateUploadAnalytics);

router.get("/:id/analytics", authenticate, getUploadAnalytics);

router.get("/:id/dashboard", authenticate, getDashboard);

router.get("/:id/download", authenticate, downloadProcessedCsv);

export default router;