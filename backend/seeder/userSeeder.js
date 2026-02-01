// seeders/userSeeder.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const users = [
    {
        email: "admin@mail.com",
        password: "12345678",
        role: "admin"
    },
    {
        email: "user@mail.com",
        password: "12345678",
        role: "user"
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/carvosh");

        await User.deleteMany();

        const hashedUsers = await Promise.all(
            users.map(async (u) => ({
                ...u,
                password: await bcrypt.hash(u.password, 10)
            }))
        );

        await User.insertMany(hashedUsers);

        console.log("✅ Users seeded successfully");
        process.exit();
    } catch (error) {
        console.error("❌ Seeder error:", error);
        process.exit(1);
    }
};

seedUsers();
