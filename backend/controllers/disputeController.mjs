import { connectDB } from "../db.mjs";
import { ObjectId } from "mongodb";

async function getDisputeCollection() {
    const db = await connectDB();
    return db.collection("disputes");
}

/* ---------------------- RAISE DISPUTE (CITIZEN) ---------------------- */
export const raiseDispute = async (req, res) => {
    try {
        const userId = req.user.id;
        const { propertyId, reason, description } = req.body;
        if (!propertyId || !reason) {
            return res.status(400).json({ error: "propertyId and reason are required" });
        }
        const col = await getDisputeCollection();
        const dispute = {
            propertyId: new ObjectId(propertyId),
            raisedBy: new ObjectId(userId),
            reason,
            description: description || "",
            status: "pending",   // pending | resolved | rejected
            adminNote: "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await col.insertOne(dispute);
        res.status(201).json({ message: "Dispute raised", id: result.insertedId });
    } catch (err) {
        console.error("Raise dispute error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/* ---------------------- GET MY DISPUTES (CITIZEN) ---------------------- */
export const getMyDisputes = async (req, res) => {
    try {
        const userId = req.user.id;
        const col = await getDisputeCollection();
        const disputes = await col
            .find({ raisedBy: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(disputes);
    } catch (err) {
        console.error("Get my disputes error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/* ---------------------- GET ALL DISPUTES (ADMIN) ---------------------- */
export const getAllDisputes = async (req, res) => {
    try {
        const col = await getDisputeCollection();
        const disputes = await col.find({}).sort({ createdAt: -1 }).toArray();
        res.json(disputes);
    } catch (err) {
        console.error("Get all disputes error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/* ---------------------- RESOLVE DISPUTE (ADMIN) ---------------------- */
export const resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;  // status: "resolved" | "rejected"
        if (!["resolved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "status must be 'resolved' or 'rejected'" });
        }
        const col = await getDisputeCollection();
        const result = await col.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, adminNote: adminNote || "", updatedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: "Dispute not found" });
        res.json({ message: `Dispute ${status}` });
    } catch (err) {
        console.error("Resolve dispute error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
