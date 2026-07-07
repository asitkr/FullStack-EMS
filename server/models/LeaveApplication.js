import mongoose from "mongoose";

const leaveApplicationSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    type: {
        type: String,
        enum: ["SICK", "CASUAL", "ANNUAL", "MATERNITY", "PATERNITY", "BEREAVEMENT", "UNPAID", "EARNED", "EMERGENCY"],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
        default: null,
    },
    endDate: {
        type: Date,
        required: true,
        default: null,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
}, { timestamps: true });

const LeaveApplication = mongoose.models.LeaveApplication || mongoose.model("LeaveApplication", leaveApplicationSchema);
export default LeaveApplication;