import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { generateToken } from "../utils/jwt.mjs";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "landtaxsystem";
const usersCollection = "users";

// ✅ Connect once when server starts
(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
})();

// ✅ REGISTER USER
export const handleRegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const db = client.db(dbName);
    const existingUser = await db.collection(usersCollection).findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection(usersCollection).insertOne({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ LOGIN USER
export const handleLoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = client.db(dbName);
    const user = await db.collection(usersCollection).findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ PROFILE ROUTE
// ✅ GET PROFILE (Protected)
export const handleProfileUser = async (req, res) => {
  try {
    const db = client.db(dbName);
    const user = await db.collection("users").findOne(
      { email: req.user.email },
      { projection: { password: 0 } } // hide password
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
  name: user.name,
  email: user.email,
});

  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
