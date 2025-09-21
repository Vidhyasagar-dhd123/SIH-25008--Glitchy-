import { getLesson } from "../services/lesson.services.js";
import Lesson from "../models/lessons.model.js";
import Module from "../models/modules.model.js"; // added import

// Simple logger helper for lessons
const log = {
  info: (...args) => console.info(new Date().toISOString(), '[lessonController]', ...args),
  debug: (...args) => console.debug(new Date().toISOString(), '[lessonController]', ...args),
  error: (...args) => console.error(new Date().toISOString(), '[lessonController]', ...args)
};

const fetchLesson = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const user = req.user;
  log.info('fetchLesson called', { id, user: user?.id, userRole: user?.role });
  const studentId = user && user.role === "student" ? user.id : null;

  try {
    const lesson = await getLesson(id, studentId);
    log.debug('fetchLesson success', { id, elapsed: `${Date.now()-start}ms` });
    res.json(lesson);
  } catch (error) {
    log.error('fetchLesson error:', error);
    res.status(400).json({ message: error.message });
  }
};

const createLesson = async (req, res) => {
  const start = Date.now();
  const user = req.user;
  log.info('createLesson called', { user: user?.id, userRole: user?.role });
  try {
    const { title, content, module } = req.body;
    // prefer authenticated user as creator
    const createdByFromUser = user?.id;
    if (!createdByFromUser && req.body.createdBy) {
      // backward compatibility fallback (shouldn't be used in normal flow)
      log.warn('No authenticated user on request; falling back to createdBy from body', { fallbackUsed: true });
    }
    const createdBy = createdByFromUser || req.body.createdBy;

    log.debug('createLesson payload summary', { title: title?.slice(0, 100), module, createdBy });

    // require title and module; createdBy will come from req.user in normal flow
    if (!title || !module) {
      log.info('createLesson validation failed - missing required fields');
      return res.status(400).json({ error: "title and module are required" });
    }

    if (!createdBy) {
      log.info('createLesson validation failed - missing creator information');
      return res.status(400).json({ error: "creator information missing (authenticate request)" });
    }

    // Fetch module document to obtain module name/title
    const moduleDoc = await Module.findById(module).select('title');
    if (!moduleDoc) {
      log.info('createLesson failed - module not found', { module });
      return res.status(400).json({ error: "Module not found" });
    }

    // slugify helper
    const slugify = (str) =>
      String(str || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Build lessonId from module title + lesson title
    let lessonId = `${slugify(moduleDoc.title)}-${slugify(title)}`;

    // Ensure uniqueness: if exists append timestamp
    const exists = await Lesson.findOne({ lessonId });
    if (exists) {
      lessonId = `${lessonId}-${Date.now()}`;
      log.warn('LessonId collision, appended timestamp', { original: `${slugify(moduleDoc.title)}-${slugify(title)}`, lessonId });
    }

    const lesson = await Lesson.create({ title, content, module, createdBy, lessonId });
    log.info('Lesson created', { lessonId: lesson.lessonId, lessonId_db: lesson._id, createdBy, elapsed: `${Date.now()-start}ms` });
    res.status(201).json({ message: "Lesson created successfully", lesson });
  } catch (err) {
    log.error('createLesson error:', err);
    res.status(500).json({ error: err.message });
    console.log(err)
  }
}

const getAllLessons =  async (req, res) => {
  const start = Date.now();
  log.info('getAllLessons called', { query: req.query });
  try {
    // Build query object
    let query = {};
    
    // If search parameter is provided, search by lessonId (hyphen-separated name)
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      // Search by lessonId (exact match or partial match)
      query.$or = [
        { lessonId: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } }
      ];
      log.debug('Search query applied', { searchTerm, query });
    }
    
    // If moduleId is provided, filter by module
    if (req.query.moduleId) {
      query.module = req.query.moduleId;
    }

    const lessons = await Lesson.find(query)
      .populate("module", "name description")
      .populate("createdBy", "name email role");

    log.debug('getAllLessons fetched', { count: lessons.length, searchApplied: !!req.query.search, elapsed: `${Date.now()-start}ms` });
    res.json(lessons);
  } catch (err) {
    log.error('getAllLessons error:', err);
    res.status(500).json({ error: err.message });
  }
}

