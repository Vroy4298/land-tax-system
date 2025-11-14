import { getPropertyCollection } from "../models/Property.mjs";
import { ObjectId } from "mongodb";


// Add Property
export const addProperty = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken
    const body = req.body;

    const newProperty = {
      ...body,
      owner: userId,
      createdAt: new Date(),
    };

    const collection = getPropertyCollection();
    await collection.insertOne(newProperty);

    res.status(201).json({ message: "Property added successfully" });
  } catch (err) {
    console.error("Add property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get logged-in user properties
export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;

    const collection = getPropertyCollection();
    const properties = await collection.find({ owner: userId }).toArray();

    res.status(200).json(properties);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
export const deleteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const collection = getPropertyCollection();

    // Validate ObjectId
    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(propertyId),
      owner: userId   // 👈 owner MATCHES string inside DB
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Property not found or unauthorized" });
    }

    res.json({ message: "Property deleted successfully" });

  } catch (err) {
    console.error("❌ Delete property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};