import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { db } from "../prisma/db.js";
import { parse } from "csv-parse/sync";
import fs from "fs/promises";

export async function uploadFile(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "CSV file is required"
            });
        }

        const fileContent = await fs.readFile(req.file.path);

        const rows = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({
                message: "CSV file is empty"
            });
        }

        const upload = await db.orm.public.Upload.create({
            filename: req.file.originalname,
            filePath: req.file.path,
            userId: req.user.userId
        });

        return res.status(201).json({
            message: "File uploaded successfully",
            upload: {
                id: upload.id,
                filename: upload.filename,
                status: upload.status,
                totalRows: rows.length
            }
        });
    } catch (error) {
        console.error("File upload error:", error);

        return res.status(500).json({
            message: "Failed to process uploaded file"
        });
    }
}