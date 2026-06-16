import express from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/email", async (req, res) => {
  try {
    const { name, email, phone, consent, csvData } = req.body;

    if (!name || !email || !csvData) {
      return res.status(400).json({ error: "Name, email, and CSV data are required." });
    }

    if (!consent) {
      return res.status(400).json({ error: "Consent is required to proceed." });
    }

    // 1. Store the subscriber in the database
    await prisma.datasetSubscriber.create({
      data: {
        name,
        email,
        phone: phone || null,
        consentGiven: true,
      },
    });

    // 2. Setup Nodemailer Transporter
    // TODO: The user will replace these with their actual SMTP credentials in the .env file.
    // For now, we use Ethereal Email (a dummy testing service) or process.env configuration.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || "dewayne.wisoky4@ethereal.email",
        pass: process.env.SMTP_PASS || "nKxH9d74xN2T132dKS",
      },
    });

    // 3. Send the Email
    const info = await transporter.sendMail({
      from: `"EoOS Index Data Portal" <${process.env.SMTP_USER || "no-reply@ethereal.email"}>`,
      to: email,
      subject: "Your EoOS Index Rankings Export",
      text: `Hi ${name},\n\nThank you for exporting the State Rankings from the EoOS Index Data Portal.\n\nPlease find your CSV dataset attached to this email.\n\nBest Regards,\nThe EoOS Team`,
      attachments: [
        {
          filename: "EoOS_Index_Rankings.csv",
          content: csvData,
          contentType: "text/csv",
        },
      ],
    });

    console.log("Email sent: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    res.json({ message: "Export successful. Please check your email!" });
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ error: "Failed to process the export request." });
  }
});

export default router;
