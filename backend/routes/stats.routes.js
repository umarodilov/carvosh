import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

function startOfTodayLocal() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function startOfNDaysAgoLocal(n) {
    const d = startOfTodayLocal();
    d.setDate(d.getDate() - n);
    return d;
}
function startOfMonthLocal() {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

async function sumFrom(dateFrom) {
    const agg = await Order.aggregate([
        { $match: { createdAt: { $gte: dateFrom } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$total" } } },
    ]);

    const row = agg[0] || { count: 0, revenue: 0 };
    return { count: row.count, revenue: row.revenue };
}

router.get("/", async (req, res) => {
    try {
        const day = await sumFrom(startOfTodayLocal());
        const week = await sumFrom(startOfNDaysAgoLocal(6));
        const month = await sumFrom(startOfMonthLocal());

        res.json({ day, week, month });
    } catch (e) {
        console.error("STATS_ERROR:", e);
        res.status(500).json({ message: "Stats error", error: e?.message });
    }
});

export default router;
