import express from "express";
import { fetchLesson } from "../controllers/lessonController.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { createLesson, getAllLessons, getLessonById, updateLesson, deleteLesson, getLessonForStudent, searchLessonsByHyphenName } from "../controllers/lessonController.js";
import Lesson from "../models/lessons.model.js";
import { get } from "mongoose";

const router = express.Router();

router.get("/fetch/:id",authMiddleware, fetchLesson);

// Student routes
router.get("/student/:id", authMiddleware, roleMiddleware('student'), getLessonForStudent);

// Search routes
router.get("/search", searchLessonsByHyphenName);

/**
 * @route   POST /api/lessons
 * @desc    Create a new lesson
 * @access  Admin
 */
router.post("/",authMiddleware, createLesson);

/**
 * @route   GET /api/lessons
 * @desc    Get all lessons
 * @access  Public
 */
router.get("/", getAllLessons);

/**
 * @route   GET /api/lessons/:id
 * @desc    Get a lesson by ID
 * @access  Public
 */
router.get("/:id", getLessonById);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update lesson
 * @access  Admin
 */
router.put("/:id", updateLesson);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete a lesson
 * @access  Admin
 */
router.delete("/:id", deleteLesson);


export default router;
