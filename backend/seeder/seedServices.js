import mongoose from "mongoose";
import Service from "../models/Service.js";

await mongoose.connect("mongodb://127.0.0.1:27017/carvosh");

await Service.deleteMany();
await Service.insertMany([
    { key: "wash", title: "Об задан", price: 30 },
    { key: "clean", title: "Пок кардан", price: 25 },
    { key: "vacuum", title: "Пласос кардан", price: 20 }
]);

console.log("Services seeded");
process.exit();
