import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";

// Clock in/out for employee
// POST /api/attendance
export const clockInOut = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({ userId: session.userId });

        if(!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            })
        }

        if(employee.isDeleted) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated. You cannot clock in/out.'
            })
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight for date comparison

        const existing = await Attendance.findOne({
            employeeId: employee._id,
            date: today,
        })

        const now = new Date();

        if(!existing) {
            const isLate = now.getHours() >= 9 && now.getMinutes() > 0; // Assuming 9:00 AM is the threshold for being late
            const attendance = await Attendance.create({
                employeeId: employee._id,
                date: today,
                clockIn: now,
                isLate: isLate ? "LATE" : "PRESENT",
            });
            return res.status(200).json({
                success: true,
                type: "CHECK_IN",
                data: attendance,
                message: "Clock-in successful",
            })
        } else if(!existing.clockOut) {
            const checkInTime = new Date(existing.clockIn).getTime();
            const diffMs = now.getTime() - checkInTime;
            const diffHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours

            existing.clockOut = now;

            // Compute working hours and day type
            const workingHours = parseFloat(diffHours.toFixed(2));
            let dayType = 'Half Day';
            if(workingHours >= 8) dayType = 'Full Day';
            else if(workingHours >= 6) dayType = 'Three Quarter Day';
            else if(workingHours >= 4) dayType = 'Half Day';
            else if(workingHours >= 2) dayType = 'Quarter Day';
            else if(workingHours > 0) dayType = 'Short Day';

            existing.workingHours = workingHours;
            existing.dayType = dayType;

            await existing.save();
            return res.status(200).json({
                success: true,
                type: "CHECK_OUT",
                date: existing,
                message: "Clock-out successful",
            })
        } else {
            return res.status(400).json({
                success: true,
                type: "CHECK_OUT",
                date: existing,
            })
        }
    } catch (error) {
        console.log('Attendance error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to clock in/out",
        });
    }
}

// Get attendance for employee
// GET /api/attendance
export const getAttendance = async (req, res) => {
    try {
        const session = req.session;

        const employee = await Employee.findOne({
            userId: session.userId,
        }).lean();

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }
        
        const limit = parseInt(req.query.limit) || 30;
        const history = await Attendance.find({
            employeeId: employee._id,
        }).sort({ date: -1 }).limit(limit).lean();

        return res.status(200).json({
            success: true,
            data: history,
            employee: {
                isDeleted: employee.isDeleted,
            },
            message: "Attendance fetched successfully",
        })
    } catch (error) {
        console.log('Attendance error:', error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance",
        });
    }
}
