import express from "express";
import rateLimit from "express-rate-limit";

import {
  loginTeacher,
  logoutTeacher,
  getTeacherStatus,
} from "../controllers/teacher.controller.js";

import {
  requireTeacher,
} from "../middleware/teacher.middleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

router.post("/login", loginLimiter, loginTeacher);

router.post("/logout", logoutTeacher);

router.get("/me", requireTeacher, getTeacherStatus);

export default router;