import express from "express";
import Service from "../models/Service.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ҳама мебинанд
router.get("/", async (req, res) => {
    const services = await Service.find().sort({ key: 1 });
    res.json(services);
});

// танҳо админ тағйир медиҳад
router.put("/:id", auth, adminOnly, async (req, res) => {
    const { title, price, key } = req.body;
    const updated = await Service.findByIdAndUpdate(
        req.params.id,
        { title, price, key },
        { new: true, runValidators: true }
    );
    res.json(updated);
});

export default router;
