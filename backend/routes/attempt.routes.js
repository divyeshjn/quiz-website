import express from "express";
import rateLimit from "express-rate-limit";

import {
  startAttempt,
  getAttempt,
  saveAnswer,
  submitAttempt,
} from "../controllers/attempt.controller.js";

import {
  requireAttemptAccess,
} from "../middleware/attempt.middleware.js";

const router = express.Router();

const startLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Try again shortly.",
  },
});

// Start a quiz
router.post("/start", startLimiter, startAttempt);

// Protected student attempt routes
router.get(
  "/:id",
  requireAttemptAccess,
  getAttempt
);

router.patch(
  "/:id/answer",
  requireAttemptAccess,
  saveAnswer
);

router.post(
  "/:id/submit",
  requireAttemptAccess,
  submitAttempt
);

export default router;