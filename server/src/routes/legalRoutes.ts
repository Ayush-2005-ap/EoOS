import { Router } from "express";
import { upload } from "../middlewares/upload";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  uploadDocument,
  getDocuments,
  deleteDocument
} from "../controllers/legalController";

const router = Router();

// Legal Categories
router.post("/categories", createCategory);
router.get("/categories", getCategories);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Legal Documents
router.post("/documents", upload.single("pdf"), uploadDocument);
router.get("/documents", getDocuments);
router.delete("/documents/:id", deleteDocument);

export default router;
