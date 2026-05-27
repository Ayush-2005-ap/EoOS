"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const domainController_1 = require("../controllers/domainController");
const router = (0, express_1.Router)();
// GET /api/domains                      → all domains with their indicators
// GET /api/domains/:id/leaderboard      → ranked states for a single domain
router.get("/", domainController_1.getAllDomains);
router.get("/:id/leaderboard", domainController_1.getDomainLeaderboard);
exports.default = router;
