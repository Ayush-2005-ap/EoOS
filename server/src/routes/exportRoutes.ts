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

        const firstName = name.split(' ')[0] || "there";

        await transporter.sendMail({
          from: `"EoOS Index Data Portal" <${process.env.SMTP_USER || "no-reply@ethereal.email"}>`,
          to: email,
          subject: "Your EoOS Index Report Download",
          html: `<p>Hello ${firstName},</p>
<p>Thank you for downloading the Ease of Operating Schools Index 2026. The report is attached to this email, so you have a copy to keep and share.</p>
<p>The Index is a comparative assessment of school regulatory frameworks across Indian states. It looks at the regulatory burden schools face and where the process can be made simpler, so that school leaders can spend less time on compliance and more on students.</p>
<p>If you find the report useful, here are a few ways to stay connected with our work at the Centre for Civil Society:</p>
<ol>
  <li>Follow Student First at <a href="https://studentfirst.in">studentfirst.in</a> for updates on school education reform</li>
  <li>Visit <a href="https://ccs.in">ccs.in</a> to explore our research across education, livelihood, and governance</li>
  <li>Follow us on <a href="https://www.linkedin.com/company/centre-for-civil-society/">LinkedIn</a> and <a href="https://twitter.com/ccsindia">Twitter</a> for regular findings, data, and stories on the ground</li>
</ol>
<p>We hope the Index is a useful reference in your work.</p>
<p>Warm regards,<br/>Centre for Civil Society</p>`,
          text: `Hello ${firstName},\n\nThank you for downloading the Ease of Operating Schools Index 2026. The report is attached to this email, so you have a copy to keep and share.\n\nThe Index is a comparative assessment of school regulatory frameworks across Indian states. It looks at the regulatory burden schools face and where the process can be made simpler, so that school leaders can spend less time on compliance and more on students.\n\nIf you find the report useful, here are a few ways to stay connected with our work at the Centre for Civil Society:\n\n1. Follow Student First at studentfirst.in for updates on school education reform\n2. Visit ccs.in to explore our research across education, livelihood, and governance\n3. Follow us on LinkedIn and Twitter for regular findings, data, and stories on the ground\n\nWe hope the Index is a useful reference in your work.\n\nWarm regards,\nCentre for Civil Society`,
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
