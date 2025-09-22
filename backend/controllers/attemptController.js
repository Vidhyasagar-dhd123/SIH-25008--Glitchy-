import Attempt from "../models/attempts.model.js";
import Quiz from "../models/quiz.model.js";
import { User } from "../models/user.model.js";

// Simple logger helper for attempts
const log = {
  info: (...args) => console.info(new Date().toISOString(), '[attemptController]', ...args),
  debug: (...args) => console.debug(new Date().toISOString(), '[attemptController]', ...args),
  error: (...args) => console.error(new Date().toISOString(), '[attemptController]', ...args)
};

// Start a new quiz attempt
const startAttempt = async (req, res) => {
  const start = Date.now();
  const { quizId } = req.params;
  const user = req.user;
  
  log.info('startAttempt called', { quizId, user: user?.id, userRole: user?.role });
  
  try {
    // Verify user is authenticated
    if (!user || !user.id) {
      log.warn('Unauthorized attempt to start quiz', { quizId });
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Find the quiz
    const quiz = await Quiz.findById(quizId).populate('module', 'title');
    if (!quiz) {
      log.info('Quiz not found', { quizId });
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Check if user already has an ongoing attempt for this quiz
    const existingAttempt = await Attempt.findOne({
      quiz: quizId,
      student: user.id,
      completedAt: { $exists: false }
    });

    if (existingAttempt) {
      log.info('Returning existing ongoing attempt', { 
        attemptId: existingAttempt._id, 
        quizId, 
        student: user.id 
      });
      return res.json({
        success: true,
        message: 'Ongoing attempt found',
        data: {
          attemptId: existingAttempt._id,
          quiz: quiz,
          startedAt: existingAttempt.startedAt,
          totalPoints: existingAttempt.totalPoints
        }
      });
    }

    // Create new attempt
    const attempt = await Attempt.create({
      quiz: quizId,
      student: user.id,
      answers: [],
      score: 0,
      totalPoints,
      startedAt: new Date()
    });

    log.info('Quiz attempt started', { 
      attemptId: attempt._id, 
      quizId, 
      student: user.id, 
      elapsed: `${Date.now()-start}ms` 
    });

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started successfully',
      data: {
        attemptId: attempt._id,
        quiz: quiz,
        startedAt: attempt.startedAt,
        totalPoints: attempt.totalPoints
      }
    });

  } catch (err) {
    log.error('startAttempt error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Submit quiz answers and complete attempt
const submitAttempt = async (req, res) => {
  const start = Date.now();
  const { attemptId } = req.params;
  const { answers } = req.body;
  const user = req.user;

  log.info('submitAttempt called', { attemptId, user: user?.id, answersCount: answers?.length });

  try {
    // Verify user is authenticated
    if (!user || !user.id) {
      log.warn('Unauthorized attempt to submit quiz', { attemptId });
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate answers format
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }

    // Find the attempt
    const attempt = await Attempt.findById(attemptId)
      .populate({
        path: 'quiz',
        populate: {
          path: 'module',
          select: 'title'
        }
      });

    if (!attempt) {
      log.info('Attempt not found', { attemptId });
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Verify the attempt belongs to the authenticated user
    if (attempt.student.toString() !== user.id) {
      log.warn('Unauthorized attempt access', { attemptId, student: attempt.student, user: user.id });
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if already completed
    if (attempt.completedAt) {
      log.info('Attempt already completed', { attemptId });
      return res.status(400).json({ error: 'Attempt already completed' });
    }

    // Grade the answers
    let totalScore = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const { questionId, selectedOption } = answer;
      
      // Find the question in the quiz
      const question = attempt.quiz.questions.find(q => q._id.toString() === questionId);
      
      if (!question) {
        log.warn('Question not found in quiz', { questionId, quizId: attempt.quiz._id });
        continue;
      }

      // Check if answer is correct
      const isCorrect = question.correctOption === selectedOption;
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      
      totalScore += pointsEarned;

      gradedAnswers.push({
        questionId,
        selectedOption,
        isCorrect,
        pointsEarned
      });
    }

    // Calculate completion time
    const completedAt = new Date();
    const duration = Math.floor((completedAt - attempt.startedAt) / 1000); // in seconds

    // Update the attempt
    await Attempt.findByIdAndUpdate(attemptId, {
      answers: gradedAnswers,
      score: totalScore,
      completedAt,
      duration
    });

    // Calculate percentage score
    const percentage = attempt.totalPoints > 0 ? Math.round((totalScore / attempt.totalPoints) * 100) : 0;

    log.info('Quiz attempt completed', { 
      attemptId, 
      score: totalScore, 
      totalPoints: attempt.totalPoints,
      percentage,
      duration,
      elapsed: `${Date.now()-start}ms`
    });

    res.json({
      success: true,
      message: 'Quiz attempt submitted successfully',
      data: {
        attemptId,
        score: totalScore,
        totalPoints: attempt.totalPoints,
        percentage,
        correctAnswers: gradedAnswers.filter(a => a.isCorrect).length,
        totalQuestions: gradedAnswers.length,
        duration,
        completedAt,
        quiz: {
          title: attempt.quiz.title,
          module: attempt.quiz.module
        }
      }
    });

  } catch (err) {
    log.error('submitAttempt error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get attempt details
const getAttempt = async (req, res) => {
  const start = Date.now();
  const { attemptId } = req.params;
  const user = req.user;

  log.info('getAttempt called', { attemptId, user: user?.id });

  try {
    // Verify user is authenticated
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Find the attempt
    const attempt = await Attempt.findById(attemptId)
      .populate({
        path: 'quiz',
        populate: {
          path: 'module',
          select: 'title'
        }
      })
      .populate('student', 'name email');

    if (!attempt) {
      log.info('Attempt not found', { attemptId });
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Verify the attempt belongs to the authenticated user (or user is admin)
    if (attempt.student._id.toString() !== user.id && user.role !== 'admin') {
      log.warn('Unauthorized attempt access', { attemptId, student: attempt.student._id, user: user.id });
      return res.status(403).json({ error: 'Access denied' });
    }

    const percentage = attempt.totalPoints > 0 ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;

    log.debug('getAttempt success', { attemptId, elapsed: `${Date.now()-start}ms` });

    res.json({
      success: true,
      data: {
        ...attempt.toObject(),
        percentage,
        isCompleted: !!attempt.completedAt
      }
    });

  } catch (err) {
    log.error('getAttempt error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's attempts for a specific quiz
const getQuizAttempts = async (req, res) => {
  const start = Date.now();
  const { quizId } = req.params;
  const user = req.user;

  log.info('getQuizAttempts called', { quizId, user: user?.id });

  try {
    // Verify user is authenticated
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Find attempts for this quiz by this user
    const attempts = await Attempt.find({
      quiz: quizId,
      student: user.id
    })
    .populate('quiz', 'title')
    .sort({ startedAt: -1 });

    const formattedAttempts = attempts.map(attempt => {
      const percentage = attempt.totalPoints > 0 ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;
      return {
        _id: attempt._id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        duration: attempt.duration,
        isCompleted: !!attempt.completedAt
      };
    });

    log.debug('getQuizAttempts success', { 
      quizId, 
      attemptsCount: attempts.length, 
      elapsed: `${Date.now()-start}ms` 
    });

    res.json({
      success: true,
      data: formattedAttempts,
      count: attempts.length
    });

  } catch (err) {
    log.error('getQuizAttempts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all attempts by user
const getUserAttempts = async (req, res) => {
  const start = Date.now();
  const user = req.user;

  log.info('getUserAttempts called', { user: user?.id });

  try {
    // Verify user is authenticated
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Find all attempts by this user
    const attempts = await Attempt.find({ student: user.id })
      .populate({
        path: 'quiz',
        select: 'title',
        populate: {
          path: 'module',
          select: 'title'
        }
      })
      .sort({ startedAt: -1 });

    const formattedAttempts = attempts.map(attempt => {
      const percentage = attempt.totalPoints > 0 ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;
      return {
        _id: attempt._id,
        quiz: attempt.quiz,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        duration: attempt.duration,
        isCompleted: !!attempt.completedAt
      };
    });

    log.debug('getUserAttempts success', { 
      attemptsCount: attempts.length, 
      elapsed: `${Date.now()-start}ms` 
    });

    res.json({
      success: true,
      data: formattedAttempts,
      count: attempts.length
    });

  } catch (err) {
    log.error('getUserAttempts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { 
  startAttempt, 
  submitAttempt, 
  getAttempt, 
  getQuizAttempts, 
  getUserAttempts 
};