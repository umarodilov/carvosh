import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
    key: {
        type: String,
        enum: ["wash", "clean", "vacuum"],
        required: true,
        unique: true
    },
    title: String,
    price: Number
});

export default mongoose.model("Service", ServiceSchema);
