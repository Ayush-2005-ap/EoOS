import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getAllTestimonials(req: Request, res: Response) {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
    return res.json({ data: testimonials });
  } catch (error) {
    console.error("[GET /api/testimonials]", error);
    return res.status(500).json({ error: "Failed to fetch testimonials." });
  }
}

export async function createTestimonial(req: Request, res: Response) {
  try {
    const { author, role, quote, avatarUrl, initials, type } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: { author, role, quote, avatarUrl, initials, type }
    });
    return res.status(201).json({ data: testimonial });
  } catch (error) {
    console.error("[POST /api/testimonials]", error);
    return res.status(500).json({ error: "Failed to create testimonial." });
  }
}

export async function updateTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { author, role, quote, avatarUrl, initials, type } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: String(id) },
      data: { author, role, quote, avatarUrl, initials, type }
    });
    return res.json({ data: testimonial });
  } catch (error) {
    console.error("[PUT /api/testimonials/:id]", error);
    return res.status(500).json({ error: "Failed to update testimonial." });
  }
}

export async function deleteTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id: String(id) } });
    return res.json({ message: "Testimonial deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/testimonials/:id]", error);
    return res.status(500).json({ error: "Failed to delete testimonial." });
  }
}
