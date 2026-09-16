import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./prisma/db.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "Sales Analytics API is running"
    });
});

app.get("/health/db", async (req, res) => {
    try {
        await db.orm.public.User.first();

        res.json({
            status: "ok",
            database: "connected"
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});