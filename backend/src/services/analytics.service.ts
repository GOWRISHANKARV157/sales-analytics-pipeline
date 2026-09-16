import { db } from "../prisma/db.js";

export async function generateAnalytics(uploadId: number) {
    const transactions =
        await db.orm.public.Transaction
            .where({
                uploadId,
                status: "VALID"
            })
            .all();

    if (transactions.length === 0) {
        throw new Error("No valid transactions found for this upload");
    }

    const amounts = transactions.map(
        (transaction) => Number(transaction.netAmount)
    );

    // -----------------------------
    // Total Revenue
    // -----------------------------
    const totalRevenue = amounts.reduce(
        (sum, amount) => sum + amount,
        0
    );

    // -----------------------------
    // Average Order Value
    // -----------------------------
    const averageOrderValue =
        totalRevenue / amounts.length;

    // -----------------------------
    // Median Transaction Value
    // -----------------------------
    const sortedAmounts = [...amounts].sort(
        (a, b) => a - b
    );

    const middle = Math.floor(
        sortedAmounts.length / 2
    );

    const medianTransactionValue =
        sortedAmounts.length % 2 === 0
            ? (
                sortedAmounts[middle - 1]! +
                sortedAmounts[middle]!
            ) / 2
            : sortedAmounts[middle]!;

    // -----------------------------
    // Discount Loss
    // -----------------------------
    const discountLoss = transactions.reduce(
        (sum, transaction) => {
            const quantity =
                Number(transaction.quantity);

            const unitPrice =
                Number(transaction.unitPrice);

            const discountPercent =
                Number(transaction.discountPercent);

            const originalAmount =
                quantity * unitPrice;

            const discountedAmount =
                originalAmount *
                (1 - discountPercent / 100);

            return sum +
                (originalAmount - discountedAmount);
        },
        0
    );

    // -----------------------------
    // Standard Deviation
    // -----------------------------
    const variance =
        amounts.reduce(
            (sum, amount) =>
                sum +
                Math.pow(
                    amount - averageOrderValue,
                    2
                ),
            0
        ) / amounts.length;

    const standardDeviation =
        Math.sqrt(variance);

    // -----------------------------
    // Revenue by Region
    // -----------------------------
    const revenueByRegion: Record<string, number> = {};

    for (const transaction of transactions) {
        const region = transaction.region;
        const amount = Number(transaction.netAmount);

        revenueByRegion[region] =
            (revenueByRegion[region] ?? 0) + amount;
    }

    // -----------------------------
    // Revenue by Product Category
    // -----------------------------
    const revenueByCategory: Record<string, number> = {};

    for (const transaction of transactions) {
        const category =
            transaction.productCategory;

        const amount =
            Number(transaction.netAmount);

        revenueByCategory[category] =
            (revenueByCategory[category] ?? 0) + amount;
    }

    // -----------------------------
    // Top 5 Transactions
    // -----------------------------
    const top5Transactions = [...transactions]
        .sort(
            (a, b) =>
                Number(b.netAmount) -
                Number(a.netAmount)
        )
        .slice(0, 5)
        .map((transaction) => ({
            transactionId:
                transaction.transactionId,
            region:
                transaction.region,
            productCategory:
                transaction.productCategory,
            netAmount:
                Number(transaction.netAmount),
            transactionDate:
                transaction.transactionDate
        }));

    // -----------------------------
    // Daily Revenue Trend
    // -----------------------------
    const dailyRevenue: Record<string, number> = {};

    for (const transaction of transactions) {
        const date = transaction.transactionDate
                .toString()
                .slice(0,10);

        if (!date) {
            continue;
        }

        const amount =
            Number(transaction.netAmount);

        dailyRevenue[date] =
            (dailyRevenue[date] ?? 0) + amount;
    }

    return {
        totalRevenue,
        averageOrderValue,
        medianTransactionValue,
        discountLoss,
        standardDeviation,
        revenueByRegion,
        revenueByCategory,
        top5Transactions,
        dailyRevenue
    };
}