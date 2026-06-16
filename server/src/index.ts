import "dotenv/config";
import express from "express";
import cors from "cors";
import stateRoutes from "./routes/stateRoutes";
import domainRoutes from "./routes/domainRoutes";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors()); // Allow all origins in dev
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

import adminRoutes from "./routes/adminRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import queryRoutes from "./routes/queryRoutes";
import authRoutes from "./routes/authRoutes";
import authorRoutes from "./routes/authorRoutes";
import configRoutes from "./routes/configRoutes";
import exportRoutes from "./routes/exportRoutes";
import path from "path";

app.use("/public", express.static(path.join(__dirname, "../../public")));

app.use("/api/auth", authRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/config", configRoutes);
app.use("/api/export", exportRoutes);

// ─── 404 Catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ EoOS API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   States: http://localhost:${PORT}/api/states`);
  console.log(`   Domains: http://localhost:${PORT}/api/domains`);
});

export default app;
