import { connectDB } from "../db.mjs";
import { ObjectId } from "mongodb";

let propertyCollection = null;

// ALWAYS return a real MongoDB collection
export async function getPropertyCollection() {
  if (!propertyCollection) {
    const db = await connectDB();       // MUST await
    propertyCollection = db.collection("properties"); // MUST be collection()
  }
  return propertyCollection;
}

// Build document for add/update
export const buildPropertyDocument = (data, userId) => {
  const {
    ownerName,
    ownerPhone,
    ownerEmail,
    address,
    propertyType,
    usageType,
    zone,
    builtUpArea,
    constructionYear,
  } = data;

  // Base Rates
  const baseRates = {
    residential: 2.5,
    commercial: 5,
    industrial: 3.5,
    agriculture: 1.5,
  };

  // Multipliers
  const zoneMultiplier = { A: 1.3, B: 1.1, C: 1.0 };
  const usageMultiplier = { self: 1.0, rented: 1.2, mixed: 1.1 };

  // Age factor
  const currentYear = new Date().getFullYear();
  const age = currentYear - Number(constructionYear);
  let ageFactor = 1.0;
  if (age >= 11 && age <= 20) ageFactor = 0.9;
  else if (age >= 21 && age <= 30) ageFactor = 0.8;
  else if (age > 30) ageFactor = 0.7;

  const finalTaxAmount =
    Number(builtUpArea) *
    baseRates[propertyType] *
    zoneMultiplier[zone] *
    usageMultiplier[usageType] *
    ageFactor;

  return {
    ownerName,
    ownerPhone,
    ownerEmail,
    address,
    propertyType,
    usageType,
    zone,
    builtUpArea,
    constructionYear,

    baseRate: baseRates[propertyType],
    zoneMultiplier: zoneMultiplier[zone],
    usageMultiplier: usageMultiplier[usageType],
    ageFactor,
    finalTaxAmount: Math.round(finalTaxAmount),

    paymentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: new ObjectId(userId),
  };
};
