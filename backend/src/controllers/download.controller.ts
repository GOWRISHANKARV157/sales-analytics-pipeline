import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { db } from "../prisma/db.js";

function escapeCsv(value: unknown): string {
    const text = String(value ?? "");

    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

export async function downloadProcessedCsv(
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

        if (upload.status !== "COMPLETED") {
            return res.status(409).json({
                message: "Upload must be processed before downloading"
            });
        }

        const transactions =
            await db.orm.public.Transaction
                .where({ uploadId })
                .all();

        if (transactions.length === 0) {
            return res.status(404).json({
                message: "No processed transactions found"
            });
        }

        const headers = [
            "transaction_id",
            "region",
            "product_category",
            "quantity",
            "unit_price",
            "discount_percent",
            "transaction_date",
            "net_amount",
            "status",
            "error_message"
        ];

        const csvRows = transactions.map((transaction) => [
            transaction.transactionId,
            transaction.region,
            transaction.productCategory,
            transaction.quantity,
            transaction.unitPrice,
            transaction.discountPercent,
            transaction.transactionDate,
            transaction.netAmount,
            transaction.status,
            transaction.errorMessage ?? ""
        ]);

        const csv = [
            headers.map(escapeCsv).join(","),
            ...csvRows.map((row) =>
                row.map(escapeCsv).join(",")
            )
        ].join("\n");

        const filename =
            `processed-${upload.filename.replace(
                /\.csv$/i,
                ""
            )}.csv`;

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        return res.status(200).send(csv);

    } catch (error) {
        console.error(
            "Download processed CSV error:",
            error
        );

        return res.status(500).json({
            message: "Failed to generate processed CSV"
        });
    }
}