import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";


// Create payslip
// POST /api/payslips
export const createPayslip = async (req, res) => {
    try {
        const { employeeId, month, year, basicSalary, allowances, deductions } = req.body;

        if(!employeeId || !month || !year || !basicSalary) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const netSalary = Number(basicSalary) + Number(allowances || 0) - Number(deductions || 0);

        const payslip = await Payslip.create({
            employeeId,
            month: Number(month),
            year: Number(year),
            basicSalary: Number(basicSalary),
            allowances: Number(allowances || 0),
            deductions: Number(deductions || 0),
            netSalary,
        })

        return res.status(201).json({
            success: true,
            message: "Payslip created successfully",
            data: payslip,
        });
    } catch (error) {
        console.log("Error in creating payslip:", error);

        return res.status(500).json({
            success: false,
            message: "Error creating payslip",
        });
    }
}


// Get payslips
// GET /api/payslips
export const getPayslips = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session.role === "ADMIN";

        if(isAdmin) {
            const payslips = await Payslip.find().populate("employeeId").sort({ createdAt: -1 });
            const data = payslips.map(p => {
                const obj = p.toObject();
                return {
                    ...obj,
                    id: obj._id.toString(),
                    employeeId: obj.employeeId._id.toString(),
                }
            })

            return res.status(200).json({
                success: true,
                message: "Payslips fetched successfully",
                data,
            });
        } else {
            const employee = await Employee.findOne({ userId: session.userId });
            if(!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found",
                });
            }

            const payslips = await Payslip.find({
                employeeId: employee._id,
            }).sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: "Payslips fetched successfully",
                data: payslips,
            });
        }
    } catch (error) {
        console.log("Error in fetching payslips:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching payslips",
        });
    }
}


// Get payslip by ID
// GET /api/payslips/:id
export const getPayslipById = async (req, res) => {
    try {
        const { id } = req.params;
        const payslip = await Payslip.findById(id).populate("employeeId").lean();

        if(!payslip) {
            return res.status(404).json({
                success: false,
                message: "Payslip not found",
            });
        }

        const result = {
            ...payslip,
            id: payslip._id.toString(),
            employee: payslip.employeeId,
        }

        return res.status(200).json({
            success: true,
            message: "Payslip fetched successfully",
            data: result,
        });
    } catch (error) {
        console.log("Error in fetching payslip by ID:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching payslip by ID",
        });
    }
}