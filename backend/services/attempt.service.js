import { shuffleArray } from "../utils/shuffle.js";

export const generateQuestionPaper = (
  questions,
  quiz
) => {
  if (questions.length < quiz.questionCount) {
    throw new Error("Insufficient questions in pool");
  }

  const selectedQuestions = shuffleArray(questions)
    .slice(0, quiz.questionCount);

  return selectedQuestions.map((question) => {
    let options = question.options.map(
      (text, index) => ({
        text,
        originalIndex: index,
      })
    );

    if (quiz.shuffleOptions) {
      options = shuffleArray(options);
    }

    const correctOption = options.findIndex(
      (option) =>
        option.originalIndex === question.correctOption
    );

    return {
      questionId: question._id,
      questionText: question.questionText,
      options: options.map((option) => option.text),
      correctOption,
      marks: quiz.marksPerQuestion,
      selectedOption: null,
    };
  });
};

export const calculateDeadline = (quiz, startedAt) => {
  const durationDeadline =
    startedAt.getTime() + quiz.duration * 60 * 1000;

  return new Date(
    Math.min(
      durationDeadline,
      quiz.endTime.getTime()
    )
  );
};

export const evaluateAttempt = (attempt) => {
  let score = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;

  for (const question of attempt.assignedQuestions) {
    if (question.selectedOption === null) {
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

  return {
    score,
    correctAnswers,
    incorrectAnswers,
    unanswered,
  };
};