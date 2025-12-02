import { getPropertyCollection, buildPropertyDocument } from "../models/Property.mjs";
import { ObjectId } from "mongodb";

/* ---------------------------------------------------------
   ADD PROPERTY
--------------------------------------------------------- */
export const addProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;
    console.log("🟡 Received Body:", body);

    const propertyDoc = buildPropertyDocument(body, userId);

    // Ensure tax fields are stored
    propertyDoc.baseRate = propertyDoc.baseRate;
    propertyDoc.zoneMultiplier = propertyDoc.zoneMultiplier;
    propertyDoc.usageMultiplier = propertyDoc.usageMultiplier;
    propertyDoc.ageFactor = propertyDoc.ageFactor;

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

/* ---------------------------------------------------------
   GET ALL FILTERED PROPERTIES
--------------------------------------------------------- */
export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      search = "",
      zone = "",
      usage = "",
      type = "",
      minArea = "",
      maxArea = "",
      minTax = "",
      maxTax = "",
    } = req.query;

    const collection = await getPropertyCollection();

    const query = { owner: new ObjectId(userId) };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { ownerName: regex },
        { ownerPhone: regex },
        { address: regex },
        { zone: regex },
      ];
    }

    if (zone && zone !== "all") query.zone = { $regex: zone, $options: "i" };
    if (usage && usage !== "all") query.usageType = { $regex: usage, $options: "i" };
    if (type && type !== "all") query.propertyType = { $regex: type, $options: "i" };

    if (minArea) query.builtUpArea = { ...query.builtUpArea, $gte: Number(minArea) };
    if (maxArea) query.builtUpArea = { ...query.builtUpArea, $lte: Number(maxArea) };

    if (minTax) query.finalTaxAmount = { ...query.finalTaxAmount, $gte: Number(minTax) };
    if (maxTax) query.finalTaxAmount = { ...query.finalTaxAmount, $lte: Number(maxTax) };

    const properties = await collection.find(query).sort({ createdAt: -1 }).toArray();

    res.status(200).json(properties);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------------------------------------------
   TAX ENGINE FOR EDIT / DETAILS
--------------------------------------------------------- */
function computeTax(p) {
  const baseRates = {
    residential: 2.5,
    commercial: 5,
    industrial: 3.5,
    agriculture: 1.5,
  };

  const zoneMultiplier = { A: 1.3, B: 1.1, C: 1.0, D: 0.8 };
  const usageMultiplier = { self: 1.0, rented: 1.2, mixed: 1.1, commercial: 1.25 };

  const baseRate = baseRates[p.propertyType?.toLowerCase()] ?? 0;
  const zMult = zoneMultiplier[p.zone] ?? 1;
  const uMult = usageMultiplier[p.usageType] ?? 1;

  const currentYear = new Date().getFullYear();
  const age = currentYear - Number(p.constructionYear || currentYear);
  let ageFactor = 1;
  if (age >= 11 && age <= 20) ageFactor = 0.9;
  else if (age >= 21 && age <= 30) ageFactor = 0.8;
  else if (age > 30) ageFactor = 0.7;

  const area = Number(p.builtUpArea) || 0;
  const finalTaxAmount = Math.round(area * baseRate * zMult * uMult * ageFactor);

  return { baseRate, zMult, uMult, ageFactor, finalTaxAmount };
}

/* ---------------------------------------------------------
   GET PROPERTY BY ID
--------------------------------------------------------- */
export const getPropertyById = async (req, res) => {
  try {
    const collection = await getPropertyCollection();
    const property = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!property)
      return res.status(404).json({ error: "Property not found" });

    // Recompute tax if missing or inconsistent
    const tax = computeTax(property);

    if (!property.baseRate) property.baseRate = tax.baseRate;
    if (!property.zoneMultiplier) property.zoneMultiplier = tax.zMult;
    if (!property.usageMultiplier) property.usageMultiplier = tax.uMult;
    if (!property.ageFactor) property.ageFactor = tax.ageFactor;
    if (!property.finalTaxAmount) property.finalTaxAmount = tax.finalTaxAmount;

    res.json(property);
  } catch (err) {
    console.error("Get property error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ---------------------------------------------------------
   UPDATE PROPERTY
--------------------------------------------------------- */
export const updateProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;
    const body = req.body;

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const collection = await getPropertyCollection();

    const existing = await collection.findOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId),
    });

    if (!existing) {
      return res.status(404).json({ error: "Property not found or unauthorized" });
    }

    const updatedDoc = buildPropertyDocument(body, userId);
    updatedDoc.updatedAt = new Date();

    // Do not override owner field
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

/* ---------------------------------------------------------
   DELETE PROPERTY
--------------------------------------------------------- */
export const deleteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const collection = await getPropertyCollection();

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
