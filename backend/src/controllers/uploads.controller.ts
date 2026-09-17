import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { db } from "../prisma/db.js";

export async function getUserUploads(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const uploads = await db.orm.public.Upload
            .where({ userId: req.user.userId })
            .all();

        return res.status(200).json(
            uploads.map((upload) => ({
                id: upload.id,
                filename: upload.filename,
                status: upload.status,
                totalRows: upload.totalRows,
                processedRows: upload.processedRows,
                validRows: upload.validRows,
                invalidRows: upload.invalidRows,
                duplicates: upload.duplicates,
                createdAt: upload.createdAt
            }))
        );
    } catch (error) {
        console.error("Get uploads error:", error);

        return res.status(500).json({
            message: "Failed to retrieve uploads"
        });
    }
}