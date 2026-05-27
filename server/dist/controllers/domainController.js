"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDomains = getAllDomains;
exports.getDomainLeaderboard = getDomainLeaderboard;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * GET /api/domains
 * Returns all domains with their indicators.
 */
async function getAllDomains(req, res) {
    try {
        const domains = await prisma_1.default.domain.findMany({
            orderBy: { id: "asc" },
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
        return res.json({ data: domains, count: domains.length });
    }
    catch (error) {
        console.error("[GET /api/domains]", error);
        return res.status(500).json({ error: "Failed to fetch domains." });
    }
}
/**
 * GET /api/domains/:id/leaderboard
 * Returns a ranked list of states for a specific domain.
 */
async function getDomainLeaderboard(req, res) {
    try {
        const domainId = req.params.id;
        const domain = await prisma_1.default.domain.findUnique({ where: { id: domainId } });
        if (!domain) {
            return res.status(404).json({ error: `Domain '${domainId}' not found.` });
        }
        const scores = await prisma_1.default.stateDomainScore.findMany({
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
    }
    catch (error) {
        console.error("[GET /api/domains/:id/leaderboard]", error);
        return res.status(500).json({ error: "Failed to fetch domain leaderboard." });
    }
}