const getLessonById =async (req, res) => {
  const start = Date.now();
  const id = req.params.id;
  log.info('getLessonById called', { id });
  try {
    const lesson = await Lesson.findById(id)
      .populate("module", "name description")
      .populate("createdBy", "name email role");

    if (!lesson) {
      log.info('getLessonById not found', { id });
      return res.status(404).json({ error: "Lesson not found" });
    }

    log.debug('getLessonById success', { id, elapsed: `${Date.now()-start}ms` });
    res.json(lesson);
  } catch (err) {
    log.error('getLessonById error:', err);
    res.status(500).json({ error: err.message });
  }
}

const updateLesson =async (req, res) => {
  const start = Date.now();
  const id = req.params.id;
  log.info('updateLesson called', { id, user: req.user?.id });
  try {
    const { title, content, module } = req.body;
    log.debug('updateLesson payload summary', { title: title?.slice(0,100), module });

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { title, content, module },
      { new: true }
    )
      .populate("module", "name description")
      .populate("createdBy", "name email role");

    if (!lesson) {
      log.info('updateLesson not found', { id });
      return res.status(404).json({ error: "Lesson not found" });
    }

    log.info('Lesson updated', { id, elapsed: `${Date.now()-start}ms` });
    res.json({ message: "Lesson updated successfully", lesson });
  } catch (err) {
    log.error('updateLesson error:', err);
    res.status(500).json({ error: err.message });
  }
}

const deleteLesson = async (req, res) => {
  const start = Date.now();
  const id = req.params.id;
  log.info('deleteLesson called', { id, user: req.user?.id });
  try {
    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) {
      log.info('deleteLesson not found', { id });
      return res.status(404).json({ error: "Lesson not found" });
    }

    log.info('Lesson deleted', { id, elapsed: `${Date.now()-start}ms` });
    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    log.error('deleteLesson error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get lesson for student with additional context
const getLessonForStudent = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  log.info('getLessonForStudent called', { id, userId, userRole });
  
  try {
    // Verify user is a student
    if (userRole !== 'student') {
      log.warn('Non-student trying to access student lesson', { userId, userRole });
      return res.status(403).json({ error: 'Access denied. Student role required.' });
    }

    const lesson = await Lesson.findById(id)
      .populate('module', 'title description level')
      .populate('createdBy', 'name email')
      .populate('quiz', 'title description');

    if (!lesson) {
      log.info('getLessonForStudent not found', { id });
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get other lessons in the same module for navigation
    const siblingLessons = await Lesson.find({ 
      module: lesson.module._id,
      _id: { $ne: id }
    })
      .select('title lessonId createdAt')
      .sort({ createdAt: 1 });

    const lessonWithContext = {
      ...lesson.toObject(),
      siblingLessons: siblingLessons,
      moduleInfo: {
        totalLessons: siblingLessons.length + 1,
        moduleId: lesson.module._id
      }
    };

    log.debug('getLessonForStudent success', { id, elapsed: `${Date.now()-start}ms` });
    res.json({
      success: true,
      message: 'Lesson fetched successfully',
      data: lessonWithContext
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      log.warn('Invalid ObjectId in getLessonForStudent', { id, error: err.message });
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }
    log.error('getLessonForStudent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const searchLessonsByHyphenName = async (req, res) => {
  const start = Date.now();
  const { searchTerm } = req.query;
  log.info('searchLessonsByHyphenName called', { searchTerm });
  
  try {
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // Convert search term to hyphen-separated format if it isn't already
    const hyphenatedTerm = searchTerm.toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove special characters except hyphens

    // Search for lessons by lessonId pattern
    const query = {
      lessonId: { $regex: hyphenatedTerm, $options: 'i' }
    };

    const lessons = await Lesson.find(query)
      .populate("module", "name description")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    log.debug('searchLessonsByHyphenName success', { 
      searchTerm, 
      hyphenatedTerm, 
      resultCount: lessons.length, 
      elapsed: `${Date.now()-start}ms` 
    });

    res.json({
      success: true,
      message: `Found ${lessons.length} lessons matching "${searchTerm}"`,
      data: lessons,
      searchTerm: hyphenatedTerm
    });

  } catch (err) {
    log.error('searchLessonsByHyphenName error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { fetchLesson, createLesson, getAllLessons, getLessonById, updateLesson, deleteLesson, getLessonForStudent, searchLessonsByHyphenName };


