import { db } from "../prisma/db.js";
import { runWorkerPool } from "./worker.pool.js";
import { delay } from "../utils/delay.js";

export interface CsvRow {
    transaction_id?: string;
    region?: string;
    product_category?: string;
    quantity?: string;
    unit_price?: string;
    discount_percent?: string;
    transaction_date?: string;
}

export interface ProcessedRow {
    transactionId: string;
    region: string;
    productCategory: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    transactionDate: Date;
    netAmount: number;
    status: "VALID" | "INVALID" | "DUPLICATE";
    errorMessage?: string;
}

export function processRow(
    row: CsvRow,
    existingTransactionIds: Set<string>
): ProcessedRow {
    const errors: string[] = [];

    const transactionId = row.transaction_id?.trim() ?? "";
    const region = row.region?.trim() ?? "";
    const productCategory = row.product_category?.trim() ?? "";

    const quantity = Number(row.quantity);
    const unitPrice = Number(row.unit_price);
    const discountPercent = Number(row.discount_percent);

    const transactionDate = new Date(row.transaction_date ?? "");

    // Required fields
    if (!transactionId) {
        errors.push("transaction_id is required");
    }

    if (!region) {
        errors.push("region is required");
    }

    if (!productCategory) {
        errors.push("product_category is required");
    }

    if (!row.quantity?.trim()) {
        errors.push("quantity is required");
    }

    if (!row.unit_price?.trim()) {
        errors.push("unit_price is required");
    }

    if (!row.discount_percent?.trim()) {
        errors.push("discount_percent is required");
    }

    if (!row.transaction_date?.trim()) {
        errors.push("transaction_date is required");
    }

    // Numeric validation
    if (!Number.isFinite(quantity)) {
        errors.push("quantity must be a valid number");
    } else if (quantity < 0) {
        errors.push("quantity cannot be negative");
    }

    if (!Number.isFinite(unitPrice)) {
        errors.push("unit_price must be a valid number");
    } else if (unitPrice < 0) {
        errors.push("unit_price cannot be negative");
    }

    if (!Number.isFinite(discountPercent)) {
        errors.push("discount_percent must be a valid number");
    } else if (discountPercent < 0 || discountPercent > 100) {
        errors.push("discount_percent must be between 0 and 100");
    }

    // Date validation
    if (
        !row.transaction_date ||
        Number.isNaN(transactionDate.getTime())
    ) {
        errors.push("transaction_date must be a valid date");
    } else if (transactionDate > new Date()) {
        errors.push("transaction_date cannot be in the future");
    }

    // Duplicate validation
    if (
        transactionId &&
        existingTransactionIds.has(transactionId)
    ) {
        return {
            transactionId,
            region,
            productCategory,
            quantity,
            unitPrice,
            discountPercent,
            transactionDate,
            netAmount: 0,
            status: "DUPLICATE",
            errorMessage: "Duplicate transaction_id"
        };
    }

    // Invalid row
    if (errors.length > 0) {
        return {
            transactionId,
            region,
            productCategory,
            quantity,
            unitPrice,
            discountPercent,
            transactionDate,
            netAmount: 0,
            status: "INVALID",
            errorMessage: errors.join("; ")
        };
    }

    // Derived value
    const netAmount =
        quantity *
        unitPrice *
        (1 - discountPercent / 100);

    return {
        transactionId,
        region,
        productCategory,
        quantity,
        unitPrice,
        discountPercent,
        transactionDate,
        netAmount,
        status: "VALID"
    };
}

export async function processUpload(
    uploadId: number,
    rows: CsvRow[]
) {
    // Mark job as processing
    await db.orm.public.Upload
    .where({ id: uploadId })
    .update({
        status: "PROCESSING",
        totalRows: rows.length
    });

    try {
        const existingTransactions =
            await db.orm.public.Transaction.all();

        const existingTransactionIds = new Set(
            existingTransactions.map(
                (transaction) => transaction.transactionId
            )
        );

        const seenTransactionIds = new Set<string>();

        const duplicateIndexes = new Set<number>();

        rows.forEach((row, index) => {
            const transactionId =
                row.transaction_id?.trim() ?? "";

            if (!transactionId) {
                return;
            }

            if (seenTransactionIds.has(transactionId)) {
                duplicateIndexes.add(index);
            } else {
                seenTransactionIds.add(transactionId);
            }
        });

        let completedRows = 0;

        const processedRows = await runWorkerPool(
            rows,
            4,
            async (row, index) => {
                let processed: ProcessedRow;

                if (duplicateIndexes.has(index)) {
                    processed = {
                        transactionId:
                            row.transaction_id?.trim() ?? "",
                        region:
                            row.region?.trim() ?? "",
                        productCategory:
                            row.product_category?.trim() ?? "",
                        quantity:
                            Number(row.quantity),
                        unitPrice:
                            Number(row.unit_price),
                        discountPercent:
                            Number(row.discount_percent),
                        transactionDate:
                            new Date(
                                row.transaction_date ?? ""
                            ),
                        netAmount: 0,
                        status: "DUPLICATE",
                        errorMessage:
                            "Duplicate transaction_id"
                    };
                } else {
                    await delay(100);

                    processed = processRow(
                        row,
                        existingTransactionIds
                    );
                }

                completedRows++;

                await db.orm.public.Upload
                    .where({ id: uploadId })
                    .update({
                        processedRows: completedRows
                    });

                return processed;
            }
        );

        for (const row of processedRows) {
            await db.orm.public.Transaction.create({
                transactionId: row.transactionId,
                region: row.region,
                productCategory: row.productCategory,
                quantity: String(row.quantity),
                unitPrice: String(row.unitPrice),
                discountPercent: String(row.discountPercent),
                transactionDate: row.transactionDate.toISOString(),
                netAmount: String(row.netAmount),
                status: row.status,
                errorMessage: row.errorMessage ?? null,
                uploadId
            });
        }

        const validRows = processedRows.filter(
            (row) => row.status === "VALID"
        ).length;

        const invalidRows = processedRows.filter(
            (row) => row.status === "INVALID"
        ).length;

        const duplicates = processedRows.filter(
            (row) => row.status === "DUPLICATE"
        ).length;

        await db.orm.public.Upload
            .where({ id: uploadId })
            .update({
                status: "COMPLETED",
                totalRows: rows.length,
                processedRows: rows.length,
                validRows,
                invalidRows,
                duplicates
            });

        return {
            totalRows: rows.length,
            validRows,
            invalidRows,
            duplicates
        };
    } catch (error) {
        await db.orm.public.Upload
        .where({id: uploadId })
        .update({
            status: "FAILED"
        });


        throw error;
    }
}