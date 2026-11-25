import mongoose from "mongoose";

const assignedQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    questionText: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
    },

    correctOption: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3],
    },

    marks: {
      type: Number,
      required: true,
    },

    selectedOption: {
      type: Number,
      enum: [0, 1, 2, 3, null],
      default: null,
    },
  },
  {
    _id: false,
  }
);

const attemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    accessTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    assignedQuestions: {
      type: [assignedQuestionSchema],
      required: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    score: {
      type: Number,
      default: null,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    incorrectAnswers: {
      type: Number,
      default: 0,
    },

    unanswered: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "in-progress",
        "submitted",
        "auto-submitted",
      ],
      default: "in-progress",
    },
  },
  {
    timestamps: true,
  }
);

attemptSchema.index(
  {
    quizId: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

attemptSchema.index(
  {
    quizId: 1,
    rollNumber: 1,
  },
  {
    unique: true,
  }
);

attemptSchema.index({
  status: 1,
  deadline: 1,
});

export default mongoose.model(
  "Attempt",
  attemptSchema
);