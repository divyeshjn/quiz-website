import mongoose from "mongoose";

import Quiz from "../models/Quiz.js";
import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";

import {
  finalizeExpiredAttempts,
  formatStudentResult,
  calculateStatistics,
  calculateQuestionAnalytics,
  calculateScoreDistribution,
} from "../services/result.service.js";

import {
  finalizeAttempt,
} from "../services/submission.service.js";

import {
  generateCSV,
} from "../utils/csv.js";

const createError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Find quiz
const findQuiz = async (quizId) => {
  if (!mongoose.isValidObjectId(quizId)) {
    throw createError("Invalid quiz ID");
  }

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw createError("Quiz not found", 404);
  }

  return quiz;
};

// Get all attempts after finalizing expired ones
const getQuizAttempts = async (quizId) => {
  await finalizeExpiredAttempts(quizId);

  return Attempt.find({
    quizId,
  }).sort({
    rollNumber: 1,
  }).lean();
};

// Get results and overall statistics
export const getResults = async (req, res, next) => {
  try {
    const quiz = await findQuiz(req.params.id);

    const attempts = await getQuizAttempts(
      quiz._id
    );

    const passingPercentage =
      req.query.passingPercentage === undefined
        ? 50
        : Number(req.query.passingPercentage);

    if (
      !Number.isFinite(passingPercentage) ||
      passingPercentage < 0 ||
      passingPercentage > 100
    ) {
      throw createError(
        "Passing percentage must be between 0 and 100"
      );
    }

    const statistics = calculateStatistics(
      attempts,
      passingPercentage
    );

    const students = attempts.map(
      formatStudentResult
    );

    return res.status(200).json({
      success: true,

      quiz: {
        id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        status: quiz.status,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        duration: quiz.duration,
        questionCount: quiz.questionCount,
        totalMarks:
          quiz.questionCount *
          quiz.marksPerQuestion,
      },

      statistics,

      scoreDistribution:
        calculateScoreDistribution(attempts),

      students,
    });
  } catch (error) {
    next(error);
  }
};

// Get question-wise analytics
export const getAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const quiz = await findQuiz(req.params.id);

    const attempts = await getQuizAttempts(
      quiz._id
    );

    const questionPool = await Question.find({
      quizId: quiz._id,
    }).select("questionText").lean();

    const analytics =
      calculateQuestionAnalytics(
        attempts,
        questionPool
      );

    // Questions with no observations are excluded
    // from easiest and hardest question comparisons
    const observed = analytics.filter(
      (question) => question.accuracy !== null
    );

    const sorted = [...observed].sort(
      (a, b) => a.accuracy - b.accuracy
    );

    return res.status(200).json({
      success: true,

      totalQuestions: analytics.length,

      hardestQuestions: sorted.slice(0, 5),

      easiestQuestions: [...sorted]
        .reverse()
        .slice(0, 5),

      questionAnalytics: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// Get individual student result
export const getIndividualResult = async (
  req,
  res,
  next
) => {
  try {
    const quiz = await findQuiz(req.params.id);

    const { attemptId } = req.params;

    if (!mongoose.isValidObjectId(attemptId)) {
      throw createError("Invalid attempt ID");
    }

    const existingAttempt = await Attempt.findOne({
      _id: attemptId,
      quizId: quiz._id,
    });

    if (!existingAttempt) {
      throw createError(
        "Student attempt not found",
        404
      );
    }

    const attempt = await finalizeAttempt(
      existingAttempt._id
    );

    const isSubmitted =
      attempt.status !== "in-progress";

    const questions = attempt.assignedQuestions.map(
      (question) => ({
        questionId: question.questionId,
        questionText: question.questionText,
        options: question.options,

        correctOption: question.correctOption,
        selectedOption: question.selectedOption,

        marks: question.marks,

        isCorrect: !isSubmitted ||
          question.selectedOption == null
            ? null
            : question.selectedOption ===
              question.correctOption,

        marksObtained: !isSubmitted
          ? null
          : question.selectedOption ===
            question.correctOption
            ? question.marks
            : 0,
      })
    );

    return res.status(200).json({
      success: true,
      student: formatStudentResult(attempt),
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// Export all results as CSV
export const exportResults = async (
  req,
  res,
  next
) => {
  try {
    const quiz = await findQuiz(req.params.id);

    const attempts = await getQuizAttempts(
      quiz._id
    );

    const headers = [
      "Student Name",
      "Roll Number",
      "Email",
      "Score",
      "Total Marks",
      "Percentage",
      "Correct Answers",
      "Incorrect Answers",
      "Unanswered",
      "Status",
      "Started At (UTC)",
      "Submitted At (UTC)",
      "Time Taken (Seconds)",
    ];

    const rows = attempts.map((attempt) => {
      const student = formatStudentResult(
        attempt
      );

      return [
        student.studentName,
        student.rollNumber,
        student.email,
        student.score,
        student.totalMarks,
        student.percentage,
        student.correctAnswers,
        student.incorrectAnswers,
        student.unanswered,
        student.status,

        student.startedAt
          ? new Date(
              student.startedAt
            ).toISOString()
          : "",

        student.submittedAt
          ? new Date(
              student.submittedAt
            ).toISOString()
          : "",

        student.timeTakenSeconds,
      ];
    });

    const csv = generateCSV(headers, rows);

    const safeTitle = quiz.title
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 100);

    const filename =
      `${safeTitle}_results.csv`;

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};