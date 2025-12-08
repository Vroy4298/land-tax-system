import bcrypt from "bcryptjs";
import { connectDB } from "../db.mjs";
import { generateToken } from "../utils/jwt.mjs";
import { ObjectId } from "mongodb";

/* ---------------------- REGISTER USER ---------------------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const db = await connectDB();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      name,
      email,
      password: hashed,
      role: "user",
      createdAt: new Date(),
    });

    return res.status(201).json({ 
      message: "Registered",
      userId: result.insertedId 
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
};

/* ---------------------- LOGIN USER ---------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

/* ---------------------- GET PROFILE ---------------------- */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
