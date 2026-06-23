import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAdmin } from "../middleware/authMiddleware";
import { upload as cloudUpload, supabaseStorage } from "../middlewares/upload";

const router = Router();
const prisma = new PrismaClient();

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

    const fileName = `reports/${Date.now()}-${req.file.originalname.replace(/\\s+/g, "_")}`;
    const result = await supabaseStorage.upload(fileName, req.file.buffer, req.file.mimetype);

    const report = await prisma.report.create({
      data: { 
        title, 
        type: type || "Official Report (PDF)",
        size: size || "0 MB",
        description: description || "",
        pdfPath: result.publicUrl 
      },
    });
    res.status(201).json({ data: report });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/reports/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({ where: { id: String(id) } });
    if (!report) return res.status(404).json({ error: "Not found" });

    if (report.pdfPath.includes("supabase.co")) {
      const pathParts = report.pdfPath.split("eoos-media/");
      if (pathParts.length > 1) {
        await supabaseStorage.remove(pathParts[1]);
      }
    } else {
      const fullPath = path.join(__dirname, "../../../public", report.pdfPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

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

router.post("/voices", requireAdmin, cloudUpload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "video", maxCount: 1 }]), async (req, res) => {
  try {
    const { title, youtubeUrl, category } = req.body;
    if (!title || !youtubeUrl) return res.status(400).json({ error: "Title and YouTube URL are required" });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    let thumbnailPath = "";
    let videoUrl = "";

    if (files?.["thumbnail"]) {
      const thumbFile = files["thumbnail"][0];
      const thumbName = `voices/${Date.now()}-thumb-${thumbFile.originalname.replace(/\\s+/g, "_")}`;
      const result = await supabaseStorage.upload(thumbName, thumbFile.buffer, thumbFile.mimetype);
      thumbnailPath = result.publicUrl;
    }

    if (files?.["video"]) {
      const videoFile = files["video"][0];
      const vidName = `voices/${Date.now()}-video-${videoFile.originalname.replace(/\\s+/g, "_")}`;
      const result = await supabaseStorage.upload(vidName, videoFile.buffer, videoFile.mimetype);
      videoUrl = result.publicUrl;
    }

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

    if (voice.thumbnailPath && voice.thumbnailPath.includes("supabase.co")) {
      const pathParts = voice.thumbnailPath.split("eoos-media/");
      if (pathParts.length > 1) await supabaseStorage.remove(pathParts[1]);
    }
    if (voice.videoUrl && voice.videoUrl.includes("supabase.co")) {
      const pathParts = voice.videoUrl.split("eoos-media/");
      if (pathParts.length > 1) await supabaseStorage.remove(pathParts[1]);
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

router.post("/reviews", requireAdmin, cloudUpload.single("avatar"), async (req, res) => {
  try {
    const { author, role, quote, type, initials } = req.body;
    if (!author || !quote) return res.status(400).json({ error: "Author and quote required" });

    let avatarUrl = null;
    if (req.file) {
      const avatarName = `avatars/${Date.now()}-${req.file.originalname.replace(/\\s+/g, "_")}`;
      const result = await supabaseStorage.upload(avatarName, req.file.buffer, req.file.mimetype);
      avatarUrl = result.publicUrl;
    }

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

    if (testimonial.avatarUrl && testimonial.avatarUrl.includes("supabase.co")) {
      const pathParts = testimonial.avatarUrl.split("eoos-media/");
      if (pathParts.length > 1) await supabaseStorage.remove(pathParts[1]);
    } else if (testimonial.avatarUrl) {
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

// ============================================================================
// GALLERY IMAGES
// ============================================================================

router.get("/gallery", async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ data: images });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/gallery", requireAdmin, cloudUpload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "Image file is required" });

    const fileName = `gallery/${Date.now()}-${req.file.originalname.replace(/\\s+/g, "_")}`;
    const result = await supabaseStorage.upload(fileName, req.file.buffer, req.file.mimetype);

    const galleryImage = await prisma.galleryImage.create({
      data: { 
        title: title || "", 
        imageUrl: result.publicUrl,
        publicId: fileName
      },
    });
    res.status(201).json({ data: galleryImage });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/gallery/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const galleryImage = await prisma.galleryImage.findUnique({ where: { id: String(id) } });
    if (!galleryImage) return res.status(404).json({ error: "Not found" });

    if (galleryImage.publicId) {
      await supabaseStorage.remove(galleryImage.publicId);
    }

    await prisma.galleryImage.delete({ where: { id: String(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
