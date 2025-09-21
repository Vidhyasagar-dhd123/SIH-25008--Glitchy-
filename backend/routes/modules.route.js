import express from 'express';
import { 
    createModule,
    getAllModules,
    getModuleById,
    updateModule,
    deleteModule,
    getModulesByLevel,
    getModulesForStudent,
    getModuleWithLessonsForStudent,
    getLessonsByModuleForStudent
} from '../controllers/moduleController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllModules);
router.get('/level/:level', getModulesByLevel);
router.get('/:id', getModuleById);

// Student routes (authentication required)
router.get('/student/my-modules', authMiddleware, roleMiddleware('student'), getModulesForStudent);
router.get('/student/:id/with-lessons', authMiddleware, roleMiddleware('student'), getModuleWithLessonsForStudent);
router.get('/student/:moduleId/lessons', authMiddleware, roleMiddleware('student'), getLessonsByModuleForStudent);

// Protected routes (Admin only)
router.post('/', authMiddleware, roleMiddleware('admin'), createModule);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateModule);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteModule);

export default router;
