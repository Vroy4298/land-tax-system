import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/userController.mjs";

import { verifyToken } from "../utils/jwt.mjs";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, getProfile);

export { router as handleUserRoutes };
