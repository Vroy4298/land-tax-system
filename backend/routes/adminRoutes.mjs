import express from "express";
import { getStats } from "../controllers/adminController.mjs";
import { getAllUsers, makeAdmin } from "../controllers/userController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { adminMiddleware } from "../middleware/adminMiddleware.mjs";
import { getAllPropertiesAdmin } from "../controllers/propertyController.mjs";

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get("/stats", getStats);
router.get("/properties", getAllPropertiesAdmin);
router.get("/users", getAllUsers);
router.post("/make-admin", makeAdmin);

export default router;
