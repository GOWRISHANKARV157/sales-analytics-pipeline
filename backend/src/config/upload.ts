import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (_req, file, callback) => {
        const uniqueName =
            `${Date.now()}-${file.originalname}`;

        callback(null, uniqueName);
    }
});

export const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (_req, file, callback) => {
        if (
            file.mimetype === "text/csv" ||
            file.originalname.toLowerCase().endsWith(".csv")
        ) {
            callback(null, true);
        } else {
            callback(new Error("Only CSV files are allowed"));
        }
    }
});