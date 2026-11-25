import express from "express";

import {
  addQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  uploadQuestions,
} from "../controllers/question.controller.js";

import {
  requireTeacher,
} from "../middleware/teacher.middleware.js";

import {
  uploadCSV,
} from "../middleware/upload.middleware.js";

const router = express.Router({
  mergeParams: true,
});

router.use(requireTeacher);

router.post("/", addQuestion);

router.get("/", getQuestions);

router.post(
  "/upload",
  uploadCSV.single("file"),
  uploadQuestions
);

router.patch("/:questionId", updateQuestion);

router.delete("/:questionId", deleteQuestion);

export default router;