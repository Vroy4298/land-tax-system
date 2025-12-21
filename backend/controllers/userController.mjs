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
