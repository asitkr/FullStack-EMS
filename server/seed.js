import "dotenv/config";
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";
import User from "./models/User.js";

const temporaryPassword = "admin123"; // Replace with your desired temporary password

async function registerAdmin() {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

        if(!ADMIN_EMAIL) {
            console.error("Missing ADMIN_EMAIL in environment variables.");
            process.exit(1);
        }

        await connectDB();

        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL
        });

        if(existingAdmin) {
            console.log('User already exist as role', existingAdmin.role);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const admin = await User.create({
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN"
        })

        console.log("Admin user created");
        console.log("\nemail:", admin.email);
        console.log("password:", temporaryPassword);
        console.log("\nchange the password after login.");

        process.exit(0);
    } catch (error) {
        console.log("Seed failed:", error);
    }
}

registerAdmin();