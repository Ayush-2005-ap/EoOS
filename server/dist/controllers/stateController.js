"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStates = getAllStates;
exports.getStateById = getStateById;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * GET /api/states
 * Returns all states with their domain scores and base rank.
 * Supports optional query filters: ?type=STATE|UT&region=North|South|...
 */
async function getAllStates(req, res) {
    try {
        const { type, region } = req.query;
        const states = await prisma_1.default.state.findMany({
            where: {
                ...(type ? { type: String(type).toUpperCase() } : {}),
                ...(region ? { region: String(region) } : {}),
            },
            orderBy: { baseRank: "asc" },
            include: {
                domainScores: {
                    include: { domain: true },
                    orderBy: { domainId: "asc" },
                },
                indicatorScores: {
                    include: { indicator: true },
                },
            },
        });
        const formatted = states.map((state) => ({
            id: state.id,
            name: state.name,
            type: state.type,
            region: state.region,
            baseScore: state.baseScore,
            baseRank: state.baseRank,
            pdfUrl: state.pdfUrl,
            scores: Object.fromEntries(state.domainScores.map((ds) => [ds.domainId, ds.score])),
            indicators: state.indicatorScores.reduce((acc, is) => {
                const domainId = is.indicator.domainId;
                if (!acc[domainId])
                    acc[domainId] = [];
                acc[domainId].push({ name: is.indicator.name, score: is.score });
                return acc;
            }, {}),
        }));
        return res.json({ data: formatted, count: formatted.length });
    }
    catch (error) {
        console.error("[GET /api/states]", error);
        return res.status(500).json({ error: "Failed to fetch states." });
    }
}
/**
 * GET /api/states/:id
 * Returns full state profile including indicators and sub-indicators.
 */
async function getStateById(req, res) {
    try {
        const stateId = String(req.params.id).toUpperCase();
        const state = await prisma_1.default.state.findUnique({
            where: { id: stateId },
            include: {
                domainScores: {
                    include: { domain: true },
                },
                indicatorScores: {
                    include: {
                        indicator: {
                            include: { domain: true },
                        },
                    },
                },
                subIndicatorData: {
                    include: {
                        subIndicator: {
                            include: {
                                indicator: {
                                    include: { domain: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!state) {
            return res.status(404).json({ error: `State '${stateId}' not found.` });
        }
        // Build a structured domain → indicator → sub-indicator hierarchy
        const domainMap = {};
        // Initialize domains
        for (const ds of state.domainScores) {
            domainMap[ds.domainId] = {
                domainId: ds.domainId,
                domainName: ds.domain.name,
                score: ds.score,
                indicators: {},
            };
        }
        // Initialize indicators
        for (const is of state.indicatorScores) {
            const domainId = is.indicator.domainId;
            if (!domainMap[domainId])
                continue;
            domainMap[domainId].indicators[is.indicatorId] = {
                indicatorId: is.indicatorId,
                indicatorName: is.indicator.name,
                score: is.score,
                subIndicators: [],
            };
        }
        // Attach sub-indicators
        for (const sub of state.subIndicatorData) {
            const domainId = sub.subIndicator.indicator.domainId;
            const indicatorId = sub.subIndicator.indicatorId;
            if (!domainMap[domainId]?.indicators[indicatorId])
                continue;
            domainMap[domainId].indicators[indicatorId].subIndicators.push({
                id: sub.subIndicatorId,
                name: sub.subIndicator.name,
                score: sub.score,
                status: sub.status,
            });
        }
        const result = {
            id: state.id,
            name: state.name,
            type: state.type,
            region: state.region,
            baseScore: state.baseScore,
            baseRank: state.baseRank,
            pdfUrl: state.pdfUrl,
            stateOfSchooling: state.stateOfSchooling,
            regulatoryFramework: state.regulatoryFramework,
            domains: Object.values(domainMap).map((d) => ({
                ...d,
                indicators: Object.values(d.indicators),
            })).sort((a, b) => a.domainName.localeCompare(b.domainName)),
        };
        return res.json({ data: result });
    }
    catch (error) {
        console.error("[GET /api/states/:id]", error);
        return res.status(500).json({ error: "Failed to fetch state details." });
    }
}
