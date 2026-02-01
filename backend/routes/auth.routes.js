import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email ва password лозим аст" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Bad credentials" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ message: "Bad credentials" });

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            token,
            user: { id: user._id, email: user.email, role: user.role },
        });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user.id).select("name email role");
    res.json(user);
});

export default router;
