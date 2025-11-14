import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
const dbName = process.env.DB_NAME || "landtaxsystem";

export const getPropertyCollection = () => {
  return client.db(dbName).collection("properties");
};
