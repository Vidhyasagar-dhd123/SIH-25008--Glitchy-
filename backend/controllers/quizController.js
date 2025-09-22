import Quiz from "../models/quiz.model.js";
import { User } from "../models/user.model.js";

const addQuiz = async (req, res) => {
  try {
    const { title, description, module, lessonId, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: "Title and questions are required" });
    }

    // find creator user from req.user
    const user = await User.findOne({ email: req.user?.email });
    if (!user) {
      return res.status(400).json({ error: "Creator user not found" });
    }

    // slugify title to create quizId (hyphen-separated)
    const slugify = (str) =>
      String(str || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    let quizId = slugify(title);

    // ensure uniqueness: if exists, append timestamp
    const exists = await Quiz.findOne({ quizId });
    if (exists) {
      quizId = `${quizId}-${Date.now()}`;
    }

    const quiz = await Quiz.create({
      title,
      quizId,
      description,
      lessonId, // Add lessonId to the quiz creation
      module,
      createdBy: user._id,
      questions,
    });

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err)
  }
}

const getQuizByLessonId = async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log('Fetching quizzes for lessonId:', lessonId);
    
    // Try both approaches - first by lessonId field, then by module ObjectId
    let quizzes = await Quiz.find({ lessonId: lessonId })
      .populate("createdBy", "name email")
      .populate({
        path: "module",
        select: "title content lessonId",
        populate: {
          path: "module",
          select: "title description"
        }
      });

    // If no quizzes found by lessonId string, try by module ObjectId
    if (quizzes.length === 0) {
      quizzes = await Quiz.find({ module: lessonId })
        .populate("createdBy", "name email")
        .populate({
          path: "module",
          select: "title content lessonId",
          populate: {
            path: "module",
            select: "title description"
          }
        });
    }

    console.log(`Found ${quizzes.length} quizzes for lessonId: ${lessonId}`);

    res.json({
      success: true,
      data: quizzes,
      count: quizzes.length
    });
  } catch (err) {
    console.error("Error fetching quizzes by lesson ID:", err);
    res.status(500).json({ error: err.message });
  }
};

const getQuiz = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("createdBy", "name email")
      .populate({
        path: "module",
        select: "title content lessonId",
        populate: {
          path: "module",
          select: "title description"
        }
      })
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err)
  }
}

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate({
        path: "module",
        select: "title content lessonId",
        populate: {
          path: "module",
          select: "title description"
        }
      })
      .populate({
        path: "attempts",
        populate: { path: "student", select: "name email" },
      });

    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const updateQuiz =async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    res.json({ message: "Quiz updated successfully", quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const deleteQuizById =  async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // delete attempts linked to this quiz
    await Attempt.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();

    res.json({ message: "Quiz and its attempts deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const deleteQuiz = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }
  const { id } = req.params;

  try {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { addQuiz, updateQuiz, deleteQuiz, getQuiz, getQuizById, getQuizByLessonId, deleteQuizById};
