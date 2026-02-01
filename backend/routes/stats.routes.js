import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

function startOfDayLocal(d = new Date()) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

async function sumFrom(dateFrom) {
    const agg = await Order.aggregate([
        { $match: { createdAt: { $gte: dateFrom } } },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                revenue: { $sum: { $ifNull: ["$total", 0] } },
            },
        },
    ]);

    const row = agg[0] || { count: 0, revenue: 0 };
    return { count: row.count, revenue: row.revenue };
}

router.get("/", async (req, res) => {
    try {
        const day = await sumFrom(startOfDayLocal()); // имрӯз
        const week = await sumFrom(daysAgo(7));       // 7 рӯзи охир
        const month = await sumFrom(daysAgo(30));     // 30 рӯзи охир

        res.json({
            day: { ...day, label: "Имрӯз" },
            week: { ...week, label: "7 рӯзи охир" },
            month: { ...month, label: "30 рӯзи охир" },
        });
    } catch (e) {
        console.error("STATS_ERROR:", e);
        res.status(500).json({ message: "Stats error", error: e?.message });
    }
});

export default router;

