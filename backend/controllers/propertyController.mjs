import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { ObjectId } from "mongodb";
import { getPropertyCollection, buildPropertyDocument } from "../models/Property.mjs";




/* ---------------------- ADD PROPERTY ---------------------- */
export const addProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;
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

/* ---------------------- GET ALL PROPERTIES ---------------------- */
export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const {
      search = "",
      zone = "",
      usage = "",
      type = "",
      minArea = "",
      maxArea = "",
      minTax = "",
      maxTax = "",
    } = filters;

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

    if (zone !== "all" && zone !== "") query.zone = { $regex: zone, $options: "i" };
    if (usage !== "all" && usage !== "") query.usageType = { $regex: usage, $options: "i" };
    if (type !== "all" && type !== "") query.propertyType = { $regex: type, $options: "i" };

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

/* ---------------------- GET PROPERTY BY ID ---------------------- */
export const getPropertyById = async (req, res) => {
  try {
    const collection = await getPropertyCollection();

    const property = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    console.error("Get property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- UPDATE PROPERTY ---------------------- */
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
    console.log("USER FROM TOKEN:", req.user);

  }
};

/* ---------------------- DELETE PROPERTY ---------------------- */
export const deleteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    if (!ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const collection = await getPropertyCollection();
    const result = await collection.deleteOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Property not found or unauthorized" });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- MARK AS PAID ---------------------- */
export const markAsPaid = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const collection = await getPropertyCollection();

    const exists = await collection.findOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId),
    });

    if (!exists) {
      return res.status(404).json({ error: "Property not found or unauthorized" });
    }

    await collection.updateOne(
      { _id: new ObjectId(propertyId) },
      {
        $set: {
          paymentStatus: "paid",
          paymentDate: new Date(),
        },
      }
    );

    res.json({ message: "Marked as paid" });
  } catch (err) {
    console.error("Payment update error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- PDF RECEIPT DOWNLOAD ---------------------- */
export const downloadReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const collection = await getPropertyCollection();

    const p = await collection.findOne({
      _id: new ObjectId(propertyId),
      owner: new ObjectId(userId),
    });

    if (!p) return res.status(404).json({ error: "Property not found" });

    /* ---------------- SETUP DOCUMENT ---------------- */
    // Standard A4 size: 595.28 x 841.89 points
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const centerX = pageWidth / 2;
    const margin = 50;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${propertyId}.pdf`
    );

    doc.pipe(res);

    /* ---------------- WATERMARK ---------------- */
    // Rotated, centered, faint watermark
    doc.save();
    doc.font("Helvetica-Bold")
       .fontSize(60)
       .fillColor("#e6e6e6")
       .opacity(0.10); // Subtle but visible

    doc.rotate(45, { origin: [centerX, pageHeight / 2] });
    doc.text("OFFICIAL RECEIPT", centerX - 300, pageHeight / 2, {
      width: 600,
      align: "center",
      lineBreak: false,
    });
    doc.restore();

    /* ---------------- HEADER SECTION ---------------- */
    let currentY = 50;

    // 1. Logo (Centered)
    const logoPath = path.resolve("assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, centerX - 30, currentY, { width: 60 });
      currentY += 70;
    } else {
      currentY += 20; // Fallback if no logo
    }

    // 2. Title & Subtitle
    doc.fontSize(18)
       .font("Helvetica-Bold")
       .fillColor("#1a237e") // Official Blue
       .text("LAND TAX PAYMENT RECEIPT", 0, currentY, { align: "center" });
    
    currentY += 25;

    doc.fontSize(10)
       .font("Helvetica")
       .fillColor("#6b7280") // Slate Gray
       .text("Government Authorized Digital Record", 0, currentY, { align: "center" });

    currentY += 20;

    // 3. Divider Line
    doc.moveTo(margin, currentY)
       .lineTo(pageWidth - margin, currentY)
       .strokeColor("#e5e7eb")
       .lineWidth(1)
       .stroke();
    
    currentY += 20;

    /* ---------------- META INFO ROW ---------------- */
    // Two columns: Receipt ID (Left) | Date (Right)
    const metaY = currentY;
    
    // Left
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("Receipt ID:", margin, metaY);
    doc.font("Helvetica").fontSize(10).fillColor("#000000").text(p.receiptId || "N/A", margin + 70, metaY);

    // Right (Right aligned relative to right margin)
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("Date:", 350, metaY);
    doc.font("Helvetica").fontSize(10).text(new Date(p.paymentDate).toLocaleDateString(), 390, metaY);

    currentY += 40;

    /* ---------------- PROPERTY DETAILS ---------------- */
    // Section Header Box
    doc.rect(margin, currentY, pageWidth - (margin * 2), 25).fill("#f3f4f6");
    doc.fillColor("#1a237e").font("Helvetica-Bold").fontSize(11).text("PROPERTY DETAILS", margin + 10, currentY + 7);
    
    currentY += 35;

    // Helper for rows
    const drawRow = (label, value, y) => {
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text(label, margin, y);
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text(value || "N/A", margin + 140, y);
    };

    drawRow("Owner Name", p.ownerName, currentY); 
    currentY += 20;

    // Address (Handle wrap)
    doc.font("Helvetica").fillColor("#6b7280").text("Address", margin, currentY);
    doc.font("Helvetica-Bold").fillColor("#111827").text(p.address, margin + 140, currentY, { width: 300 });
    const addrHeight = doc.heightOfString(p.address, { width: 300 });
    currentY += Math.max(20, addrHeight + 10);

    // Grid Layout for Specs
    const col1X = margin;
    const col1ValX = margin + 80;
    const col2X = 320;
    const col2ValX = 400;

    // Row 1
    doc.font("Helvetica").fillColor("#6b7280").text("Type", col1X, currentY);
    doc.font("Helvetica-Bold").fillColor("#111827").text(p.propertyType, col1ValX, currentY);
    
    doc.font("Helvetica").fillColor("#6b7280").text("Zone", col2X, currentY);
    doc.font("Helvetica-Bold").fillColor("#111827").text(p.zone, col2ValX, currentY);
    currentY += 20;

    // Row 2
    doc.font("Helvetica").fillColor("#6b7280").text("Usage", col1X, currentY);
    doc.font("Helvetica-Bold").fillColor("#111827").text(p.usageType, col1ValX, currentY);

    doc.font("Helvetica").fillColor("#6b7280").text("Area", col2X, currentY);
    doc.font("Helvetica-Bold").fillColor("#111827").text(`${p.builtUpArea} sq ft`, col2ValX, currentY);
    
    currentY += 40;

    /* ---------------- TAX CALCULATION ---------------- */
    // Section Header Box
    doc.rect(margin, currentY, pageWidth - (margin * 2), 25).fill("#f3f4f6");
    doc.fillColor("#1a237e").font("Helvetica-Bold").fontSize(11).text("TAX BREAKDOWN", margin + 10, currentY + 7);
    currentY += 35;

    // Right-aligned amounts for financial look
    const drawCalcRow = (label, value) => {
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text(label, margin, currentY);
      doc.font("Helvetica").fontSize(10).fillColor("#111827").text(value, 450, currentY, { width: 95, align: "right" });
      currentY += 18;
    };

    drawCalcRow("Base Rate", `₹ ${p.baseRate}`);
    drawCalcRow("Zone Multiplier", `x ${p.zoneMultiplier}`);
    drawCalcRow("Usage Multiplier", `x ${p.usageMultiplier}`);
    drawCalcRow("Age Factor", `x ${p.ageFactor}`);
    
    currentY += 10;

    // Divider Line
    doc.moveTo(350, currentY).lineTo(pageWidth - margin, currentY).strokeColor("#000000").lineWidth(0.5).stroke();
    currentY += 10;

    // Final Total Box
    doc.rect(340, currentY - 5, 205, 30).fill("#e0e7ff"); // Blue highlight
    doc.fillColor("#1a237e").font("Helvetica-Bold").fontSize(12).text("TOTAL PAID", 355, currentY + 4);
    doc.fillColor("#1a237e").fontSize(14).text(`₹ ${p.finalTaxAmount}`, 450, currentY + 2, { width: 85, align: "right" });

    currentY += 60;

    /* ---------------- QR CODE ---------------- */
    // Prevent QR from falling off page
    if (currentY > pageHeight - 150) {
      doc.addPage();
      currentY = 50;
    }

    const qrData = `Receipt: ${p.receiptId} | Amount: ₹${p.finalTaxAmount} | Date: ${new Date(p.paymentDate).toISOString()}`;
    const qrImage = await QRCode.toDataURL(qrData);

    const qrSize = 100;
    const qrX = (pageWidth - qrSize) / 2;

    doc.image(qrImage, qrX, currentY, { width: qrSize });
    currentY += qrSize + 10;

    doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text("Scan to verify details", 0, currentY, { align: "center" });

    /* ---------------- FOOTER ---------------- */
    const footerY = pageHeight - 60;
    doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).strokeColor("#e5e7eb").lineWidth(1).stroke();
    
    doc.fontSize(8).fillColor("#9ca3af")
       .text("This receipt is computer generated and valid without a physical signature.", 0, footerY + 10, { align: "center" });
    doc.text("© 2025 Land Tax System | Secure Digital Records", 0, footerY + 22, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Receipt error:", err);
    res.status(500).json({ error: "Server error generating receipt" });
  }
};
