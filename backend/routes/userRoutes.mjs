import express from "express";
import { handleRegisterUser, handleLoginUser, handleProfileUser } from "../controllers/userController.mjs";
import { verifyToken } from "../utils/jwt.mjs";

const router = express.Router();

router.post("/register", handleRegisterUser);
router.post("/login", handleLoginUser);
router.get("/profile", verifyToken, handleProfileUser);

export { router as handleUserRoutes };
