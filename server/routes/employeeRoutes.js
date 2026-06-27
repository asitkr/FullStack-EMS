import { Router } from "express";
import { createEmployees, deleteEmployees, getEmployees, updateEmployees } from "../controllers/employeeController.js";

const employeesRouter = Router();

employeesRouter.get("/", getEmployees);
employeesRouter.Post("/", createEmployees);
employeesRouter.put("/:id", updateEmployees);
employeesRouter.delete("/:id", deleteEmployees);

export default employeesRouter;