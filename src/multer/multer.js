import multer from "multer";
import path from "path";
import fs from "fs";

export const localFileUpload = ({ customPath = "general" } = {}) => {
    console.log("Multer initialized only when route calls it");

    const basePath = `./uploads/${customPath}`;

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log("➡ Running destination middleware");
            console.log(req.currentUser._id);
            
            const userId = req.currentUser?._id || "unknownUser";
            console.log({userId});
            
            
            const fullPath = path.resolve(`./src/${basePath}/${userId}`);
            console.log({fullPath});
            
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });

            cb(null, fullPath);
        },
        filename: (req, file, cb) => {
            console.log("➡ Running filename middleware");
            const sanitized = file.originalname.replace(/\s+/g, "_");
            const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${sanitized}`;
            const userId = req.currentUser?._id || "unknownUser";

            file.finalPath = `${basePath}/${userId}/${uniqueName}`;
            cb(null, uniqueName);
        }
    });

    const fileFilter = (req, file, cb) => {
        console.log("➡ Running fileFilter middleware");
        if (!file) return cb(new Error("No file uploaded"), false);

        const allowed = [
            "image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf",
            "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid file format"), false);
    };

    return multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
};
