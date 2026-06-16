import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_prod";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;

router.post("/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "ADMIN" }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid password" });
});

export default router;
