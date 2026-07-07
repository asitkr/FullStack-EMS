import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { changePassword, login, session } from "../controllers/authController.js";

const authRouter = Router();

authRouter.get("/login", login);
authRouter.get("/session", protect, session);
authRouter.post("/change-password", protect, changePassword);

export default authRouter;