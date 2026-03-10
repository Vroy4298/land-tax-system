import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "../db.mjs";
import { generateToken } from "../utils/jwt.mjs";
import { sendResetEmail } from "../utils/mailer.mjs";
import { ObjectId } from "mongodb";

/* ---------------------- REGISTER USER ---------------------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await users.insertOne({
      name,
      email,
      password: hashed,
      role: "citizen",
      createdAt: new Date(),
    });

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- LOGIN USER ---------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
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

    return res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- FORGOT PASSWORD ---------------------- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const genericMessage =
      "If this email is registered, a password reset link has been sent.";

    if (!email) {
      return res.json({ message: genericMessage });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiry,
        },
      }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetEmail(user.email, resetLink);

    return res.json({ message: genericMessage });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- RESET PASSWORD ---------------------- */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await users.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Token is invalid or has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      }
    );

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- GET ALL USERS (ADMIN) ---------------------- */
export const getAllUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const allUsers = await users
      .find({}, { projection: { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json(allUsers);
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- MAKE ADMIN (SEED ONLY) ---------------------- */
export const makeAdmin = async (req, res) => {
  try {
    const { email, seedSecret } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Must provide the seed secret from env vars
    const expectedSecret = process.env.ADMIN_SEED_SECRET;
    if (!expectedSecret || seedSecret !== expectedSecret) {
      return res.status(403).json({ error: "Invalid seed secret" });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const result = await users.updateOne({ email }, { $set: { role: "admin" } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ message: `${email} is now an admin` });
  } catch (err) {
    console.error("Make admin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------- UPLOAD AVATAR ---------------------- */
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Convert file buffer to base64 string
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const db = await connectDB();
    const users = db.collection("users");

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { avatarUrl: base64Image } }
    );

    return res.json({ message: "Avatar updated successfully", avatarUrl: base64Image });
  } catch (err) {
    console.error("Upload avatar error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};