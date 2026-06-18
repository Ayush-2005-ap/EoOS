import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAdmin } from "../middleware/authMiddleware";
import { upload as cloudUpload, cloudinary } from "../middlewares/upload";

const router = Router();
const prisma = new PrismaClient();

// Ensure directories exist
const reportsDir = path.join(__dirname, "../../../public/uploads/reports");
const voicesDir = path.join(__dirname, "../../../public/uploads/voices");
const avatarsDir = path.join(__dirname, "../../../public/uploads/avatars");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
if (!fs.existsSync(voicesDir)) fs.mkdirSync(voicesDir, { recursive: true });
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "pdf") {
      cb(null, reportsDir);
    } else if (file.fieldname === "thumbnail" || file.fieldname === "video") {
      cb(null, voicesDir);
    } else if (file.fieldname === "avatar") {
      cb(null, avatarsDir);
    } else {
      cb(new Error("Invalid fieldname"), "");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ============================================================================
// REPORTS (PDFs)
// ============================================================================

router.get("/reports", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ data: reports });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reports", requireAdmin, cloudUpload.single("pdf"), async (req, res) => {
  try {
    const { title, type, size, description } = req.body;
    if (!title || !req.file) return res.status(400).json({ error: "Title and PDF file are required" });

    // Upload buffer to Cloudinary via chunked stream
    const uploadStream = cloudinary.uploader.upload_chunked_stream(
      { folder: "reports", resource_type: "raw" }, // Using "raw" to ensure PDFs are downloadable and viewable without image processing
      async (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Failed to upload to Cloudinary" });
        }

        const report = await prisma.report.create({
          data: { 
            title, 
            type: type || "Official Report (PDF)",
            size: size || "0 MB",
            description: description || "",
            pdfPath: result.secure_url 
          },
        });
        res.status(201).json({ data: report });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/reports/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({ where: { id: String(id) } });
    if (!report) return res.status(404).json({ error: "Not found" });

    // Try to delete local file
    const fullPath = path.join(__dirname, "../../../public", report.pdfPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await prisma.report.delete({ where: { id: String(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/voices", requireAdmin, upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "video", maxCount: 1 }]), async (req, res) => {
  try {
    const { title, youtubeUrl, category } = req.body;
    if (!title || !youtubeUrl) return res.status(400).json({ error: "Title and YouTube URL are required" });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnailPath = files?.["thumbnail"] ? `/uploads/voices/${files["thumbnail"][0].filename}` : "";
    const videoUrl = files?.["video"] ? `/uploads/voices/${files["video"][0].filename}` : "";

    const voice = await prisma.voice.create({
      data: { title, youtubeUrl, thumbnailPath, videoUrl, category: category || "General" },
    });
    res.status(201).json({ data: voice });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/voices/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const voice = await prisma.voice.findUnique({ where: { id: String(id) } });
    if (!voice) return res.status(404).json({ error: "Not found" });

    if (voice.thumbnailPath) {
      const fullPath = path.join(__dirname, "../../../public", voice.thumbnailPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await prisma.voice.delete({ where: { id: String(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// TESTIMONIALS (Previously Reviews)
// ============================================================================

router.get("/reviews", async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ data: testimonials });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reviews", requireAdmin, upload.single("avatar"), async (req, res) => {
  try {
    const { author, role, quote, type, initials } = req.body;
    if (!author || !quote) return res.status(400).json({ error: "Author and quote required" });

    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const testimonial = await prisma.testimonial.create({
      data: {
        author,
        quote,
        role: role || "",
        type: type || "glass",
        initials: initials || "",
        avatarUrl
      },
    });
    res.status(201).json({ data: testimonial });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/reviews/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await prisma.testimonial.findUnique({ where: { id: String(id) } });
    if (!testimonial) return res.status(404).json({ error: "Not found" });

    if (testimonial.avatarUrl) {
      const fullPath = path.join(__dirname, "../../../public", testimonial.avatarUrl);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await prisma.testimonial.delete({ where: { id: String(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// DATASET (Excel to JSON)
// ============================================================================
import * as xlsx from "xlsx";

const memoryUpload = multer({ storage: multer.memoryStorage() });

router.get("/dataset", async (req, res) => {
  try {
    const dataset = await prisma.dataset.findFirst({ orderBy: { createdAt: "desc" } });
    res.json({ data: dataset ? dataset.data : [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/dataset", requireAdmin, memoryUpload.single("excel"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Excel file required" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    const dataset = await prisma.dataset.create({
      data: {
        filename: req.file.originalname,
        data: data as any,
      },
    });

    res.status(201).json({ message: "Dataset uploaded and parsed successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
