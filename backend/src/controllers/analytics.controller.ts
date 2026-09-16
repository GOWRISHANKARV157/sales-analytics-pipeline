import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { db } from "../prisma/db.js";
import { generateAnalytics } from "../services/analytics.service.js";

export async function generateUploadAnalytics(
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
                message: "Upload must be completed before generating analytics"
            });
        }

        const analytics = await generateAnalytics(uploadId);

        const report =
            await db.orm.public.AnalyticsReport.create({
                uploadId,
                totalRevenue: analytics.totalRevenue,
                averageOrderValue: analytics.averageOrderValue,
                medianTransactionValue: analytics.medianTransactionValue,
                discountLoss: analytics.discountLoss,
                standardDeviation: analytics.standardDeviation
            });

            // Save revenue by region
            for (const [region, revenue] of Object.entries(
                analytics.revenueByRegion
            )) {
                await db.orm.public.RegionAnalytics.create({
                    uploadId,
                    region,
                    revenue
                });
            }

            // Save revenue by category
            for (const [category, revenue] of Object.entries(
                analytics.revenueByCategory
            )) {
                await db.orm.public.CategoryAnalytics.create({
                    uploadId,
                    category,
                    revenue
                });
            }

            // Save top 5 transactions
            for (
                const [index, transaction]
                of analytics.top5Transactions.entries()
            ) {
                await db.orm.public.TopTransaction.create({
                    uploadId,
                    transactionId: transaction.transactionId,
                    region: transaction.region,
                    category: transaction.productCategory,
                    netAmount: transaction.netAmount,
                    rank: index + 1
                });
            }

            // Save daily revenue
            for (const [date, revenue] of Object.entries(
                analytics.dailyRevenue
            )) {
                await db.orm.public.DailyRevenue.create({
                    uploadId,
                    date,
                    revenue
                });
            }

        return res.status(201).json({
            message: "Analytics generated successfully",
            report,
            analytics
        });

    } catch (error) {
        console.error("Analytics error:", error);

        return res.status(500).json({
            message: "Failed to generate analytics"
        });
    }
}

export async function getUploadAnalytics(
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

        const report = await db.orm.public.AnalyticsReport
            .where({ uploadId })
            .all();

        if (report.length === 0) {
            return res.status(404).json({
                message: "Analytics report not found"
            });
        }

        const latestReport =
            report[report.length - 1];

        const regionAnalytics =
            await db.orm.public.RegionAnalytics
                .where({ uploadId })
                .all();

        const categoryAnalytics =
            await db.orm.public.CategoryAnalytics
                .where({ uploadId })
                .all();

        const topTransactions =
            await db.orm.public.TopTransaction
                .where({ uploadId })
                .all();

        const dailyRevenue =
            await db.orm.public.DailyRevenue
                .where({ uploadId })
                .all();

        return res.status(200).json({
            message: "Analytics retrieved successfully",
            report: latestReport,
            revenueByRegion: regionAnalytics,
            revenueByCategory: categoryAnalytics,
            top5Transactions: topTransactions,
            dailyRevenue
        });

    } catch (error) {
        console.error("Get analytics error:", error);

        return res.status(500).json({
            message: "Failed to retrieve analytics"
        });
    }
}

export async function getDashboard(
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

        const reports =
            await db.orm.public.AnalyticsReport
                .where({ uploadId })
                .all();

        if (reports.length === 0) {
            return res.status(404).json({
                message: "Analytics report not found"
            });
        }

        const latestReport =
            reports[reports.length - 1];

        const revenueByRegion =
            await db.orm.public.RegionAnalytics
                .where({ uploadId })
                .all();

        const revenueByCategory =
            await db.orm.public.CategoryAnalytics
                .where({ uploadId })
                .all();

        const top5Transactions =
            await db.orm.public.TopTransaction
                .where({ uploadId })
                .all();

        const dailyRevenue =
            await db.orm.public.DailyRevenue
                .where({ uploadId })
                .all();

        const progress =
            upload.totalRows > 0
                ? Math.round(
                    (upload.processedRows / upload.totalRows) * 100
                )
                : 0;

        return res.status(200).json({
            upload: {
                id: upload.id,
                filename: upload.filename,
                status: upload.status,
                totalRows: upload.totalRows,
                processedRows: upload.processedRows,
                validRows: upload.validRows,
                invalidRows: upload.invalidRows,
                duplicates: upload.duplicates,
                progress
            },

            report: latestReport,

            revenueByRegion,

            revenueByCategory,

            top5Transactions,

            dailyRevenue
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            message: "Failed to retrieve dashboard data"
        });
    }
}