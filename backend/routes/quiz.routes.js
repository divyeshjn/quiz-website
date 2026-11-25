import express from "express";

import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  getPublicQuiz,
} from "../controllers/quiz.controller.js";

import {
  requireTeacher,
} from "../middleware/teacher.middleware.js";

import questionRoutes from "./question.routes.js";
import resultRoutes from "./result.routes.js";

const router = express.Router();

// Public routes
router.get("/:id/public", getPublicQuiz);

// Protected teacher routes
router.use(requireTeacher);

// Question management
router.use("/:id/questions", questionRoutes);

// Results and analytics
router.use("/:id/results", resultRoutes);

// Quiz management
router.post("/", createQuiz);

router.get("/", getAllQuizzes);

router.get("/:id", getQuizById);

router.patch("/:id", updateQuiz);

router.delete("/:id", deleteQuiz);

router.post("/:id/publish", publishQuiz);

export default router;