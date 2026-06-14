import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/config/launch-status
router.get("/launch-status", async (req, res) => {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { key: "isLaunched" }
    });
    const isLaunched = config?.value === "true";
    res.json({ isLaunched });
  } catch (error) {
    console.error("Error fetching launch status:", error);
    res.status(500).json({ error: "Failed to fetch launch status" });
  }
});

// POST /api/config/launch
router.post("/launch", async (req, res) => {
  try {
    await prisma.appConfig.upsert({
      where: { key: "isLaunched" },
      update: { value: "true" },
      create: { key: "isLaunched", value: "true" }
    });
    res.json({ success: true, isLaunched: true });
  } catch (error) {
    console.error("Error setting launch status to true:", error);
    res.status(500).json({ error: "Failed to launch" });
  }
});

// POST /api/config/reset-launch
router.post("/reset-launch", async (req, res) => {
  try {
    await prisma.appConfig.upsert({
      where: { key: "isLaunched" },
      update: { value: "false" },
      create: { key: "isLaunched", value: "false" }
    });
    res.json({ success: true, isLaunched: false });
  } catch (error) {
    console.error("Error resetting launch status:", error);
    res.status(500).json({ error: "Failed to reset launch status" });
  }
});

export default router;
