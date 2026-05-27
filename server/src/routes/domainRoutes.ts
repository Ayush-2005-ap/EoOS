import { Router } from "express";
import { getAllDomains, getDomainLeaderboard } from "../controllers/domainController";

const router = Router();

// GET /api/domains                      → all domains with their indicators
// GET /api/domains/:id/leaderboard      → ranked states for a single domain
router.get("/", getAllDomains);
router.get("/:id/leaderboard", getDomainLeaderboard);

export default router;
