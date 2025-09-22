import express from "express";
import {
  updateUser,
  deleteUser,
  createStudent,
  createInstituteAdmin,
  getMyStudents,
  updateStudent,
  deleteStudent,
  createBulkStudents,
  getUserProfile
} from "../controllers/userController.js";
import roleMiddleware from "../middleware/role.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (legacy - consider removing for security)
router.post("/createStudent",authMiddleware, roleMiddleware("institute-admin"), createStudent);

// Admin only routes
router.post("/createInstituteAdmin", authMiddleware, roleMiddleware("admin"), createInstituteAdmin);

// General user routes
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

// Institute admin routes for student management
router.use(authMiddleware); // All routes below require authentication

// Profile route (for all authenticated users)
router.get("/profile", getUserProfile);

// Student management by institute admin
router.post("/institute/students", roleMiddleware("institute-admin"), createStudent);
router.get("/institute/students", roleMiddleware("institute-admin"), getMyStudents);
router.put("/institute/students/:id", roleMiddleware("institute-admin"), updateStudent);
router.delete("/institute/students/:id", roleMiddleware("institute-admin"), deleteStudent);
router.post("/institute/students/bulk", roleMiddleware("institute-admin"), createBulkStudents);

export default router;
