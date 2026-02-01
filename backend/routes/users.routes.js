import express from "express";
import User from "../models/User.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ✅ ADMIN: list users
router.get("/", auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find()
            .select("email role createdAt updatedAt")
            .sort({ createdAt: -1 });

        return res.json(users);
    } catch (e) {
        console.error("USERS_LIST_ERROR:", e);
        return res.status(500).json({ message: "Users load error", error: e?.message });
    }
});

// ✅ ADMIN: set role
router.put("/:id/role", auth, adminOnly, async (req, res) => {
    try {
        const { role } = req.body;

        if (!["admin", "user"].includes(role)) {
            return res.status(400).json({ message: "Role бояд admin ё user бошад" });
        }

        // (ихтиёрӣ) худро admin-ро user накун, то блок нашавад
        if (req.user?.id === req.params.id && role !== "admin") {
            return res.status(400).json({ message: "Шумо худро user карда наметавонед" });
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("email role createdAt updatedAt");

        if (!updated) return res.status(404).json({ message: "User not found" });

        return res.json(updated);
    } catch (e) {
        console.error("USER_ROLE_ERROR:", e);
        return res.status(500).json({ message: "Role update error", error: e?.message });
    }
});

export default router;
