import Attempt from "../models/Attempt.js";

export const finalizeAttempt = async (
  attemptId,
  force = false
) => {
  for (let retry = 0; retry < 5; retry++) {
    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      const error = new Error("Attempt not found");
      error.statusCode = 404;
      throw error;
    }

    // Already submitted
    if (attempt.status !== "in-progress") {
      return attempt;
    }

    const now = new Date();
    const expired = now >= attempt.deadline;

    // Do not automatically submit before deadline
    if (!force && !expired) {
      return attempt;
    }

    let score = 0;
    let totalMarks = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    for (const question of attempt.assignedQuestions) {
      totalMarks += question.marks;

      if (question.selectedOption == null) {
        unanswered++;
      } else if (
        question.selectedOption === question.correctOption
      ) {
        correctAnswers++;
        score += question.marks;
      } else {
        incorrectAnswers++;
      }
    }

    const updatedAttempt = await Attempt.findOneAndUpdate(
      {
        _id: attempt._id,
        status: "in-progress",
        __v: attempt.__v,
      },
      {
        $set: {
          score,
          totalMarks,
          correctAnswers,
          incorrectAnswers,
          unanswered,
          submittedAt: expired ? attempt.deadline : now,
          status: expired
            ? "auto-submitted"
            : "submitted",
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

    if (updatedAttempt) {
      return updatedAttempt;
    }

    // An answer changed concurrently.
    // Reload the attempt and calculate again.
  }

  const error = new Error(
    "Attempt is being updated. Please retry."
  );

  error.statusCode = 409;

  throw error;
};