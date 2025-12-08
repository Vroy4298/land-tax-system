import { verifyToken } from "../utils/jwt.mjs";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Standard user object
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};
