import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


// Login for employee and admin
// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password, role_type } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if(role_type === "admin" && user.role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                error: "Not authorized as admin"
            })
        }

        if(role_type === "employee" && user.role !== "EMPLOYEE") {
            return res.status(401).json({
                success: false,
                error: "Not authorized as employee"
            })
        }

        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            })
        }

        const payload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        }

        // const token = JWT_SECRET
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        return res.json({
            success: true,
            message: "Login successful",
            user: payload,
            token
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


//  Get session for employee and admin
// GET /api/auth/session
export const session = async (req, res) => {
    const session = req.session;

    return res.json({
        success: true,
        user: session
    })
}

//  Change password for employee and admin
// POST /api/auth/change-password
export const changePassword = async (req, res) => {
    try {
        const session = req.session;
        const { currentPassword, newPassword } = req.body;
        if(!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both passwords are required"
            })
        }

        const user = await User.findById(session.userId);
        if(!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            })
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if(!isValid) {
            return res.status(400).json({
                success: false,
                error: "Current passwords is incorrect"
            })
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(session.userId, { password: hashed});
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: "Failed to change password" });
    }
}