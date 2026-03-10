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

export const buildPropertyDocument = (data = {}, userId) => {
  const {
    ownerName = "",
    ownerPhone = "",
    ownerEmail = "",
    address = "",
    district = "",
    ward = "",
    city = "",
    pincode = "",
    propertyType = "",
    usageType = "",
    zone = "",
    builtUpArea = 0,
    constructionYear = "",
    structureType = "",
    floorType = "",
  } = data;

  /* ---------------- NORMALIZATION ---------------- */
  const cleanType =
    propertyType === "Residential" ? "residential" :
      propertyType === "Commercial" ? "commercial" :
        propertyType === "Industrial" ? "industrial" :
          propertyType === "Agricultural" ? "agricultural" :
            "residential";

  const cleanUsage =
    usageType === "Self-Occupied" ? "self-occupied" :
      usageType === "Rented" ? "rented" :
        "self-occupied";

  const cleanZone = String(zone).toUpperCase();
  const cleanStructure = String(structureType).toLowerCase();
  const cleanFloor = String(floorType).toLowerCase();

  /* ---------------- UAV RATES ---------------- */
  const uavRates = { A: 630, B: 500, C: 400, D: 270 };
  const uav = uavRates[cleanZone] || 400; // default C

  /* ---------------- USAGE FACTOR ---------------- */
  let usageFactor = 1.0;
  if (cleanType === "residential" && cleanUsage === "rented") usageFactor = 2.0;
  else if (cleanType === "commercial") usageFactor = 4.0;
  else if (cleanType === "industrial") usageFactor = 3.0;
  else if (cleanType === "agricultural") usageFactor = 0.5;

  /* ---------------- AGE FACTOR ---------------- */
  const currentYear = new Date().getFullYear();
  const area = Number(builtUpArea) || 0;
  const year = Number(constructionYear);

  const age = !year || isNaN(year) ? 0 : currentYear - year;

  let ageFactor = 1.0;
  if (age >= 5 && age < 10) ageFactor = 0.95;
  else if (age >= 10 && age < 20) ageFactor = 0.9;
  else if (age >= 20 && age < 30) ageFactor = 0.8;
  else if (age >= 30 && age <= 40) ageFactor = 0.7;
  else if (age > 40) ageFactor = 0.625;

  /* ---------------- STRUCTURE FACTOR ---------------- */
  let structureFactor = 1.0; // Pucca
  if (cleanStructure === "semi-pucca") structureFactor = 0.8;
  else if (cleanStructure === "kaccha") structureFactor = 0.5;

  /* ---------------- FLOOR FACTOR ---------------- */
  let floorFactor = 1.0; // Ground
  if (cleanFloor === "1st") floorFactor = 0.9;
  else if (cleanFloor === "2nd+") floorFactor = 0.8;

  /* ---------------- TAX RATE % ---------------- */
  let taxRatePercent = 0.12; // 12% residential
  if (cleanType === "commercial") taxRatePercent = 0.20;
  else if (cleanType === "industrial") taxRatePercent = 0.15;
  else if (cleanType === "agricultural") taxRatePercent = 0.08;

  /* ---------------- FINAL TAX ---------------- */
  // Annual Tax = Built-up Area × UAV × Age Factor × Usage Factor × Structure Factor × Floor Factor × Tax Rate %
  const finalTaxAmount = area * uav * ageFactor * usageFactor * structureFactor * floorFactor * taxRatePercent;

  return {
    ownerName,
    ownerPhone,
    ownerEmail,
    address,
    district,
    ward,
    city,
    pincode,

    propertyType: cleanType,
    usageType: cleanUsage,
    zone: cleanZone,
    structureType: cleanStructure,
    floorType: cleanFloor,
    builtUpArea: area,
    constructionYear,

    uav,
    usageFactor,
    ageFactor,
    structureFactor,
    floorFactor,
    taxRatePercent,
    finalTaxAmount: Math.round(finalTaxAmount),

    paymentStatus: "pending",
    paymentDate: null,
    receiptId: null,

    createdAt: new Date(),
    updatedAt: new Date(),

    owner: new ObjectId(userId),
  };
};
