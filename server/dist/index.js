"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const stateRoutes_1 = __importDefault(require("./routes/stateRoutes"));
const domainRoutes_1 = __importDefault(require("./routes/domainRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((0, cors_1.default)()); // Allow all origins in dev
app.use(express_1.default.json());
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const queryRoutes_1 = __importDefault(require("./routes/queryRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const path_1 = __importDefault(require("path"));
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "../../public")));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/states", stateRoutes_1.default);
app.use("/api/domains", domainRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/media", mediaRoutes_1.default);
app.use("/api/queries", queryRoutes_1.default);
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
exports.default = app;
