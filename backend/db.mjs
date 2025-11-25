import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
let dbInstance = null;

export async function connectDB() {
  if (dbInstance) return dbInstance;

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to MongoDB successfully");
    dbInstance = client.db(dbName);
    return dbInstance;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}