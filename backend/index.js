import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// routes
import orderRoutes from "./routes/order.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";


dotenv.config();

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Env =====
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env");
}

// ===== MongoDB =====
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err.message));

// ===== Routes =====
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);


// ===== Health check =====
app.get("/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

// ===== 404 handler =====
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ===== Global error handler =====
app.use((err, req, res, next) => {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({
        message: "Internal server error",
        error: err?.message,
    });
});

// ===== Start server =====
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
