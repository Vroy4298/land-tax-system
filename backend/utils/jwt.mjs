import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/* ------------------- CREATE TOKEN ------------------- */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

/* ------------------- VERIFY TOKEN (Decode only) ------------------- */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return null;
  }
};
