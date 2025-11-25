import { getPropertyCollection, buildPropertyDocument } from "../models/Property.mjs";
import { ObjectId } from "mongodb";

// ADD PROPERTY


export const addProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;
    console.log("🟡 Received Body:", body);

    const propertyDoc = buildPropertyDocument(body, userId);

    const collection = await getPropertyCollection();
    await collection.insertOne(propertyDoc);

    res.status(201).json({
      message: "Property added successfully",
      tax: propertyDoc.finalTaxAmount,
    });
  } catch (err) {
    console.error("Add property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET ALL PROPERTIES FOR LOGGED-IN USER
export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;

    const collection = await getPropertyCollection();

    const properties = await collection
      .find({ owner: new ObjectId(userId) })
      .toArray();

    res.status(200).json(properties);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET PROPERTY BY ID (for Edit / Details)
export const getPropertyById = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const collection = await getPropertyCollection();

    const property = await collection.findOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId), // ensures security
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found or unauthorized" });
    }

    res.status(200).json(property);
  } catch (err) {
    console.error("Get property by ID error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE PROPERTY
export const deleteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const collection = getPropertyCollection();

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: "Property not found or unauthorized",
      });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// UPDATE PROPERTY
export const updateProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;
    const body = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const collection = await getPropertyCollection();

    // Does property exist?
    const existing = await collection.findOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId),
    });

    if (!existing) {
      return res.status(404).json({ error: "Property not found or unauthorized" });
    }

    // Rebuild tax (RECALCULATE USING SAME ENGINE)
    const updatedDoc = buildPropertyDocument(body, userId);
    updatedDoc.updatedAt = new Date();

    // Do NOT replace owner or _id
    delete updatedDoc.owner;

    await collection.updateOne(
      { _id: new ObjectId(propertyId) },
      { $set: updatedDoc }
    );

    res.json({
      message: "Property updated successfully",
      tax: updatedDoc.finalTaxAmount,
    });
  } catch (err) {
    console.error("Update property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
