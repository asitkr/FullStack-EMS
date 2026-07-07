import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import { DEPARTMENTS } from "../constants/departments.js";
import LeaveApplication from "../models/LeaveApplication.js";
import Payslip from "../models/Payslip.js";


// Get dashboard for employee and admin
// GET /api/dashboard
export const getDashboard = async (req, res) => {
    try {
        const session = req.session;
        if (session.role === "ADMIN") {
            const [totalEmployees, totalAttendance, pendingLeaves] = await Promise.all([
                // Queries for admin dashboard
                Employee.countDocuments({ isDeleted: { $ne: true } }),
                Attendance.countDocuments({
                    date: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lt: new Date(new Date().setHours(24, 0, 0, 0))
                    }
                }),
                LeaveApplication.countDocuments({ status: "PENDING" })
            ]);

            return res.status(200).json({
                success: true,
                role: "ADMIN",
                totalEmployees,
                totalDepartments: DEPARTMENTS.length,
                totalAttendance,
                pendingLeaves
            });
        } else {
            const employee = await Employee.findOne({
                userId: session.userId,
            }).lean();

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found",
                });
            }

            const today = new Date();
            const [currentMonthAttendance, pendingLeaves, latestPayslip] = await Promise.all([
                Attendance.countDocuments({
                    employeeId: employee._id,
                    date: {
                        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                        $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
                    }
                }),
                LeaveApplication.countDocuments({
                    employeeId: employee._id,
                    status: "PENDING",
                }),
                Payslip.findOne({
                    employeeId: employee._id,
                }).sort({ createdAt: -1 }).lean(),
            ]);

            return res.status(200).json({
                success: true,
                role: "EMPLOYEE",
                employee: {
                    ...employee,
                    id: employee._id.toString(),
                },
                currentMonthAttendance,
                pendingLeaves,
                latestPayslip: latestPayslip ? { ...latestPayslip, id: latestPayslip._id.toString() } : null
            })
        }
    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching dashboard data"
        });
    }
} 