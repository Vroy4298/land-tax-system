import express from "express";
import { verifyToken } from "../utils/jwt.mjs";
import {
  addProperty,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} from "../controllers/propertyController.mjs";

const router = express.Router();

// Add property
router.post("/", verifyToken, addProperty);

// Get all properties for logged-in user
router.get("/", verifyToken, getMyProperties);

// Get a single property
router.get("/:id", verifyToken, getPropertyById);

// Delete a property
router.delete("/:id", verifyToken, deleteProperty);

// Update a property
router.put("/:id", verifyToken, updateProperty);


// export
export { router as handlePropertyRoutes };
