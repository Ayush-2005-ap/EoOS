import { Request, Response } from "express";
import prisma from "../lib/prisma";

/**
 * GET /api/domains
 * Returns all domains with their indicators.
 */
export async function getAllDomains(req: Request, res: Response) {
  try {
    console.log("HELLO FROM GETALLDOMAINS");
    const domains = await prisma.domain.findMany({
      orderBy: { name: "asc" },
      include: {
        indicators: {
          orderBy: { id: "asc" },
          include: {
            subIndicators: {
              select: { id: true, name: true, maxScore: true },
            },
          },
        },
      },
    });

    domains.sort((a, b) => a.name.localeCompare(b.name));

    return res.json({ data: domains, count: domains.length });
  } catch (error) {
    console.error("[GET /api/domains]", error);
    return res.status(500).json({ error: "Failed to fetch domains." });
  }
}

/**
 * GET /api/domains/:id/leaderboard
 * Returns a ranked list of states for a specific domain.
 */
export async function getDomainLeaderboard(req: Request, res: Response) {
  try {
    const domainId = req.params.id as string;

    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) {
      return res.status(404).json({ error: `Domain '${domainId}' not found.` });
    }

    const scores = await prisma.stateDomainScore.findMany({
      where: { domainId },
      orderBy: { score: "desc" },
      include: { state: true },
    });

    const leaderboard = scores.map((s, idx) => ({
      rank: idx + 1,
      stateId: s.stateId,
      stateName: s.state.name,
      score: s.score,
    }));

    return res.json({ domainId, data: leaderboard });
  } catch (error) {
    console.error("[GET /api/domains/:id/leaderboard]", error);
    return res.status(500).json({ error: "Failed to fetch domain leaderboard." });
  }
}
