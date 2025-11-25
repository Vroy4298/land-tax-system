import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { handleUserRoutes } from "./routes/userRoutes.mjs";
import { handlePropertyRoutes } from "./routes/propertyRoutes.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS configuration (important)
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Other middleware
app.use(express.json());
app.use(morgan(process.env.LOG_LEVEL || "dev"));

// ✅ Routes
app.get("/", (req, res) => {
  res.json({ message: "Land Tax Backend (Express version)" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Express backend connected successfully!" });
});

app.use("/api/users", handleUserRoutes);
app.use("/api/properties", handlePropertyRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});