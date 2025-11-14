import express from "express";
import { verifyToken } from "../utils/jwt.mjs";
import { addProperty, getMyProperties, deleteProperty } from "../controllers/propertyController.mjs";

const router = express.Router();

router.post("/", verifyToken, addProperty);
router.get("/", verifyToken, getMyProperties);
router.delete("/:id", verifyToken, deleteProperty);

export { router as handlePropertyRoutes };
