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
// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Always return same message (security)
    const genericMessage =
      "If this email is registered, a password reset link has been sent.";

    if (!email) {
      return res.json({ message: genericMessage });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });

    if (!user) {
      // Do NOT reveal whether user exists
      return res.json({ message: genericMessage });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiry,
        },
      }
    );

    // 🚨 EMAIL SIMULATION (FOR COLLEGE PROJECT)
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await sendResetEmail(user.email, resetLink);


    return res.json({ message: genericMessage });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
// ================= RESET PASSWORD =================
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

    // Hash the token to match DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find valid user
    const user = await users.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Token is invalid or has expired",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password & remove reset fields
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
