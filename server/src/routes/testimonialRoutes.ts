import { Router } from "express";
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "../controllers/testimonialController";

const router = Router();

router.get("/", getAllTestimonials);
router.post("/", createTestimonial);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
