import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";

const allowedFields = [
  "title",
  "subject",
  "description",
  "startTime",
  "endTime",
  "duration",
  "questionCount",
  "marksPerQuestion",
  "shuffleOptions",
];

const getQuizData = (body) => {
  const data = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) {
      data[field] = body[field];
    }
  }

  return data;
};

const findQuiz = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return Quiz.findById(id);
};

// Create a quiz
export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create({
      ...getQuizData(req.body),
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

// Get all quizzes
export const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific quiz
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await findQuiz(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const questionPoolCount = await Question.countDocuments({
      quizId: quiz._id,
    });

    const attemptCount = await Attempt.countDocuments({
      quizId: quiz._id,
    });

    return res.status(200).json({
      success: true,
      quiz,
      questionPoolCount,
      attemptCount,
    });
  } catch (error) {
    next(error);
  }
};

// Update a quiz
export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await findQuiz(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft quizzes can be edited",
      });
    }

    Object.assign(quiz, getQuizData(req.body));

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await session.withTransaction(async () => {
      const quiz = await Quiz.findById(
        req.params.id
      ).session(session);

      if (!quiz) {
        const error = new Error("Quiz not found");
        error.statusCode = 404;
        throw error;
      }

      if (quiz.status !== "draft") {
        const error = new Error(
          "Only draft quizzes can be deleted"
        );
        error.statusCode = 400;
        throw error;
      }

      const hasAttempts = await Attempt.exists({
        quizId: quiz._id,
      }).session(session);

      if (hasAttempts) {
        const error = new Error(
          "Cannot delete a quiz with student attempts"
        );
        error.statusCode = 400;
        throw error;
      }

      await Question.deleteMany({
        quizId: quiz._id,
      }).session(session);

      await Quiz.deleteOne({
        _id: quiz._id,
      }).session(session);
    });

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

// Publish a quiz
export const publishQuiz = async (req, res, next) => {
  try {
    const quiz = await findQuiz(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft quizzes can be published",
      });
    }

    if (quiz.endTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Quiz closing time has already passed",
      });
    }

    const questionPoolCount = await Question.countDocuments({
      quizId: quiz._id,
    });

    if (questionPoolCount < quiz.questionCount) {
      return res.status(400).json({
        success: false,
        message: `At least ${quiz.questionCount} questions are required. Currently available: ${questionPoolCount}`,
      });
    }

    quiz.status = "published";

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz published successfully",
      quiz,
      quizLink: `${process.env.CLIENT_URL}/quiz/${quiz._id}`,
    });
  } catch (error) {
    next(error);
  }
};

// Public quiz information for students
export const getPublicQuiz = async (req, res, next) => {
  try {
    const quiz = await findQuiz(req.params.id);

    if (!quiz || quiz.status === "draft") {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const now = new Date();

    let availability = "open";

    if (quiz.status === "closed" || now >= quiz.endTime) {
      availability = "closed";
    } else if (now < quiz.startTime) {
      availability = "upcoming";
    }

    return res.status(200).json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        description: quiz.description,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        duration: quiz.duration,
        questionCount: quiz.questionCount,
        marksPerQuestion: quiz.marksPerQuestion,
        totalMarks:
          quiz.questionCount * quiz.marksPerQuestion,
        availability,
      },
      serverTime: now,
    });
  } catch (error) {
    next(error);
  }
};