import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import quizRoutes from "./routes/quiz.routes.js";
import connectDB from "./config/db.js";
import teacherRoutes from "./routes/teacher.routes.js";

import attemptRoutes from "./routes/attempt.routes.js";

import {
  startAutoSubmitWorker,
} from "./services/autoSubmit.service.js";

import {
  notFound,
  errorHandler,
} from "./middleware/error.middleware.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

const requiredVariables = [
  "MONGO_URI",
  "CLIENT_URL",
  "TEACHER_PASSWORD",
  "JWT_SECRET",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.error(`Missing environment variable: ${variable}`);
    process.exit(1);
  }
}

const app = express();

app.disable("x-powered-by");

// Trust the hosting provider's reverse proxy
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    message: "Quiz Website API",
    database: connected ? "connected" : "disconnected",
  });
});

// API routes
app.use("/api/teacher", teacherRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/attempts", attemptRoutes);

// Error handling
// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(
    __dirname,
    "../frontend/dist"
  );

  app.use(express.static(frontendPath));

  app.get("/{*splat}", (req, res, next) => {
    if (
      req.path === "/api" ||
      req.path.startsWith("/api/")
    ) {
      return next();
    }

    res.sendFile(
      path.join(frontendPath, "index.html")
    );
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
await connectDB();

// Ensure unique attempt indexes are ready
const { default: Attempt } = await import(
  "./models/Attempt.js"
);

await Attempt.createIndexes();

startAutoSubmitWorker();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});