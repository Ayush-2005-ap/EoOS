import { Router } from "express";
import { getAllVoices, createVoice, updateVoice, deleteVoice } from "../controllers/voiceController";

const router = Router();

router.get("/", getAllVoices);
router.post("/", createVoice);
router.put("/:id", updateVoice);
router.delete("/:id", deleteVoice);

export default router;
