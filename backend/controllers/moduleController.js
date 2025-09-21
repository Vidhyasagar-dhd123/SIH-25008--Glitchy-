import Module from '../models/modules.model.js';
import Lesson from '../models/lessons.model.js';
import { Student } from '../models/user.model.js';

// Helper for consistent response format
const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};

// Simple logger helper
const log = {
    info: (...args) => console.info(new Date().toISOString(), '[moduleController]', ...args),
    debug: (...args) => console.debug(new Date().toISOString(), '[moduleController]', ...args),
    error: (...args) => console.error(new Date().toISOString(), '[moduleController]', ...args)
};

// Create a new module
export const createModule = async (req, res) => {
    const start = Date.now();
    log.info('createModule called');
    try {
        const { title, description, allowedDistricts, level } = req.body;
        log.debug('payload', { title: title?.slice(0, 100), level, allowedDistrictsCount: Array.isArray(allowedDistricts) ? allowedDistricts.length : 0, user: req.user?.id });

        // Enhanced input validation
        if (!title?.trim()) {
            log.info('Validation failed: missing title');
            return sendResponse(res, 400, false, 'Title is required');
        }

        if (level && !['beginner', 'intermediate', 'advanced'].includes(level)) {
            log.info('Validation failed: invalid level', level);
            return sendResponse(res, 400, false, 'Invalid level specified');
        }

        // Sanitize districts array
        const cleanDistricts = Array.isArray(allowedDistricts) 
            ? allowedDistricts.map(d => String(d).trim()).filter(Boolean)
            : [];

        const module = await Module.create({
            title: title.trim(),
            description: description?.trim() || '',
            allowedDistricts: cleanDistricts,
            level: level || 'beginner',
            createdBy: req.user.id
        });

        log.info('Module created', { id: module._id, title: module.title, createdBy: module.createdBy });
        log.debug('createModule finished', `elapsed=${Date.now()-start}ms`);
        return sendResponse(res, 201, true, 'Module created successfully', module);
    } catch (error) {
        log.error('Create module error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Get all modules
export const getAllModules = async (req, res) => {
    const start = Date.now();
    const { page = 1, limit = 10, search } = req.query;
    log.info('getAllModules called', { page, limit, search });
    try {
        const query = search 
            ? { title: { $regex: search, $options: 'i' } }
            : {};

        const modules = await Module.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Module.countDocuments(query);
        log.debug('getAllModules fetched', { count: modules.length, total, elapsed: `${Date.now()-start}ms` });

        return sendResponse(res, 200, true, 'Modules fetched successfully', {
            modules,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        log.error('Get modules error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Get module by ID
export const getModuleById = async (req, res) => {
    const start = Date.now();
    const id = req.params.id;
    log.info('getModuleById called', { id });
    try {
        const module = await Module.findById(id)
            .populate('createdBy', 'name email');

        if (!module) {
            log.info('Module not found', { id });
            return sendResponse(res, 404, false, 'Module not found');
        }

        log.debug('getModuleById success', { id, elapsed: `${Date.now()-start}ms` });
        return sendResponse(res, 200, true, 'Module fetched successfully', module);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            log.warn('Invalid ObjectId in getModuleById', { id, error: error.message });
            return sendResponse(res, 400, false, 'Invalid module ID');
        }
        log.error('Get module error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Get modules by level
export const getModulesByLevel = async (req, res) => {
    const start = Date.now();
    const { level } = req.params;
    const { page = 1, limit = 10 } = req.query;
    log.info('getModulesByLevel called', { level, page, limit });
    try {
        if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
            log.info('Invalid level specified', level);
            return sendResponse(res, 400, false, 'Invalid level specified');
        }

        const modules = await Module.find({ level })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Module.countDocuments({ level });

        log.debug('getModulesByLevel fetched', { count: modules.length, total, elapsed: `${Date.now()-start}ms` });
        return sendResponse(res, 200, true, 'Modules fetched successfully', {
            modules,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        log.error('Get modules by level error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Update module
export const updateModule = async (req, res) => {
    const start = Date.now();
    const { id } = req.params;
    const updates = req.body;
    log.info('updateModule called', { id, updatesSummary: Object.keys(updates), user: req.user?.id });

    try {
        if (updates.level && !['beginner', 'intermediate', 'advanced'].includes(updates.level)) {
            log.info('Invalid level in update', updates.level);
            return sendResponse(res, 400, false, 'Invalid level specified');
        }

        const module = await Module.findById(id);
        if (!module) {
            log.info('Module not found for update', { id });
            return sendResponse(res, 404, false, 'Module not found');
        }

        if (module.createdBy.toString() !== req.user.id) {
            log.warn('Unauthorized update attempt', { moduleId: id, user: req.user?.id });
            return sendResponse(res, 403, false, 'Not authorized to update this module');
        }

        if (updates.allowedDistricts) {
            updates.allowedDistricts = Array.isArray(updates.allowedDistricts)
                ? updates.allowedDistricts.map(d => d.trim()).filter(Boolean)
                : [];
        }

        const updatedModule = await Module.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        log.info('Module updated', { id, updatedBy: req.user?.id, elapsed: `${Date.now()-start}ms` });
        return sendResponse(res, 200, true, 'Module updated successfully', updatedModule);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            log.warn('Invalid ObjectId in updateModule', { id, error: error.message });
            return sendResponse(res, 400, false, 'Invalid module ID');
        }
        log.error('Update module error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Delete module
export const deleteModule = async (req, res) => {
    const start = Date.now();
    const { id } = req.params;
    log.info('deleteModule called', { id, user: req.user?.id });
    try {
        const module = await Module.findById(id);
        if (!module) {
            log.info('Module not found for delete', { id });
            return sendResponse(res, 404, false, 'Module not found');
        }

        if (module.createdBy.toString() !== req.user.id) {
            log.warn('Unauthorized delete attempt', { moduleId: id, user: req.user?.id });
            return sendResponse(res, 403, false, 'Not authorized to delete this module');
        }

        await Module.findByIdAndDelete(id);
        log.info('Module deleted', { id, deletedBy: req.user?.id, elapsed: `${Date.now()-start}ms` });
        return sendResponse(res, 200, true, 'Module deleted successfully');
    } catch (error) {
        if (error.kind === 'ObjectId') {
            log.warn('Invalid ObjectId in deleteModule', { id, error: error.message });
            return sendResponse(res, 400, false, 'Invalid module ID');
        }
        log.error('Delete module error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Get modules with lessons for students
export const getModulesForStudent = async (req, res) => {
    const start = Date.now();
    const { page = 1, limit = 10, search, level } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    log.info('getModulesForStudent called', { page, limit, search, level, userId, userRole });
    
    try {
        // Verify user is a student
        if (userRole !== 'student') {
            log.warn('Non-student trying to access student modules', { userId, userRole });
            return sendResponse(res, 403, false, 'Access denied. Student role required.');
        }

        // Build query
        const query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
            query.level = level;
        }

        // Get student details to filter by district if needed
        const student = await Student.findById(userId);
        if (student && student.institute) {
            // Future: Add district-based filtering if needed
            // For now, show all modules to all students
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get modules with their lessons
        const modules = await Module.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get lessons for each module
        const modulesWithLessons = await Promise.all(
            modules.map(async (module) => {
                const lessons = await Lesson.find({ module: module._id })
                    .select('title lessonId createdAt')
                    .sort({ createdAt: 1 });
                
                return {
                    ...module.toObject(),
                    lessons: lessons,
                    lessonCount: lessons.length
                };
            })
        );

        const total = await Module.countDocuments(query);
        
        log.debug('getModulesForStudent fetched', { 
            count: modulesWithLessons.length, 
            total, 
            elapsed: `${Date.now()-start}ms` 
        });

        return sendResponse(res, 200, true, 'Modules fetched successfully', {
            modules: modulesWithLessons,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        log.error('Get modules for student error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Get single module with lessons for student
export const getModuleWithLessonsForStudent = async (req, res) => {
    const start = Date.now();
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    log.info('getModuleWithLessonsForStudent called', { id, userId, userRole });
    
    try {
        // Verify user is a student
        if (userRole !== 'student') {
            log.warn('Non-student trying to access student module', { userId, userRole });
            return sendResponse(res, 403, false, 'Access denied. Student role required.');
        }

        // Get module
        const module = await Module.findById(id)
            .populate('createdBy', 'name email');

        if (!module) {
            log.info('Module not found for student', { id });
            return sendResponse(res, 404, false, 'Module not found');
        }

        // Get lessons for this module
        const lessons = await Lesson.find({ module: id })
            .select('title content lessonId createdAt quiz')
            .populate('quiz', 'title description')
            .sort({ createdAt: 1 });

        const moduleWithLessons = {
            ...module.toObject(),
            lessons: lessons,
            lessonCount: lessons.length
        };

        log.debug('getModuleWithLessonsForStudent success', { 
            id, 
            lessonCount: lessons.length,
            elapsed: `${Date.now()-start}ms` 
        });

        return sendResponse(res, 200, true, 'Module with lessons fetched successfully', moduleWithLessons);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            log.warn('Invalid ObjectId in getModuleWithLessonsForStudent', { id, error: error.message });
            return sendResponse(res, 400, false, 'Invalid module ID');
        }
        log.error('Get module with lessons for student error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};

// Get lessons by module for student
export const getLessonsByModuleForStudent = async (req, res) => {
    const start = Date.now();
    const { moduleId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    log.info('getLessonsByModuleForStudent called', { moduleId, page, limit, userId, userRole });
    
    try {
        // Verify user is a student
        if (userRole !== 'student') {
            log.warn('Non-student trying to access module lessons', { userId, userRole });
            return sendResponse(res, 403, false, 'Access denied. Student role required.');
        }

        // Verify module exists
        const module = await Module.findById(moduleId);
        if (!module) {
            log.info('Module not found for lessons', { moduleId });
            return sendResponse(res, 404, false, 'Module not found');
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get lessons for this module
        const lessons = await Lesson.find({ module: moduleId })
            .select('title content lessonId createdAt quiz')
            .populate('module', 'title description level')
            .populate('quiz', 'title description')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lesson.countDocuments({ module: moduleId });

        log.debug('getLessonsByModuleForStudent fetched', { 
            moduleId,
            count: lessons.length, 
            total,
            elapsed: `${Date.now()-start}ms` 
        });

        return sendResponse(res, 200, true, 'Lessons fetched successfully', {
            lessons: lessons,
            module: {
                _id: module._id,
                title: module.title,
                description: module.description,
                level: module.level
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            log.warn('Invalid ObjectId in getLessonsByModuleForStudent', { moduleId, error: error.message });
            return sendResponse(res, 400, false, 'Invalid module ID');
        }
        log.error('Get lessons by module for student error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
