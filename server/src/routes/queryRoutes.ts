import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../middleware/authMiddleware";
import nodemailer from "nodemailer";

const router = Router();
const prisma = new PrismaClient();

// Public: Submit a query
router.post("/", async (req, res) => {
  try {
    const { name, email, org, subject, message } = req.body;
    const query = await prisma.query.create({
      data: { name, email, subject, message },
    });

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminMailOptions = {
      from: `"${name}" <${email}>`,
      to: "research@ccs.in",
      replyTo: email,
      subject: `New Query from ${name}: ${subject || 'No Subject'}`,
      text: `Name: ${name}\nEmail: ${email}\nOrganization: ${org || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
    };

    const userMailOptions = {
      from: `"EoOS Research Team" <${process.env.SMTP_USER || "research@ccs.in"}>`,
      to: email,
      subject: `We have received your query: ${subject || 'No Subject'}`,
      text: `Dear ${name},\n\nThank you for reaching out to the Centre for Civil Society regarding the Ease of Operating Schools Index [EoOS] 2026.\n\nWe have received your query. Our research team will review it and get back to you soon. Please note that response times may vary depending on the nature and volume of requests received.\n\nWe appreciate your interest in our research and thank you for your patience.\n\nWarm regards,\n\nResearch Team\nCentre for Civil Society`,
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(userMailOptions);
    } else {
      console.log("No SMTP credentials provided in .env. Skipping actual email send. Emails would be:");
      console.log("Admin Email:", adminMailOptions);
      console.log("User Email:", userMailOptions);
    }

    res.status(201).json({ data: query, message: "Query submitted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all queries
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const queries = await prisma.query.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: queries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update query status
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // e.g., "CLOSED"
    const query = await prisma.query.update({
      where: { id: String(req.params.id) },
      data: { status },
    });
    res.json({ data: query });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete a query
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.query.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Query deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
