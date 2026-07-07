import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";

const profileRouter = Router();

profileRouter.get("/", protect, getProfile);
profileRouter.put("/", protect, updateProfile);

export default profileRouter;