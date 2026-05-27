import { Router } from "express";
import { getAllStates, getStateById } from "../controllers/stateController";

const router = Router();

// GET /api/states           → all states summary (with optional ?type= ?region= filters)
// GET /api/states/:id       → full state profile with indicators and sub-indicators
router.get("/", getAllStates);
router.get("/:id", getStateById);

export default router;
