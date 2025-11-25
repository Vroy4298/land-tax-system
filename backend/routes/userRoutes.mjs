import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/userController.mjs";
import { verifyToken } from "../utils/jwt.mjs";

const router = express.Router();

// routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getProfile);

// IMPORTANT: correct named export
export const handleUserRoutes = router;
