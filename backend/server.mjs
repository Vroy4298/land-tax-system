import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "./routes/userRoutes.mjs";
import propertyRoutes from "./routes/propertyRoutes.mjs";
import paymentRoutes from "./routes/paymentRoutes.mjs";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.mjs";
import adminRoutes from "./routes/adminRoutes.mjs";
import disputeRoutes from "./routes/disputeRoutes.mjs";
import { startScheduler } from "./utils/scheduler.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   ✅ CORS CONFIG (NODE 22 SAFE)
======================= */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const allowed = [
        "http://localhost:5173",
        "https://land-tax-system-g2c5.vercel.app",
        "https://land-tax-system-two.vercel.app",
      ];

      // Also allow any Vercel preview URL for this project
      const isVercelPreview =
        origin.includes("land-tax-system") && origin.endsWith(".vercel.app");

      if (allowed.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(morgan("dev"));

/* =======================
   TEST ROUTE
======================= */
app.get("/", (req, res) => {
  res.json({ message: "Land Tax Backend running" });
});

/* =======================
   ROUTES
======================= */
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/pay-tax", paymentRoutes);
app.use("/api/payments", paymentHistoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/disputes", disputeRoutes);

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startScheduler();
});
