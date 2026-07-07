import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "fullstack-ems-ashit" });

// Your new function:
const autoCheckOut = inngest.createFunction(
    { id: "auto-check-out", triggers: [{ event: "employee/check-out" }] },
    async ({ event, step }) => {
        const { employeeId, attendanceId } = event.data;

        // Wait for 9 hours
        await step.sleepUntil("Wait-for-the-9-hours", new Date(new Date().getTime() + 9 * 60 * 60 * 1000))

        // get Attendance data
        let attendance = await Attendance.findById(attendanceId);

        if (!attendance?.checkOut) {
            const employee = await Employee.findById(employeeId);

            // Send reminder email

            // After 10 hours, mark attendance as checked out with status "LATE"
            await step.sleepUntil("Wait-for-the-1-hours", new Date(new Date().getTime() + 1 * 60 * 60 * 1000))

            attendance = await Attendance.findById(attendanceId)
            if (!attendance.checkOut) {
                attendance.checkOut = new Date(attendance.checkIn).getTime() + 4 * 60 * 60 * 1000;
                attendance.workingHours = 4;
                attendance.dayType = "Half Day";
                attendance.status = "LATE";
                await attendance.save();
            }
        }
    },
);


// Send Email to admin, If admin doesn't take action on leave application within 24 hours i
const leaveApplicationReminder = inngest.createFunction(
    { id: "leave-application-reminder", triggers: [{ event: "leave/pending" }] },
    async ({ event, step }) => {
        const { leaveApplicationId } = event.data;

        // Wait for 24 hours
        await step.sleepUntil("Wait-for-the-24-hours", new Date(new Date().getTime() + 24 * 60 * 60 * 1000))

        const leaveApplication = await LeaveApplication.findById(leaveApplicationId);
        if(leaveApplication?.status === "PENDING") {
            const employee = await Employee.findById(leaveApplication.employeeId);

            // Send reminder email to admin to take action on leave application
        }
    },
)

// Cron: Check attendance at 11:30 AM IST (06:00 UTC) and email absent employees
const attendanceReminder = inngest.createFunction(
    { id: "attendance-reminder-corn", triggers: [{ corn: "0 0 6 * * *" }] },
    // 06:00 UST = 11:30AM IST
    async ({ step }) => {
        // Step 1: Get today's date range (IST)
        const today = await step.run("get-today-date", () => {
            const startUTC = new Date(new Date().toLocaleDateString("en-CA", {  timeZone: "Asia/Kolkata" }) + "T00:00:00+05:30")
            const endUTC = new Date(startUTC.getTime() +24 * 60 * 60 * 1000)

            return { 
                startUTC: startUTC.toISOString(),
                endUTC: endUTC.toDateString()
            }
        })

        // Step 2: Get all active, non-deleted employees
        const activeEmployees = await step.run("get-active-employees", async () => {
            const employees = await Employee.find({
                isDeleted: false,
                employmentStatus: "ACTIVE",
            }).lean();

            return employees.map((e) => ({
                _id: e._id.toString(),
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                department: e.department,
            }))
        })

        // Step 3: Get employee IDs on approved leave today
        const onLeaveIds = await step.run("get-on-leave-ids", async () => {
            const leaves = await LeaveApplication.find({
                status: "APPROVED",
                startDate: { $lte: new Date(today.endUTC) },
                endDate: { $gte: new Date(today.startUTC) },
            }).lean();

            return leaves.map((l) => l.employeeId.toString())
        })

        // Step 4: Get employee IDs who already checked in today
        const checkedInIds = await step.run("get-checked-in-ids", async () => {
            const attendance = await Attendance.find({
                date: { 
                    $gte: new Date(today.startUTC),
                    $lt: new Date(today.endUTC),
                }
            }).lean();

            return leaves.map((a) => a.employeeId.toString())
        })

        // Step 5: Filter absent employees (not on leave & not checked in)
        const absentEmployees = activeEmployees.filter((emp) => !onLeaveIds.includes(emp._id) && !checkedInIds.includes(emp._ids))

        // Step 6: Send reminder emails
        if(absentEmployees.length > 0) {
            await step.run("send-reminder-emails", async () => {
                const emailPromises = absentEmployees.map((emp) => {
                    // send email
                })
            })
        }

        return {
            totalActive: activeEmployees.length,
            onLeave: onLeaveIds.length,
            checkedIn: checkedInIds.length,
            absent: absentEmployees.length, 
        }
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
    autoCheckOut,
    leaveApplicationReminder,
    attendanceReminder
];