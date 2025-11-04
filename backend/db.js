import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });

// connect once and reuse
let dbInstance = null;
export const connectDB = async () => {
  if (dbInstance) return dbInstance;
  await client.connect();
  dbInstance = client.db(process.env.DB_NAME || 'landtaxsystem');
  return dbInstance;
};
