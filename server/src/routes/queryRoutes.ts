import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Public: Submit a query
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const query = await prisma.query.create({
      data: { name, email, subject, message },
    });
    res.status(201).json({ data: query, message: "Query submitted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all queries
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const queries = await prisma.query.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: queries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update query status
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // e.g., "CLOSED"
    const query = await prisma.query.update({
      where: { id: String(req.params.id) },
      data: { status },
    });
    res.json({ data: query });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete a query
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.query.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Query deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
