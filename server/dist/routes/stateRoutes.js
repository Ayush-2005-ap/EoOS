"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stateController_1 = require("../controllers/stateController");
const router = (0, express_1.Router)();
// GET /api/states           → all states summary (with optional ?type= ?region= filters)
// GET /api/states/:id       → full state profile with indicators and sub-indicators
router.get("/", stateController_1.getAllStates);
router.get("/:id", stateController_1.getStateById);
exports.default = router;
