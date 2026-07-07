import { Router } from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import { createEmployees, deleteEmployees, getEmployees, updateEmployees } from "../controllers/employeeController.js";

const employeesRouter = Router();

employeesRouter.get("/", protect, protectAdmin, getEmployees);
employeesRouter.Post("/", protect, protectAdmin, createEmployees);
employeesRouter.put("/:id", protect, protectAdmin, updateEmployees);
employeesRouter.delete("/:id", protect, protectAdmin, deleteEmployees);

export default employeesRouter;