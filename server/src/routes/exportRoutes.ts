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
      text: `Dear ${name},\n\nThank you for downloading the Ease of Operating Schools (EoOS) Index 2026. Please find your requested CSV dataset attached to this email.\n\nWe appreciate your interest in our research work and hope the report serves as a useful resource for understanding the regulatory framework governing unaided private schools across India. The Index aims to contribute to informed discussions on the governance of private school education and to support evidence-based policy reform.\n\nWe would be delighted to hear your feedback, comments, or suggestions on the report. Your insights will help us strengthen future editions and improve the quality of our research.\n\nFor any feedback or queries, please feel free to write to us at research@ccs.in\n\nThank you for your support and engagement.\n\nWarm regards,\n\nCentre for Civil Society`,
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

router.post("/download-consent", async (req, res) => {
  try {
    const { name, email, phone, consent, pdfUrl, filename } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    if (!consent) {
      return res.status(400).json({ error: "Consent is required to proceed." });
    }

    await prisma.datasetSubscriber.create({
      data: {
        name,
        email,
        phone: phone || null,
        consentGiven: true,
      },
    });

    if (pdfUrl) {
      try {
        const pdfRes = await fetch(pdfUrl);
        const arrayBuffer = await pdfRes.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.ethereal.email",
          port: Number(process.env.SMTP_PORT) || 587,
          auth: {
            user: process.env.SMTP_USER || "dewayne.wisoky4@ethereal.email",
            pass: process.env.SMTP_PASS || "nKxH9d74xN2T132dKS",
          },
        });

        await transporter.sendMail({
          from: `"EoOS Index Data Portal" <${process.env.SMTP_USER || "no-reply@ethereal.email"}>`,
          to: email,
          subject: "Your EoOS Index Report Download",
          text: `Dear ${name},\n\nThank you for downloading the Ease of Operating Schools (EoOS) Index 2026. Please find your requested report attached to this email.\n\nWe appreciate your interest in our research work and hope the report serves as a useful resource for understanding the regulatory framework governing unaided private schools across India. The Index aims to contribute to informed discussions on the governance of private school education and to support evidence-based policy reform.\n\nWe would be delighted to hear your feedback, comments, or suggestions on the report. Your insights will help us strengthen future editions and improve the quality of our research.\n\nFor any feedback or queries, please feel free to write to us at research@ccs.in\n\nThank you for your support and engagement.\n\nWarm regards,\n\nCentre for Civil Society`,
          attachments: [
            {
              filename: filename || "EoOS_Report.pdf",
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
        console.log("Download email sent successfully to", email);
      } catch (emailErr) {
        console.error("Failed to send download email:", emailErr);
        // We do not fail the request if just the email sending fails,
        // since the local download will still proceed on the frontend.
      }
    }

    res.json({ message: "Consent recorded successfully." });
  } catch (error) {
    console.error("Download Consent Error:", error);
    res.status(500).json({ error: "Failed to process consent." });
  }
});

export default router;
