import Employee from "../models/Employee.js";

// Get profile
// GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({ userId: session.userId }).lean();

        if (!employee) {
            // Authenticated user is not an employee - return admin profile
            return res.status(200).json({
                success: true,
                firstName: 'Admin',
                lastName: '',
                email: session.email,
                role: session.role,
            })
        }

        return res.status(200).json(employee)
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
}

// Update profile
// PUT /api/profile
export const updateProfile = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({ userId: session.userId });

        if(!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            })
        }

        if(employee.isDeleted) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated. You cannot update your profile.'
            })
        }

        await Employee.findByIdAndUpdate(employee._id, {
            bio: req.body.bio || '',
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
}