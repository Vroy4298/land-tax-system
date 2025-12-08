import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "./routes/userRoutes.mjs";
import propertyRoutes from "./routes/propertyRoutes.mjs";
import paymentRoutes from "./routes/paymentRoutes.mjs";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(morgan(process.env.LOG_LEVEL || "dev"));

// Test Routes
app.get("/", (req, res) => {
  res.json({ message: "Land Tax Backend (Express version)" });
});

// Main Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

// ⭐ MUST MATCH FRONTEND EXACTLY
app.use("/api/pay-tax", paymentRoutes);

app.use("/api/payments", paymentHistoryRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
