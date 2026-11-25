import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      required: true,

      validate: {
        validator: (options) =>
          options.length === 4 &&
          options.every((option) => option.length > 0) &&
          new Set(options).size === 4,

        message: "Exactly four distinct options are required",
      },
    },

    correctOption: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Question",
  questionSchema
);