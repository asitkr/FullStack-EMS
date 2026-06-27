import { Router } from "express";
import { getEmployees } from "../controllers/employeeController.js";

const employeesRouter = Router();

employeesRouter.get("/", getEmployees)