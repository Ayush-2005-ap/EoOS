import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getAllVoices(req: Request, res: Response) {
  try {
    const voices = await prisma.voice.findMany({ orderBy: { createdAt: "desc" } });
    return res.json({ data: voices });
  } catch (error) {
    console.error("[GET /api/voices]", error);
    return res.status(500).json({ error: "Failed to fetch voices." });
  }
}

export async function createVoice(req: Request, res: Response) {
  try {
    const { title, category, videoUrl, thumbnailPath, youtubeUrl } = req.body;
    const voice = await prisma.voice.create({
      data: { title, category, videoUrl, thumbnailPath, youtubeUrl }
    });
    return res.status(201).json({ data: voice });
  } catch (error) {
    console.error("[POST /api/voices]", error);
    return res.status(500).json({ error: "Failed to create voice." });
  }
}

export async function updateVoice(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, category, videoUrl, thumbnailPath, youtubeUrl } = req.body;
    const voice = await prisma.voice.update({
      where: { id: String(id) },
      data: { title, category, videoUrl, thumbnailPath, youtubeUrl }
    });
    return res.json({ data: voice });
  } catch (error) {
    console.error("[PUT /api/voices/:id]", error);
    return res.status(500).json({ error: "Failed to update voice." });
  }
}

export async function deleteVoice(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.voice.delete({ where: { id: String(id) } });
    return res.json({ message: "Voice deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/voices/:id]", error);
    return res.status(500).json({ error: "Failed to delete voice." });
  }
}
