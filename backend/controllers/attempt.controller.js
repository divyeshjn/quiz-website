import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";

import {
  generateQuestionPaper,
  calculateDeadline,
} from "../services/attempt.service.js";

import {
  finalizeAttempt,
} from "../services/submission.service.js";

import {
  hashToken,
} from "../middleware/attempt.middleware.js";

// Return only student-safe information
const sanitizeAttempt = (attempt) => ({
  id: attempt._id,
  quizId: attempt.quizId,
  studentName: attempt.studentName,
  rollNumber: attempt.rollNumber,
  email: attempt.email,
  startedAt: attempt.startedAt,
  deadline: attempt.deadline,
  submittedAt: attempt.submittedAt,
  status: attempt.status,
  totalMarks: attempt.totalMarks,

  questions: attempt.assignedQuestions.map(
    (question) => ({
      questionId: question.questionId,
      questionText: question.questionText,
      options: question.options,
      marks: question.marks,
      selectedOption: question.selectedOption,
    })
  ),
});

// Start a new quiz attempt
export const startAttempt = async (req, res, next) => {
  try {
    const {
      quizId,
      studentName,
      rollNumber,
      email,
    } = req.body;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const studentFields = [
      studentName,
      rollNumber,
      email,
    ];

    if (
      studentFields.some(
        (field) =>
          typeof field !== "string" || !field.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, roll number and email are required",
      });
    }

    const cleanName = studentName.trim();
    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanName.length > 100 ||
      cleanRoll.length > 50 ||
      cleanEmail.length > 254
    ) {
      return res.status(400).json({
        success: false,
        message: "Student details exceed allowed length",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const collegeDomain = (
      process.env.COLLEGE_EMAIL_DOMAIN || ""
    ).trim().toLowerCase();

    if (
      collegeDomain &&
      cleanEmail.split("@")[1] !== collegeDomain
    ) {
      return res.status(400).json({
        success: false,
        message: `Use your @${collegeDomain} college email`,
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz || quiz.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Quiz is not available",
      });
    }

    const now = new Date();

    if (now < quiz.startTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz has not started yet",
      });
    }

    if (now >= quiz.endTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz has closed",
      });
    }

    // Prevent duplicate attempts
    const existingAttempt = await Attempt.exists({
      quizId: quiz._id,
      $or: [
        { email: cleanEmail },
        { rollNumber: cleanRoll },
      ],
    });

    if (existingAttempt) {
      return res.status(409).json({
        success: false,
        message: "An attempt already exists for these details",
      });
    }

    const questions = await Question.find({
      quizId: quiz._id,
    })
      .select("_id questionText options correctOption")
      .lean();

    if (questions.length < quiz.questionCount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient questions in quiz pool",
      });
    }

    // Generate randomized question paper
    const assignedQuestions = generateQuestionPaper(
      questions,
      quiz
    );

    const startedAt = new Date();

    if (startedAt >= quiz.endTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz has closed",
      });
    }

    const deadline = new Date(
      Math.min(
        startedAt.getTime() + quiz.duration * 60 * 1000,
        new Date(quiz.endTime).getTime()
      )
    );

    // Generate secure attempt token
    const accessToken = randomBytes(32).toString("hex");

    const attempt = await Attempt.create({
      quizId: quiz._id,
      studentName: cleanName,
      rollNumber: cleanRoll,
      email: cleanEmail,
      accessTokenHash: hashToken(accessToken),
      assignedQuestions,
      startedAt,
      deadline,
      totalMarks:
        quiz.questionCount * quiz.marksPerQuestion,
      status: "in-progress",
    });

    return res.status(201).json({
      success: true,
      message: "Quiz started successfully",
      accessToken,
      attempt: sanitizeAttempt(attempt),
      serverTime: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve or resume an existing attempt
export const getAttempt = async (req, res, next) => {
  try {
    const attempt = await finalizeAttempt(
      req.attempt._id
    );

    return res.status(200).json({
      success: true,
      attempt: sanitizeAttempt(attempt),
      serverTime: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

// Save or clear a selected answer
export const saveAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOption } = req.body;

    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    if (
      selectedOption !== null &&
      (
        !Number.isInteger(selectedOption) ||
        selectedOption < 0 ||
        selectedOption > 3
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid selected option",
      });
    }

    const attempt = req.attempt;

    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Quiz has already been submitted",
      });
    }

    if (new Date() >= attempt.deadline) {
      await finalizeAttempt(attempt._id);

      return res.status(400).json({
        success: false,
        message: "Time is up. Quiz automatically submitted.",
      });
    }

    const questionExists = attempt.assignedQuestions.some(
      (question) =>
        String(question.questionId) === String(questionId)
    );

    if (!questionExists) {
      return res.status(404).json({
        success: false,
        message: "Question not assigned to this attempt",
      });
    }

    // Atomically save the answer only before the deadline
    const updatedAttempt = await Attempt.findOneAndUpdate(
      {
        _id: attempt._id,
        status: "in-progress",
        $expr: {
          $gt: ["$deadline", "$$NOW"],
        },
        "assignedQuestions.questionId": questionId,
      },
      {
        $set: {
          "assignedQuestions.$.selectedOption":
            selectedOption,
        },
        $inc: {
          __v: 1,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAttempt) {
      await finalizeAttempt(attempt._id);

      return res.status(409).json({
        success: false,
        message: "Attempt is no longer accepting answers",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      questionId,
      selectedOption,
      serverTime: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

// Submit and automatically grade the quiz
export const submitAttempt = async (req, res, next) => {
  try {
    const attempt = await finalizeAttempt(
      req.attempt._id,
      true
    );

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      attempt: {
        id: attempt._id,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};