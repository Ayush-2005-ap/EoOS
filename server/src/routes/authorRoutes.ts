import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all authors ordered by orderIndex
router.get("/", async (req, res) => {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { orderIndex: "asc" },
    });
    res.json({ data: authors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
