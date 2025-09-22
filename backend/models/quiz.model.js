import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // index of correct option
  points: { type: Number, default: 1 },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  quizId: { type: String, required: true, unique: true },
  description: { type: String },
  lessonId: { type: String }, // Added lessonId field for lesson linking
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true,
  },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", QuizSchema);
