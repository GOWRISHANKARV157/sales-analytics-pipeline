import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { db } from "../prisma/db.js";
import {processUpload,type CsvRow} from "../services/upload.service.js";
import { parse } from "csv-parse/sync";
import fs from "fs/promises";

export async function processUploadedFile(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const uploadId = Number(req.params.id);

        if (!Number.isInteger(uploadId)) {
            return res.status(400).json({
                message: "Invalid upload ID"
            });
        }

        const upload = await db.orm.public.Upload
            .where({ id: uploadId })
            .first();

        if (!upload) {
            return res.status(404).json({
                message: "Upload not found"
            });
        }

        if (upload.userId !== req.user.userId) {
            return res.status(403).json({
                message: "You do not have access to this upload"
            });
        }

        if (upload.status === "PROCESSING") {
            return res.status(409).json({
                message: "Upload is already being processed"
            });
        }

        if (upload.status === "COMPLETED") {
            return res.status(409).json({
                message: "Upload has already been processed. Use analytics endpoints to re-run reports."
            });
        }

        const fileContent = await fs.readFile(upload.filePath);

        const rows = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }) as CsvRow[];

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({
                message: "CSV file is empty"
            });
        }

        const result = await processUpload(
            upload.id,
            rows
        );

        return res.status(200).json({
            message: "File processed successfully",
            uploadId: upload.id,
            result
        });

    } catch (error) {
        console.error("Processing error:", error);

        return res.status(500).json({
            message: "Failed to process upload"
        });
    }
}