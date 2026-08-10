import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { supabaseStorage } from "../middlewares/upload";

const prisma = new PrismaClient();

// =========================================
// LEGAL CATEGORIES (CENTRAL LAWS TABS)
// =========================================

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const category = await prisma.legalCategory.create({
      data: { name },
    });
    res.status(201).json({ data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.legalCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const category = await prisma.legalCategory.update({
      where: { id },
      data: { name },
    });
    res.status(200).json({ data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.legalCategory.delete({
      where: { id },
    });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =========================================
// LEGAL DOCUMENTS
// =========================================

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, lawType, categoryId, stateId, isRule } = req.body;
    
    if (!title || !lawType) {
      res.status(400).json({ error: "Title and lawType are required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "PDF file is required" });
      return;
    }

    // Convert file size to MB string
    const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = `${sizeInMB} MB`;

    // Upload to Supabase Storage
    // Generate unique filename
    const uniqueFileName = `legal_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const uploadResult = await supabaseStorage.upload(uniqueFileName, req.file.buffer || req.file.path, req.file.mimetype);

    // Save to DB
    const document = await prisma.legalDocument.create({
      data: {
        title,
        lawType,
        pdfUrl: uploadResult.publicUrl,
        size: sizeStr,
        categoryId: categoryId || null,
        stateId: stateId || null,
        isRule: isRule === "true" || isRule === true, // handle multipart string boolean
      },
      include: {
        category: true,
        state: true
      }
    });

    res.status(201).json({ data: document });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lawType } = req.query;
    
    const whereClause: any = {};
    if (lawType) {
      whereClause.lawType = String(lawType);
    }

    const documents = await prisma.legalDocument.findMany({
      where: whereClause,
      include: {
        category: true,
        state: true
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ data: documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const document = await prisma.legalDocument.findUnique({ where: { id } });
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    // Extract filename from Supabase URL to delete it from storage
    // Example URL: https://.../storage/v1/object/public/eoos-media/legal_12345_file.pdf
    const urlParts = document.pdfUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    try {
      await supabaseStorage.remove(fileName);
    } catch (storageError) {
      console.error("Failed to delete file from Supabase, but continuing DB deletion", storageError);
    }

    await prisma.legalDocument.delete({ where: { id } });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
