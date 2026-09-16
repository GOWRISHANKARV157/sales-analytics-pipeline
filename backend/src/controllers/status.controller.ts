import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { db } from "../prisma/db.js";

export async function getUploadStatus(
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

        const progress =
            upload.totalRows > 0
                ? Math.round(
                    (upload.processedRows / upload.totalRows) * 100
                )
                : 0;

        return res.status(200).json({
            uploadId: upload.id,
            filename: upload.filename,
            status: upload.status,
            totalRows: upload.totalRows,
            processedRows: upload.processedRows,
            validRows: upload.validRows,
            invalidRows: upload.invalidRows,
            duplicates: upload.duplicates,
            progress
        });

    } catch (error) {
        console.error("Status error:", error);

        return res.status(500).json({
            message: "Failed to get upload status"
        });
    }
}