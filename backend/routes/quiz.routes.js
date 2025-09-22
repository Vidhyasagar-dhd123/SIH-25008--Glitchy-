import express from "express";
import Quiz from "../models/quiz.model.js";
import Attempt from "../models/attempts.model.js";
import { addQuiz, updateQuiz, deleteQuiz, getQuiz, getQuizById, getQuizByLessonId, deleteQuizById } from "../controllers/quizController.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";


const router = express.Router();

/**
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Institute-admin only (add auth middleware later)
 */
router.post("/",authMiddleware,roleMiddleware("admin"), addQuiz);

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes
 */
router.get("/",authMiddleware, getQuiz);

/**
 * @route   GET /api/quiz/lesson/:lessonId
 * @desc    Get quizzes by lesson ID
 */
router.get("/lesson/:lessonId", authMiddleware, getQuizByLessonId);

/**
 * @route   GET /api/quiz/:id
 * @desc    Get quiz by ID
 */
router.get("/:id",authMiddleware, getQuizById);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update a quiz
 */
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateQuiz );

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete a quiz and its attempts
 */
router.delete("/:id",authMiddleware,roleMiddleware("admin"),deleteQuizById);

router.delete("/",authMiddleware,roleMiddleware("admin"), deleteQuiz );

export default router;
