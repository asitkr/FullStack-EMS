// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         mongoose.connection.on('connected', () => console.log("Database connected"))
//         await mongoose.connect(process.env.MONGODB_URI);
//     } catch (error) {
//         console.error("Database  connection failed:", error.message);
//     }
// }

// export default connectDB;

import mongoose from "mongoose";

mongoose.connection.once("connected", () => {
    console.log("✅ MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
    console.log("❌ MongoDB Error:", err.message);
});

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing");
        }

        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;