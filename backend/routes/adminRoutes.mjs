import express from "express";
import { getStats } from "../controllers/adminController.mjs";
import { getAllUsers, makeAdmin } from "../controllers/userController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { adminMiddleware } from "../middleware/adminMiddleware.mjs";
import { getAllPropertiesAdmin } from "../controllers/propertyController.mjs";

const router = express.Router();

// ⚙️ Seed route — only requires login (no admin check)
// This allows the first admin to be promoted
router.post("/make-admin", authMiddleware, makeAdmin);

// All routes below require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get("/stats", getStats);
router.get("/properties", getAllPropertiesAdmin);
router.get("/users", getAllUsers);

export default router;
