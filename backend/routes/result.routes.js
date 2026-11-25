import express from "express";

import {
  getResults,
  getAnalytics,
  getIndividualResult,
  exportResults,
} from "../controllers/result.controller.js";

import {
  requireTeacher,
} from "../middleware/teacher.middleware.js";

const router = express.Router({
  mergeParams: true,
});

router.use(requireTeacher);

// Prevent caching of private student results
router.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

router.get("/", getResults);

router.get("/analytics", getAnalytics);

router.get("/export", exportResults);

router.get("/:attemptId", getIndividualResult);

export default router;