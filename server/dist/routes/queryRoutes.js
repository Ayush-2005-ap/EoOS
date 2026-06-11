"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Public: Submit a query
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const query = await prisma.query.create({
            data: { name, email, subject, message },
        });
        res.status(201).json({ data: query, message: "Query submitted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Admin: Get all queries
router.get("/", authMiddleware_1.requireAdmin, async (_req, res) => {
    try {
        const queries = await prisma.query.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json({ data: queries });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Admin: Update query status
router.put("/:id", authMiddleware_1.requireAdmin, async (req, res) => {
    try {
        const { status } = req.body; // e.g., "CLOSED"
        const query = await prisma.query.update({
            where: { id: String(req.params.id) },
            data: { status },
        });
        res.json({ data: query });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Admin: Delete a query
router.delete("/:id", authMiddleware_1.requireAdmin, async (req, res) => {
    try {
        await prisma.query.delete({ where: { id: String(req.params.id) } });
        res.json({ message: "Query deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
