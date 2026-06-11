"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_prod";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
router.post("/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jsonwebtoken_1.default.sign({ role: "ADMIN" }, JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token });
    }
    return res.status(401).json({ error: "Invalid password" });
});
exports.default = router;
