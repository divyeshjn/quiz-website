import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    questionCount: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },

    marksPerQuestion: {
      type: Number,
      default: 1,
      min: 1,
    },

    shuffleOptions: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.pre("validate", function () {
  if (this.endTime <= this.startTime) {
    this.invalidate(
      "endTime",
      "Closing time must be after opening time"
    );
  }
});

export default mongoose.model("Quiz", quizSchema);