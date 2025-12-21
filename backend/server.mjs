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

/* =======================
   ✅ CORS CONFIG (FIXED)
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://land-tax-system.vercel.app",
  "https://land-tax-system-ten.vercel.app",
  "https://land-tax-system-g2c5.vercel.app",
  "https://land-tax-system-1.onrender.com",
  // add any other Vercel preview domain if needed
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(morgan(process.env.LOG_LEVEL || "dev"));

/* =======================
   TEST ROUTE
======================= */
app.get("/", (req, res) => {
  res.json({ message: "Land Tax Backend (Express version)" });
});

/* =======================
   ROUTES
======================= */
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/pay-tax", paymentRoutes);
app.use("/api/payments", paymentHistoryRoutes);

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
