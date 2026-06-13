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

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: "research@ccs.in",
      replyTo: email,
      subject: `New Query from ${name}: ${subject || 'No Subject'}`,
      text: `Name: ${name}\nEmail: ${email}\nOrganization: ${org || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log("No SMTP credentials provided in .env. Skipping actual email send. Email would be:");
      console.log(mailOptions);
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
