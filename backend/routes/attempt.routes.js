import express from "express";
import { 
  startAttempt, 
  submitAttempt, 
  getAttempt, 
  getQuizAttempts, 
  getUserAttempts 
} from "../controllers/attemptController.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/attempts/start/:quizId
 * @desc    Start a new quiz attempt
 * @access  Student
 */
router.post("/start/:quizId", authMiddleware, roleMiddleware('student'), startAttempt);

/**
 * @route   POST /api/attempts/submit/:attemptId
 * @desc    Submit quiz answers and complete attempt
 * @access  Student (own attempts only)
 */
router.post("/submit/:attemptId", authMiddleware, roleMiddleware('student'), submitAttempt);

/**
 * @route   GET /api/attempts/:attemptId
 * @desc    Get attempt details
 * @access  Student (own attempts) or Admin
 */
router.get("/:attemptId", authMiddleware, getAttempt);

/**
 * @route   GET /api/attempts/quiz/:quizId
 * @desc    Get all attempts for a specific quiz by the authenticated user
 * @access  Student (own attempts only)
 */
router.get("/quiz/:quizId", authMiddleware, roleMiddleware('student'), getQuizAttempts);

/**
 * @route   GET /api/attempts/user/my-attempts
 * @desc    Get all attempts by the authenticated user
 * @access  Student
 */
router.get("/user/my-attempts", authMiddleware, roleMiddleware('student'), getUserAttempts);

export default router;