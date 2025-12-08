import express from "express";
import { connectDB } from "../db.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET /api/payments  → Get all completed payments for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await connectDB();
    const properties = db.collection("properties");

    const paidList = await properties
      .find({
        owner: new ObjectId(userId),
        paymentStatus: "paid",
      })
      .sort({ paymentDate: -1 })
      .toArray();

    return res.json(paidList);
  } catch (err) {
    console.error("Payment history error:", err);
    return res.status(500).json({ error: "Failed to load payment history" });
  }
});

export default router;
