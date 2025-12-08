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

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${propertyId}.pdf`
    );

    doc.pipe(res);

    /* ---------------- WATERMARK (fixed) ---------------- */
const pageW = doc.page.width;
const pageH = doc.page.height;

// draw watermark centered, rotated, non-wrapping and faint
doc.save(); // save graphics state

doc.font("Helvetica-Bold")
   .fontSize(60)
   .fillColor("#e6e6e6")
   .opacity(0.08);

// rotate around page center
doc.rotate(30, { origin: [pageW / 2, pageH / 2] });

// prevent line wrapping by using a wide width and disabling lineBreak
doc.text("LAND TAX SYSTEM", (pageW / 2) - 300, (pageH / 2) - 20, {
  width: 600,
  align: "center",
  lineBreak: false,
});

doc.restore(); // restore graphics state so rotation/opacity don't affect later content


    /* ---------------- LOGO ---------------- */
    const logoPath = path.resolve("assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, {
        fit: [80, 80],
        align: "center",
        valign: "center",
      });
      doc.moveDown(0.5);
    }

    /* ---------------- HEADER ---------------- */
    doc
      .fontSize(24)
      .fillColor("#1a237e")
      .text("LAND TAX PAYMENT RECEIPT", {
        align: "center",
        underline: true,
      });

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("gray")
      .text("Government Authorized Digital Receipt", {
        align: "center",
      });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.2);

    /* ---------------- RECEIPT INFO ---------------- */
    doc
      .fontSize(14)
      .fillColor("black")
      .text(`Receipt ID: ${p.receiptId}`)
      .moveDown(0.3);

    doc.text(`Payment Date: ${new Date(p.paymentDate).toLocaleString()}`);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    /* ---------------- PROPERTY DETAILS ---------------- */
    doc
      .fontSize(16)
      .fillColor("#1a237e")
      .text("Property Details", { underline: true });

    doc.moveDown(0.8).fontSize(12).fillColor("black");

    doc.text(`Owner Name: ${p.ownerName}`);
    doc.text(`Address: ${p.address}`);
    doc.text(`Zone: ${p.zone}`);
    doc.text(`Property Type: ${p.propertyType}`);
    doc.text(`Usage Type: ${p.usageType}`);
    doc.text(`Built-up Area: ${p.builtUpArea} sq ft`);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    /* ---------------- TAX DETAILS ---------------- */
    doc
      .fontSize(16)
      .fillColor("#1a237e")
      .text("Tax Details", { underline: true });

    doc.moveDown(0.8).fontSize(12).fillColor("black");

    doc.text(`Base Rate: ₹${p.baseRate}`);
    doc.text(`Zone Multiplier: ${p.zoneMultiplier}`);
    doc.text(`Usage Multiplier: ${p.usageMultiplier}`);
    doc.text(`Age Factor: ${p.ageFactor}`);

    doc.moveDown();

    doc
      .fontSize(14)
      .fillColor("#2e7d32")
      .text(`Final Tax Amount: ₹${p.finalTaxAmount}`, {
        underline: true,
      });

    /* ---------------- QR CODE ---------------- */
    const qrData = `
Receipt ID: ${p.receiptId}
Property ID: ${propertyId}
Amount: ₹${p.finalTaxAmount}
Paid On: ${new Date(p.paymentDate).toLocaleString()}
`;

    const qrImage = await QRCode.toDataURL(qrData);

    doc.moveDown(1);
    doc
      .fontSize(14)
      .fillColor("#1a237e")
      .text("Scan for Receipt Details", { align: "center" });

    doc.moveDown(0.5);

    doc.image(qrImage, {
      fit: [120, 120],
      align: "center",
    });

    doc.moveDown(1.5);

    /* ---------------- FOOTER ---------------- */
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc
      .fontSize(12)
      .fillColor("gray")
      .text(
        "This is a system-generated receipt and does not require a physical signature.",
        { align: "center" }
      );

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("lightgray")
      .text("© 2025 Land Tax System - Digital Tax Automation Platform", {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("Receipt error:", err);
    res.status(500).json({ error: "Server error generating receipt" });
  }
};