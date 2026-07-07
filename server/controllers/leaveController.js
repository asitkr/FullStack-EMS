import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";


// Create leave application
// POST /api/leaves
export const createLeave = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({ userId: session.userId });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        if (employee.isDeleted) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. You cannot apply for leave.",
            });
        }

        const { type, startDate, endDate, reason } = req.body;

        if (!type || !startDate || !endDate || !reason) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight for date comparison
        if (new Date(startDate) < today || new Date(endDate) < today) {
            return res.status(400).json({
                success: false,
                message: "Leave dates must be in the future",
            });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        const leave = await LeaveApplication.create({
            employeeId: employee._id,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: "PENDING",
        })

        return res.status(201).json({
            success: true,
            message: "Leave application submitted successfully",
            data: leave
        });
    } catch (error) {
        console.error("Error in applying leave application:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// Get leave applications
// GET /api/leaves
export const getLeaves = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session.role === "ADMIN";

        if (isAdmin) {
            const status = req.query.status;
            const where = status ? { status } : {};
            const leaves = await LeaveApplication.find(where).populate('employeeId').sort({ createdAt: -1 });
            const data = leaves.map((l) => {
                const obj = l.toObject();
                return {
                    ...obj,
                    id: obj._id.toString(),
                    employee: obj.employeeId,
                    employeeId: obj.employeeId._id.toString(),
                }
            })

            return res.status(200).json({
                success: true,
                message: "Leave applications fetched successfully",
                data,
            })
        } else {
            const employee = await Employee.findOne({ userId: session.userId }).lean();

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found",
                });
            }

            const leaves = await LeaveApplication.find({ 
                employeeId: employee._id 
            }).sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: "Leave applications fetched successfully",
                data: leaves,
                employee: {
                    ...employee,
                    id: employee._id.toString(),
                }
            })
        }
    } catch (error) {
        console.error("Error in fetching leave applications:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// Update the leave application status
// PATCH /api/leaves/:id
export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if(!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave status",
            });
        }

        const leaves = await LeaveApplication.findByIdAndUpdate(id, { status }, { returnDocument: "after" });
        return res.status(200).json({
            success: true,
            message: "Leave status updated successfully",
            data: leaves
        });
    } catch (error) {
        console.error("Error in updating leave status:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}