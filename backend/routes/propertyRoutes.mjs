import express from "express";
import {
  addProperty,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  markAsPaid,
  downloadReceipt,
  payInstallment
} from "../controllers/propertyController.mjs";
import { upload, uploadDocument, getDocuments } from "../controllers/documentController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// Protect all property routes
router.use(authMiddleware);

// Add property
router.post("/", addProperty);

// Get all properties for logged-in user
router.get("/", getMyProperties);

// Get property by ID
router.get("/:id", getPropertyById);

// Update property
router.put("/:id", updateProperty);

// Delete property
router.delete("/:id", deleteProperty);

// Mark as paid
router.post("/:id/mark-paid", markAsPaid);

// Download receipt
router.get("/:id/receipt", downloadReceipt);

// Documents
router.post("/:id/documents", upload.single("file"), uploadDocument);
router.get("/:id/documents", getDocuments);

// Installment payment
router.post("/:id/installment", payInstallment);

// 🚀 MOST IMPORTANT LINE
export default router;
