import { connectDB } from "../db.mjs";
import { ObjectId } from "mongodb";

export const handlePayTax = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.propertyId;

    const db = await connectDB();
    const properties = db.collection("properties");

    // Find property owned by logged-in user
    const property = await properties.findOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId),
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // ⭐ Generate proper receipt ID
    const receiptId = "REC-" + Date.now();

    // ⭐ Store correct payment timestamp
    const now = new Date();

    // ⭐ Save payment info
    await properties.updateOne(
      { _id: new ObjectId(propertyId) },
      {
        $set: {
          paymentStatus: "paid",
          paymentDate: now,
          receiptId: receiptId,
        },
      }
    );

    // ⭐ Return updated payment info to frontend
    return res.json({
      message: "Payment successful",
      propertyId,
      receiptId,
      paidOn: now,
      amount: property.finalTaxAmount,
    });

  } catch (err) {
    console.error("Payment Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
