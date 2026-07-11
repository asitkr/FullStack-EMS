import bcrypt from "bcrypt";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Get employees
//GET /api/employees
export const getEmployees = async (req, res) => {
    try {
        const { department } = req.query;
        const where = {};
        if (department) where.department = department;

        const employees = await Employee.find(where).sort({ createdAt: -1 }).populate("userId", "email role").lean();
        // const result = employees.map((emp) => {
        //     ...emp,
        //     id: emp._id.toString(),
        //     user: emp.userId ? { email: emp.userId}
        // })

        const result = employees.map((emp) => ({
            ...emp,
            id: emp._id,
            user: {
                email: emp.userId?.email,
                role: emp.userId?.role,
            },
        }));

        res.status(200).json({ success: true, employees: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
}


// Create employees
// POST /api/employees
export const createEmployees = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            position,
            basicSalary,
            allowances,
            deductions,
            joinDate,
            isDeleted,
            bio,
            department,
            password,
            role
        } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password: hashed,
            role: role || "EMPLOYEE",
        });

        // Create employee
        const employee = await Employee.create({
            userId: user._id,
            firstName,
            lastName,
            email,
            phone,
            position,
            department: department || "Engineering",
            basicSalary: Number(basicSalary) || 0,
            allowances: Number(allowances) || 0,
            deductions: Number(deductions) || 0,
            joinDate: new Date(joinDate),
            bio: bio || "",
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully.",
            employee,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }
        console.error("Create employee error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create employee",
        });
    }
}


// Update employees
// PUT /api/employees/:id
export const updateEmployees = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            position,
            basicSalary,
            allowances,
            deductions,
            isDeleted,
            bio,
            department,
            role,
            employeeStatus,
            password
        } = req.body;

        // Validation
        if (!email || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Find employee
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // Check if another user already uses this email
        // const existingUser = await User.findOne({
        //     email,
        //     _id: { $ne: employee.userId },
        // });

        // Create employee
        await Employee.findByIdAndUpdate(
            id,
            {
                firstName,
                lastName,
                email,
                phone,
                position,
                department: department || "Engineering",
                basicSalary: Number(basicSalary) || 0,
                allowances: Number(allowances) || 0,
                deductions: Number(deductions) || 0,
                employeeStatus: employeeStatus || "ACTIVE",
                bio: bio || "",
            });

        // Update user record
        const userUpdate = { email };
        if (role) userUpdate.role = role;
        if (password) userUpdate.password = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(employee.userId, userUpdate);

        res.status(200).json({
            success: true,
            message: "Employee record updated successfully."
        });
    } catch (error) {
        console.error("Update employee error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update employee",
        });
    }
}


// Delete employees
// DELETE /api/employees/:id
export const deleteEmployees = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        employee.isDeleted = true;
        employee.employeeStatus = "INACTIVE";
        await employee.save();

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully.",
        });

    } catch (error) {
        console.error("Delete employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete employee.",
        });
    }
}