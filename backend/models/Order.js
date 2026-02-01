import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        customerName: { type: String, default: "" },
        phone: { type: String, default: "" },
        carType: { type: String, default: "" },

        // ✅ FIX: required нест + default дорад
        periodType: {
            type: String,
            enum: ["day", "week", "month"],
            default: "day",
            required: false,
        },
        periodCount: {
            type: Number,
            default: 1,
        },

        selected: {
            wash: { type: Boolean, default: false },
            clean: { type: Boolean, default: false },
            vacuum: { type: Boolean, default: false },
        },

        prices: {
            wash: { type: Number, default: 0 },
            clean: { type: Number, default: 0 },
            vacuum: { type: Number, default: 0 },
        },

        discount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
