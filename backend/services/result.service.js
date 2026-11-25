import Attempt from "../models/Attempt.js";

import {
  finalizeAttempt,
} from "./submission.service.js";

const round = (value) => {
  return Math.round(value * 100) / 100;
};

// Finalize expired attempts before generating results
export const finalizeExpiredAttempts = async (quizId) => {
  const expiredAttempts = await Attempt.find({
    quizId,
    status: "in-progress",
    deadline: {
      $lte: new Date(),
    },
  }).select("_id");

  for (const attempt of expiredAttempts) {
    await finalizeAttempt(attempt._id);
  }
};

// Calculate individual student result
export const formatStudentResult = (attempt) => {
  const isSubmitted =
    attempt.status !== "in-progress";

  const percentage =
    isSubmitted && attempt.totalMarks > 0
      ? round(
          (attempt.score / attempt.totalMarks) * 100
        )
      : null;

  const timeTakenSeconds =
    attempt.submittedAt
      ? Math.max(
          0,
          Math.floor(
            (
              new Date(attempt.submittedAt) -
              new Date(attempt.startedAt)
            ) / 1000
          )
        )
      : null;

  return {
    attemptId: attempt._id,
    studentName: attempt.studentName,
    rollNumber: attempt.rollNumber,
    email: attempt.email,

    score: isSubmitted ? attempt.score : null,
    totalMarks: attempt.totalMarks,
    percentage,

    correctAnswers: isSubmitted
      ? attempt.correctAnswers
      : null,

    incorrectAnswers: isSubmitted
      ? attempt.incorrectAnswers
      : null,

    unanswered: isSubmitted
      ? attempt.unanswered
      : null,

    status: attempt.status,

    startedAt: attempt.startedAt,
    deadline: attempt.deadline,
    submittedAt: attempt.submittedAt,

    timeTakenSeconds,
  };
};

// Calculate overall quiz statistics
export const calculateStatistics = (
  attempts,
  passingPercentage = 50
) => {
  const submitted = attempts.filter(
    (attempt) =>
      attempt.status === "submitted" ||
      attempt.status === "auto-submitted"
  );

  const totalParticipants = attempts.length;
  const totalSubmitted = submitted.length;

  const inProgress = attempts.filter(
    (attempt) =>
      attempt.status === "in-progress"
  ).length;

  const manualSubmissions = submitted.filter(
    (attempt) =>
      attempt.status === "submitted"
  ).length;

  const autoSubmissions = submitted.filter(
    (attempt) =>
      attempt.status === "auto-submitted"
  ).length;

  const scores = submitted.map(
    (attempt) => attempt.score
  );

  const percentages = submitted.map(
    (attempt) =>
      attempt.totalMarks > 0
        ? (attempt.score / attempt.totalMarks) * 100
        : 0
  );

  const passedStudents = percentages.filter(
    (percentage) =>
      percentage >= passingPercentage
  ).length;

  const totalCorrect = submitted.reduce(
    (sum, attempt) =>
      sum + attempt.correctAnswers,
    0
  );

  const totalIncorrect = submitted.reduce(
    (sum, attempt) =>
      sum + attempt.incorrectAnswers,
    0
  );

  const totalUnanswered = submitted.reduce(
    (sum, attempt) =>
      sum + attempt.unanswered,
    0
  );

  const totalQuestions =
    totalCorrect +
    totalIncorrect +
    totalUnanswered;

  const averageTimeSeconds = totalSubmitted
    ? round(
        submitted.reduce((sum, attempt) => {
          return sum + Math.max(
            0,
            (
              new Date(attempt.submittedAt) -
              new Date(attempt.startedAt)
            ) / 1000
          );
        }, 0) / totalSubmitted
      )
    : null;

  return {
    totalParticipants,
    totalSubmitted,
    inProgress,
    manualSubmissions,
    autoSubmissions,

    averageScore: totalSubmitted
      ? round(
          scores.reduce(
            (sum, score) => sum + score,
            0
          ) / totalSubmitted
        )
      : null,

    highestScore: totalSubmitted
      ? Math.max(...scores)
      : null,

    lowestScore: totalSubmitted
      ? Math.min(...scores)
      : null,

    averagePercentage: totalSubmitted
      ? round(
          percentages.reduce(
            (sum, percentage) =>
              sum + percentage,
            0
          ) / totalSubmitted
        )
      : null,

    passingPercentage,
    passedStudents,

    failedStudents:
      totalSubmitted - passedStudents,

    passPercentage: totalSubmitted
      ? round(
          (passedStudents / totalSubmitted) * 100
        )
      : null,

    submissionPercentage: totalParticipants
      ? round(
          (totalSubmitted / totalParticipants) * 100
        )
      : 0,

    totalCorrect,
    totalIncorrect,
    totalUnanswered,

    averageAccuracy: totalQuestions
      ? round(
          (totalCorrect / totalQuestions) * 100
        )
      : null,

    averageTimeSeconds,
  };
};

// Calculate question-wise performance
export const calculateQuestionAnalytics = (
  attempts,
  questionPool = []
) => {
  const questionMap = new Map();

  // Include questions that were never assigned
  for (const question of questionPool) {
    questionMap.set(String(question._id), {
      questionId: String(question._id),
      questionText: question.questionText,
      assignedCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      unansweredCount: 0,
    });
  }

  const submitted = attempts.filter(
    (attempt) =>
      attempt.status !== "in-progress"
  );

  for (const attempt of submitted) {
    for (const question of attempt.assignedQuestions) {
      const id = String(question.questionId);

      if (!questionMap.has(id)) {
        questionMap.set(id, {
          questionId: id,
          questionText: question.questionText,
          assignedCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: 0,
        });
      }

      const analytics = questionMap.get(id);

      analytics.assignedCount++;

      if (question.selectedOption == null) {
        analytics.unansweredCount++;
      } else if (
        question.selectedOption ===
        question.correctOption
      ) {
        analytics.correctCount++;
      } else {
        analytics.incorrectCount++;
      }
    }
  }

  return Array.from(questionMap.values()).map(
    (question) => ({
      ...question,

      accuracy: question.assignedCount
        ? round(
            (
              question.correctCount /
              question.assignedCount
            ) * 100
          )
        : null,

      incorrectPercentage: question.assignedCount
        ? round(
            (
              question.incorrectCount /
              question.assignedCount
            ) * 100
          )
        : null,

      unansweredPercentage: question.assignedCount
        ? round(
            (
              question.unansweredCount /
              question.assignedCount
            ) * 100
          )
        : null,
    })
  );
};

// Calculate score distribution
export const calculateScoreDistribution = (
  attempts
) => {
  const distribution = [
    { range: "0-20%", count: 0 },
    { range: ">20-40%", count: 0 },
    { range: ">40-60%", count: 0 },
    { range: ">60-80%", count: 0 },
    { range: ">80-100%", count: 0 },
  ];

  for (const attempt of attempts) {
    if (attempt.status === "in-progress") {
      continue;
    }

    const percentage = attempt.totalMarks > 0
      ? (attempt.score / attempt.totalMarks) * 100
      : 0;

    if (percentage <= 20) {
      distribution[0].count++;
    } else if (percentage <= 40) {
      distribution[1].count++;
    } else if (percentage <= 60) {
      distribution[2].count++;
    } else if (percentage <= 80) {
      distribution[3].count++;
    } else {
      distribution[4].count++;
    }
  }

  return distribution;
};