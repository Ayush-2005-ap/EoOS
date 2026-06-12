import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../middleware/authMiddleware";
import { upload, cloudinary } from "../middlewares/upload";

const router = Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// ─── PDF Upload Route ────────────────────────────────────────────────────────
router.post("/states/:id/pdf", upload.single("pdf"), async (req, res) => {
  try {
    const id = req.params.id as string;
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Upload buffer to Cloudinary via stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "state_profiles", resource_type: "image" }, // Use "image" so PDFs can be rendered inline in an iframe instead of forcing a download
      async (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Failed to upload to Cloudinary" });
        }

        // Update database
        const updatedState = await prisma.state.update({
          where: { id },
          data: { pdfUrl: result.secure_url },
        });

        res.json({ message: "PDF uploaded successfully", data: updatedState });
      }
    );

    // End stream with buffer
    uploadStream.end(req.file.buffer);

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ─── 1. Get Full Structure Hierarchy ─────────────────────────────────────────
router.get("/hierarchy", async (_req, res) => {
  try {
    const domains = await prisma.domain.findMany({
      include: {
        indicators: {
          include: {
            subIndicators: true,
          },
        },
      },
    });
    res.json({ data: domains });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch hierarchy" });
  }
});

// ─── 2. Granular CRUD ────────────────────────────────────────────────────────

