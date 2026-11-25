import mongoose from "mongoose";
import { parse } from "csv-parse/sync";

import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate question data
const validateQuestion = (data) => {
  const { questionText, options, correctOption } = data;

  if (
    typeof questionText !== "string" ||
    !questionText.trim()
  ) {
    throw createError("Question text is required");
  }

  if (!Array.isArray(options) || options.length !== 4) {
    throw createError(
      "Exactly four options are required"
    );
  }

  if (
    options.some(
      (option) =>
        typeof option !== "string" ||
        !option.trim()
    )
  ) {
    throw createError("All options must be non-empty");
  }

  const cleanedOptions = options.map(
    (option) => option.trim()
  );

  if (new Set(cleanedOptions).size !== 4) {
    throw createError("Options must be unique");
  }

  if (
    !Number.isInteger(correctOption) ||
    correctOption < 0 ||
    correctOption > 3
  ) {
    throw createError(
      "Correct option must be an integer from 0 to 3"
    );
  }

  return {
    questionText: questionText.trim(),
    options: cleanedOptions,
    correctOption,
  };
};

// Find a quiz
const findQuiz = async (quizId) => {
  if (!mongoose.isValidObjectId(quizId)) {
    throw createError("Invalid quiz ID", 400);
  }

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw createError("Quiz not found", 404);
  }

  return quiz;
};

// Allow question modifications only in draft quizzes
const findDraftQuiz = async (quizId) => {
  const quiz = await findQuiz(quizId);

  if (quiz.status !== "draft") {
    throw createError(
      "Questions can only be modified in draft quizzes"
    );
  }

  return quiz;
};

// Add an individual question
export const addQuestion = async (req, res, next) => {
  try {
    const quiz = await findDraftQuiz(req.params.id);

    const questionData = validateQuestion(req.body);

    const question = await Question.create({
      quizId: quiz._id,
      ...questionData,
    });

    return res.status(201).json({
      success: true,
      message: "Question added successfully",
      question,
    });
  } catch (error) {
    next(error);
  }
};

// Get all questions belonging to a quiz
export const getQuestions = async (req, res, next) => {
  try {
    const quiz = await findQuiz(req.params.id);

    const questions = await Question.find({
      quizId: quiz._id,
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing question
export const updateQuestion = async (req, res, next) => {
  try {
    const quiz = await findDraftQuiz(req.params.id);

    const { questionId } = req.params;

    if (!mongoose.isValidObjectId(questionId)) {
      throw createError("Invalid question ID");
    }

    const question = await Question.findOne({
      _id: questionId,
      quizId: quiz._id,
    });

    if (!question) {
      throw createError("Question not found", 404);
    }

    const updatedData = validateQuestion({
      questionText:
        req.body.questionText ?? question.questionText,

      options:
        req.body.options ?? question.options,

      correctOption:
        req.body.correctOption ?? question.correctOption,
    });

    Object.assign(question, updatedData);

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an individual question
export const deleteQuestion = async (req, res, next) => {
  try {
    const quiz = await findDraftQuiz(req.params.id);

    const { questionId } = req.params;

    if (!mongoose.isValidObjectId(questionId)) {
      throw createError("Invalid question ID");
    }

    const question = await Question.findOneAndDelete({
      _id: questionId,
      quizId: quiz._id,
    });

    if (!question) {
      throw createError("Question not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Upload questions using CSV
export const uploadQuestions = async (req, res, next) => {
  try {
    const quiz = await findDraftQuiz(req.params.id);

    if (!req.file) {
      throw createError("Please upload a CSV file");
    }

    const requiredHeaders = [
      "questionText",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
      "correctOption",
    ];

    let records;

    try {
      records = parse(req.file.buffer, {
        columns: (headers) => {
          const validHeaders =
            headers.length === requiredHeaders.length &&
            requiredHeaders.every(
              (header) => headers.includes(header)
            );

          if (!validHeaders) {
            throw new Error("Invalid CSV headers");
          }

          return headers;
        },
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (error) {
      throw createError(
        `Invalid CSV format: ${error.message}`
      );
    }

    if (records.length === 0) {
      throw createError("CSV file contains no questions");
    }

    if (records.length > 1000) {
      throw createError(
        "Maximum 1000 questions allowed per upload"
      );
    }

    const answerMap = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    };

    const validQuestions = [];
    const errors = [];

    records.forEach((record, index) => {
      try {
        const answer = String(
          record.correctOption || ""
        ).trim().toUpperCase();

        if (!Object.hasOwn(answerMap, answer)) {
          throw createError(
            "Correct option must be A, B, C or D"
          );
        }

        const questionData = validateQuestion({
          questionText: record.questionText,

          options: [
            record.optionA,
            record.optionB,
            record.optionC,
            record.optionD,
          ],

          correctOption: answerMap[answer],
        });

        validQuestions.push({
          quizId: quiz._id,
          ...questionData,
        });
      } catch (error) {
        errors.push({
          row: index + 2,
          message: error.message,
        });
      }
    });

    // Reject the entire upload if any row is invalid
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "CSV contains invalid questions",
        errors,
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const draft = await Quiz.findOne({
          _id: quiz._id,
          status: "draft",
        }).session(session);

        if (!draft) {
          throw createError("Quiz is no longer a draft");
        }

        await Question.insertMany(validQuestions, {
          session,
          ordered: true,
        });
      });
    } finally {
      await session.endSession();
    }

    const totalQuestions = await Question.countDocuments({
      quizId: quiz._id,
    });

    return res.status(201).json({
      success: true,
      message: "Questions uploaded successfully",
      uploadedCount: validQuestions.length,
      totalQuestions,
    });
  } catch (error) {
    next(error);
  }
};