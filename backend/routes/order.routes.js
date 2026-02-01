import express from "express";
import Service from "../models/Service.js";
import Order from "../models/Order.js";
import { calculateTotal } from "../scripts/calcPrice.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ✅ CREATE order (ҳама)
router.post("/", async (req, res) => {
    try {
        const {
            customerName,
            phone,
            carType,
            selected,
            periodType,
            periodCount,
            discount,
        } = req.body;

        const services = await Service.find();

        const getPrice = (k) => (services.find((s) => s.key === k)?.price ?? 0);

        const prices = {
            wash: getPrice("wash"),
            clean: getPrice("clean"),
            vacuum: getPrice("vacuum"),
        };

        const total = calculateTotal({
            services: prices,
            selected,
            periodType,
            periodCount,
            discount,
        });

        const order = await Order.create({
            customerName,
            phone,
            carType,
            selected,
            periodType,
            periodCount,
            prices,
            discount,
            total,
        });

        return res.json(order);
    } catch (e) {
        console.error("ORDER_CREATE_ERROR:", e);
        return res.status(500).json({ message: "Order create error", error: e?.message });
    }
});

// ✅ ADMIN: ҳама order-ҳо
router.get("/", auth, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.json(orders);
    } catch (e) {
        console.error("ORDERS_LIST_ERROR:", e);
        return res.status(500).json({ message: "Orders load error", error: e?.message });
    }
});

// ✅ ADMIN: delete order
router.delete("/:id", auth, adminOnly, async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Order not found" });
        return res.json({ ok: true });
    } catch (e) {
        console.error("ORDER_DELETE_ERROR:", e);
        return res.status(500).json({ message: "Order delete error", error: e?.message });
    }
});

export default router;
