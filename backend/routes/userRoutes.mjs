import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,   
  resetPassword,
} from "../controllers/userController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


router.get("/profile", authMiddleware, getProfile);

export default router;
