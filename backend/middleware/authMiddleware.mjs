import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    // ✅ Read Authorization header safely (case-insensitive)
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    // ❌ No header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    // ❌ Guard against malformed values
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ error: "Invalid token" });
    }

    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ❌ Extra safety
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // ✅ Attach standardized user object
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
