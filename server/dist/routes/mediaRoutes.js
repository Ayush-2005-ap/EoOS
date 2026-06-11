"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Ensure directories exist
const reportsDir = path_1.default.join(__dirname, "../../../public/uploads/reports");
const voicesDir = path_1.default.join(__dirname, "../../../public/uploads/voices");
if (!fs_1.default.existsSync(reportsDir))
    fs_1.default.mkdirSync(reportsDir, { recursive: true });
if (!fs_1.default.existsSync(voicesDir))
    fs_1.default.mkdirSync(voicesDir, { recursive: true });
// Multer Config
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "pdf") {
            cb(null, reportsDir);
        }
        else if (file.fieldname === "thumbnail") {
            cb(null, voicesDir);
        }
        else {
            cb(new Error("Invalid fieldname"), "");
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// ============================================================================
// REPORTS (PDFs)
// ============================================================================
router.get("/reports", async (req, res) => {
    try {
        const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ data: reports });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/reports", authMiddleware_1.requireAdmin, upload.single("pdf"), async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || !req.file)
            return res.status(400).json({ error: "Title and PDF file are required" });
        const pdfPath = `/uploads/reports/${req.file.filename}`;
        const report = await prisma.report.create({
            data: { title, pdfPath },
        });
        res.status(201).json({ data: report });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete("/reports/:id", authMiddleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const report = await prisma.report.findUnique({ where: { id: String(id) } });
        if (!report)
            return res.status(404).json({ error: "Not found" });
        // Try to delete local file
        const fullPath = path_1.default.join(__dirname, "../../../public", report.pdfPath);
        if (fs_1.default.existsSync(fullPath))
            fs_1.default.unlinkSync(fullPath);
        await prisma.report.delete({ where: { id: String(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ============================================================================
// VOICES (Thumbnails + YouTube)
// ============================================================================
router.get("/voices", async (req, res) => {
    try {
        const voices = await prisma.voice.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ data: voices });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/voices", authMiddleware_1.requireAdmin, upload.single("thumbnail"), async (req, res) => {
    try {
        const { title, youtubeUrl } = req.body;
        if (!title || !youtubeUrl || !req.file)
            return res.status(400).json({ error: "Title, YouTube URL, and Thumbnail image are required" });
        const thumbnailPath = `/uploads/voices/${req.file.filename}`;
        const voice = await prisma.voice.create({
            data: { title, youtubeUrl, thumbnailPath },
        });
        res.status(201).json({ data: voice });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete("/voices/:id", authMiddleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const voice = await prisma.voice.findUnique({ where: { id: String(id) } });
        if (!voice)
            return res.status(404).json({ error: "Not found" });
        const fullPath = path_1.default.join(__dirname, "../../../public", voice.thumbnailPath);
        if (fs_1.default.existsSync(fullPath))
            fs_1.default.unlinkSync(fullPath);
        await prisma.voice.delete({ where: { id: String(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ============================================================================
// REVIEWS
// ============================================================================
router.get("/reviews", async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ data: reviews });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/reviews", async (req, res) => {
    try {
        const { reviewerName, reviewText, rating } = req.body;
        if (!reviewerName || !reviewText)
            return res.status(400).json({ error: "Name and text required" });
        const review = await prisma.review.create({
            data: { reviewerName, reviewText, rating: rating ? parseFloat(rating) : null },
        });
        res.status(201).json({ data: review });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete("/reviews/:id", authMiddleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({ where: { id: String(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