// Domain CRUD
router.post("/domains", async (req, res) => {
  try {
    const { id, name, description, defaultWeight } = req.body;
    const domain = await prisma.domain.create({
      data: { id, name, description, defaultWeight: defaultWeight || 16 },
    });
    res.status(201).json({ data: domain });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/domains/:id", async (req, res) => {
  try {
    const { name, description, defaultWeight } = req.body;
    const domain = await prisma.domain.update({
      where: { id: req.params.id },
      data: { name, description, defaultWeight },
    });
    res.json({ data: domain });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/domains/:id", async (req, res) => {
  try {
    const domainId = req.params.id;

    const indicators = await prisma.indicator.findMany({ where: { domainId } });
    const indicatorIds = indicators.map(i => i.id);

    const subs = await prisma.subIndicator.findMany({ where: { indicatorId: { in: indicatorIds } } });
    const subIds = subs.map(s => s.id);

    await prisma.$transaction([
      prisma.stateSubIndicatorData.deleteMany({ where: { subIndicatorId: { in: subIds } } }),
      prisma.stateIndicatorScore.deleteMany({ where: { indicatorId: { in: indicatorIds } } }),
      prisma.subIndicator.deleteMany({ where: { indicatorId: { in: indicatorIds } } }),
      prisma.stateDomainScore.deleteMany({ where: { domainId } }),
      prisma.indicator.deleteMany({ where: { domainId } }),
      prisma.domain.delete({ where: { id: domainId } })
    ]);

    res.json({ message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Indicator CRUD
router.post("/indicators", async (req, res) => {
  try {
    const { domainId, name } = req.body;
    const indicator = await prisma.indicator.create({ data: { domainId, name } });
    res.status(201).json({ data: indicator });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/indicators/:id", async (req, res) => {
  try {
    const indicator = await prisma.indicator.update({
      where: { id: req.params.id },
      data: { name: req.body.name },
    });
    res.json({ data: indicator });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/indicators/:id", async (req, res) => {
  try {
    const indicatorId = req.params.id;

    const subs = await prisma.subIndicator.findMany({ where: { indicatorId } });
    const subIds = subs.map(s => s.id);

    await prisma.$transaction([
      prisma.stateSubIndicatorData.deleteMany({ where: { subIndicatorId: { in: subIds } } }),
      prisma.stateIndicatorScore.deleteMany({ where: { indicatorId } }),
      prisma.subIndicator.deleteMany({ where: { indicatorId } }),
      prisma.indicator.delete({ where: { id: indicatorId } })
    ]);

    res.json({ message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SubIndicator CRUD
router.post("/sub-indicators", async (req, res) => {
  try {
    const { indicatorId, name, maxScore } = req.body;
    const sub = await prisma.subIndicator.create({ data: { indicatorId, name, maxScore: maxScore || 1.0 } });
    res.status(201).json({ data: sub });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/sub-indicators/:id", async (req, res) => {
  try {
    const { name, maxScore } = req.body;
    const sub = await prisma.subIndicator.update({
      where: { id: req.params.id },
      data: { name, maxScore },
    });
    res.json({ data: sub });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/sub-indicators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction([
      prisma.stateSubIndicatorData.deleteMany({ where: { subIndicatorId: id } }),
      prisma.subIndicator.delete({ where: { id } })
    ]);
    res.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ─── 3. Get State Scores Hierarchy ───────────────────────────────────────────
router.get("/states/:stateId/scores", async (req, res) => {
  const { stateId } = req.params;
  try {
    const [domainScores, indicatorScores, subIndicatorData] = await Promise.all([
      prisma.stateDomainScore.findMany({ where: { stateId } }),
      prisma.stateIndicatorScore.findMany({ where: { stateId } }),
      prisma.stateSubIndicatorData.findMany({ where: { stateId } }),
    ]);

    res.json({
      data: {
        domainScores,
        indicatorScores,
        subIndicatorData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch state scores" });
  }
});

// ─── 4. Update Sub-Indicator Score & Recalculate ─────────────────────────────
router.put("/states/:stateId/scores", async (req, res) => {
  const { stateId } = req.params;
  const { subIndicatorId, score, status } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update the raw sub-indicator data
      await tx.stateSubIndicatorData.upsert({
        where: {
          stateId_subIndicatorId: { stateId, subIndicatorId },
        },
        update: { score, status: status || "Updated manually" },
        create: { stateId, subIndicatorId, score, status: status || "Updated manually" },
      });

      // Find which indicator this belongs to
      const subInd = await tx.subIndicator.findUnique({
        where: { id: subIndicatorId },
        include: { indicator: true },
      });
      if (!subInd) throw new Error("SubIndicator not found");
      const indicatorId = subInd.indicatorId;
      const domainId = subInd.indicator.domainId;

      // 2. Recalculate Indicator Score (mean of sub-indicators)
      const allSubIndsForIndicator = await tx.subIndicator.findMany({
        where: { indicatorId },
      });
      const allSubIndIds = allSubIndsForIndicator.map(s => s.id);
      
      const subIndData = await tx.stateSubIndicatorData.findMany({
        where: { stateId, subIndicatorId: { in: allSubIndIds } },
      });
      
      const indAvg = subIndData.length 
        ? subIndData.reduce((acc, curr) => acc + curr.score, 0) / subIndData.length 
        : 0;
      
      const newIndicatorScore = parseFloat((indAvg * 100).toFixed(2));

      await tx.stateIndicatorScore.upsert({
        where: { stateId_indicatorId: { stateId, indicatorId } },
        update: { score: newIndicatorScore },
        create: { stateId, indicatorId, score: newIndicatorScore },
      });

      // 3. Recalculate Domain Score (mean of indicators)
      const allIndsForDomain = await tx.indicator.findMany({
        where: { domainId },
      });
      const allIndIds = allIndsForDomain.map(i => i.id);

      const indData = await tx.stateIndicatorScore.findMany({
        where: { stateId, indicatorId: { in: allIndIds } },
      });

      const domAvg = indData.length
        ? indData.reduce((acc, curr) => acc + curr.score, 0) / indData.length
        : 0;
      
      const newDomainScore = parseFloat(domAvg.toFixed(2));

      await tx.stateDomainScore.upsert({
        where: { stateId_domainId: { stateId, domainId } },
        update: { score: newDomainScore },
        create: { stateId, domainId, score: newDomainScore },
      });

      // 4. Recalculate Overall State Score (weighted sum of domains)
      // Note: User mentioned we might calculate overall ranking differently later,
      // but for now we maintain the current baseScore formula.
      const allDomains = await tx.domain.findMany();
      const allStateDomainScores = await tx.stateDomainScore.findMany({
        where: { stateId },
      });

      let weightedTotal = 0;
      for (const d of allDomains) {
        const dScore = allStateDomainScores.find(s => s.domainId === d.id)?.score || 0;
        // Default weight is normally like 16, representing 16% (0.16)
        weightedTotal += dScore * (d.defaultWeight / 100);
      }

      await tx.state.update({
        where: { id: stateId },
        data: { baseScore: parseFloat(weightedTotal.toFixed(2)) },
      });

      // 5. Rank recalculation can be done synchronously for baseRank
      const allStates = await tx.state.findMany({ orderBy: { baseScore: "desc" } });
      for (let i = 0; i < allStates.length; i++) {
        await tx.state.update({
          where: { id: allStates[i].id },
          data: { baseRank: i + 1 },
        });
      }

      // Also recalculate domain rank for this domain
      const allStatesForDomain = await tx.stateDomainScore.findMany({
        where: { domainId },
        orderBy: { score: "desc" },
      });
      for (let i = 0; i < allStatesForDomain.length; i++) {
        await tx.stateDomainScore.update({
          where: { id: allStatesForDomain[i].id },
          data: { rank: i + 1 },
        });
      }
    }, { timeout: 60000, maxWait: 10000 });

    res.json({ message: "Score updated and recalculations complete." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to update score." });
  }
});

// ─── 5. Bulk Update Indicator's Sub-Indicators & Recalculate ──────────
router.put("/states/:stateId/indicators/:indicatorId/scores", async (req, res) => {
  const { stateId, indicatorId } = req.params;
  const { subIndicators } = req.body; // Array of { subIndicatorId, score, status }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Bulk update raw sub-indicator data
      for (const sub of subIndicators) {
        await tx.stateSubIndicatorData.upsert({
          where: {
            stateId_subIndicatorId: { stateId, subIndicatorId: sub.subIndicatorId },
          },
          update: { score: sub.score, status: sub.status || "Updated manually" },
          create: { stateId, subIndicatorId: sub.subIndicatorId, score: sub.score, status: sub.status || "Updated manually" },
        });
      }

      // Find domainId
      const indicator = await tx.indicator.findUnique({
        where: { id: indicatorId },
      });
      if (!indicator) throw new Error("Indicator not found");
      const domainId = indicator.domainId;

      // 2. Recalculate Indicator Score
      const allSubIndsForIndicator = await tx.subIndicator.findMany({
        where: { indicatorId },
      });
      const allSubIndIds = allSubIndsForIndicator.map(s => s.id);
      
      const subIndData = await tx.stateSubIndicatorData.findMany({
        where: { stateId, subIndicatorId: { in: allSubIndIds } },
      });
      
      const indAvg = subIndData.length 
        ? subIndData.reduce((acc, curr) => acc + curr.score, 0) / subIndData.length 
        : 0;
      
      const newIndicatorScore = parseFloat((indAvg * 100).toFixed(2));

      await tx.stateIndicatorScore.upsert({
        where: { stateId_indicatorId: { stateId, indicatorId } },
        update: { score: newIndicatorScore },
        create: { stateId, indicatorId, score: newIndicatorScore },
      });

      // 3. Recalculate Domain Score
      const allIndsForDomain = await tx.indicator.findMany({
        where: { domainId },
      });
      const allIndIds = allIndsForDomain.map(i => i.id);

      const indData = await tx.stateIndicatorScore.findMany({
        where: { stateId, indicatorId: { in: allIndIds } },
      });

      const domAvg = indData.length
        ? indData.reduce((acc, curr) => acc + curr.score, 0) / indData.length
        : 0;
      
      const newDomainScore = parseFloat(domAvg.toFixed(2));

      await tx.stateDomainScore.upsert({
        where: { stateId_domainId: { stateId, domainId } },
        update: { score: newDomainScore },
        create: { stateId, domainId, score: newDomainScore },
      });

      // 4. Recalculate Overall State Score
      const allDomains = await tx.domain.findMany();
      const allStateDomainScores = await tx.stateDomainScore.findMany({
        where: { stateId },
      });

      let weightedTotal = 0;
      for (const d of allDomains) {
        const dScore = allStateDomainScores.find(s => s.domainId === d.id)?.score || 0;
        weightedTotal += dScore * (d.defaultWeight / 100);
      }

      await tx.state.update({
        where: { id: stateId },
        data: { baseScore: parseFloat(weightedTotal.toFixed(2)) },
      });

      // 5. Rank recalculation
      const allStates = await tx.state.findMany({ orderBy: { baseScore: "desc" } });
      for (let i = 0; i < allStates.length; i++) {
        await tx.state.update({
          where: { id: allStates[i].id },
          data: { baseRank: i + 1 },
        });
      }

      // Also recalculate domain rank for this domain
      const allStatesForDomain = await tx.stateDomainScore.findMany({
        where: { domainId },
        orderBy: { score: "desc" },
      });
      for (let i = 0; i < allStatesForDomain.length; i++) {
        await tx.stateDomainScore.update({
          where: { id: allStatesForDomain[i].id },
          data: { rank: i + 1 },
        });
      }
    }, { timeout: 60000, maxWait: 10000 });

    res.json({ message: "Indicator scores updated and recalculations complete." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to update indicator scores." });
  }
});


// ─── 6. State CRUD ─────────────────────────────────────────────────────────────
router.post("/states", async (req, res) => {
  try {
    const { id, name, type, region } = req.body;
    const state = await prisma.state.create({
      data: { 
        id, 
        name, 
        type: type || "STATE", 
        region: region || "North", 
        baseScore: 0, 
        baseRank: 999 
      },
    });
    res.status(201).json({ data: state });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/states/:id", async (req, res) => {
  try {
    const { stateOfSchooling, regulatoryFramework } = req.body;
    const state = await prisma.state.update({
      where: { id: req.params.id },
      data: { stateOfSchooling, regulatoryFramework },
    });
    res.json({ data: state });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/states/:id", async (req, res) => {
  try {
    // Delete cascading references first if necessary, or just rely on Prisma cascade
    // We will do a transaction to delete all dependent data
    const id = req.params.id;
    await prisma.$transaction([
      prisma.stateSubIndicatorData.deleteMany({ where: { stateId: id } }),
      prisma.stateIndicatorScore.deleteMany({ where: { stateId: id } }),
      prisma.stateDomainScore.deleteMany({ where: { stateId: id } }),
      prisma.state.delete({ where: { id } }),
    ]);
    res.json({ message: "State deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
