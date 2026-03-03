import { getPropertyCollection } from "../models/Property.mjs";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage so we can stream to Cloudinary directly
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
    },
});

/* ---------------------- UPLOAD DOCUMENT ---------------------- */
export const uploadDocument = async (req, res) => {
    try {
        const { id: propertyId } = req.params;
        const userId = req.user.id;

        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const collection = await getPropertyCollection();
        const property = await collection.findOne({
            _id: new ObjectId(propertyId),
            owner: new ObjectId(userId),
        });
        if (!property) return res.status(404).json({ error: "Property not found" });

        // Upload buffer to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `land-tax/${propertyId}`,
                    resource_type: "auto",
                    public_id: `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`,
                },
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const docEntry = {
            name: req.file.originalname,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            type: req.file.mimetype,
            uploadedAt: new Date(),
        };

        await collection.updateOne(
            { _id: new ObjectId(propertyId) },
            { $push: { documents: docEntry } }
        );

        res.status(201).json({ message: "Document uploaded", document: docEntry });
    } catch (err) {
        console.error("Upload document error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
};

/* ---------------------- GET DOCUMENTS ---------------------- */
export const getDocuments = async (req, res) => {
    try {
        const { id: propertyId } = req.params;
        const userId = req.user.id;

        const collection = await getPropertyCollection();
        const property = await collection.findOne(
            { _id: new ObjectId(propertyId), owner: new ObjectId(userId) },
            { projection: { documents: 1 } }
        );
        if (!property) return res.status(404).json({ error: "Property not found" });

        res.json(property.documents || []);
    } catch (err) {
        console.error("Get documents error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
