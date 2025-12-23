import { connectDB } from "../db.mjs";
import { ObjectId } from "mongodb";

let propertyCollection = null;

// Return MongoDB "properties" collection
export async function getPropertyCollection() {
  if (!propertyCollection) {
    const db = await connectDB();
    propertyCollection = db.collection("properties");
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

  /* ---------------- NORMALIZATION ---------------- */
  const cleanType =
  propertyType === "Residential" ? "residential" :
  propertyType === "Commercial" ? "commercial" :
  propertyType === "Industrial" ? "industrial" :
  "residential";
  
  const cleanUsage =
  usageType === "Self-Occupied" ? "self" :
  usageType === "Rented" ? "rented" :
  "self";

   
  const cleanZone = String(zone).toUpperCase();           

  /* ---------------- BASE RATES ---------------- */
  const baseRates = {
    residential: 2.5,
    commercial: 5,
    industrial: 3.5,
    agriculture: 1.5,
  };

  /* ---------------- MULTIPLIERS ---------------- */
  const zoneMultiplier = { A: 1.3, B: 1.1, C: 1.0 };

const usageMultiplier = {
  self: 1.0,
  rented: 1.2,
};


  /* ---------------- AGE FACTOR ---------------- */
  const currentYear = new Date().getFullYear();
  const area = Number(builtUpArea) || 0;
  const year = Number(constructionYear);

  const age =
  !year || isNaN(year)
    ? 0
    : currentYear - year;


  let ageFactor = 1.0;
  if (age >= 11 && age <= 20) ageFactor = 0.9;
  else if (age >= 21 && age <= 30) ageFactor = 0.8;
  else if (age > 30) ageFactor = 0.7;

  /* ---------------- FINAL TAX ---------------- */
  const finalTaxAmount =
  area *
  (baseRates[cleanType] || 1) *
  (zoneMultiplier[cleanZone] || 1) *
  (usageMultiplier[cleanUsage] || 1) *
  ageFactor;

  return {
    ownerName,
    ownerPhone,
    ownerEmail,
    address,

    propertyType: cleanType,
    usageType: cleanUsage,
    zone: cleanZone,

    builtUpArea,
    constructionYear,

    baseRate: baseRates[cleanType] || null,
    zoneMultiplier: zoneMultiplier[cleanZone] || null,
    usageMultiplier: usageMultiplier[cleanUsage] || null,
    ageFactor,
    finalTaxAmount: Math.round(finalTaxAmount),

    paymentStatus: "pending",
    paymentDate: null,
    receiptId: null,

    createdAt: new Date(),
    updatedAt: new Date(),

    owner: new ObjectId(userId),
  };
};
