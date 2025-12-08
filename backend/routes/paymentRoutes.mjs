import express from "express";
import { handlePayTax } from "../controllers/paymentController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// ⭐ FINAL ROUTE: /api/pay-tax/pay/:propertyId
router.post("/pay/:propertyId", authMiddleware, handlePayTax);

export default router;
