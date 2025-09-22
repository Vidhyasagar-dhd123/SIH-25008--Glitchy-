
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, BookOpen, Clock, User, ArrowLeft, CheckCircle, Play, Target, Trophy } from "lucide-react";

const ModulesRead = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [expandedModule, setExpandedModule] = useState(null);
    const [lessonLoading, setLessonLoading] = useState({});
    const [moduleLessons, setModuleLessons] = useState({});
    const [viewingLesson, setViewingLesson] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [lessonContentLoading, setLessonContentLoading] = useState(false);
    const [enhancingLessons, setEnhancingLessons] = useState({});
    const [searchMode, setSearchMode] = useState('modules'); // 'modules' or 'lessons'
    const [lessonSearchResults, setLessonSearchResults] = useState([]);
    const [lessonSearchLoading, setLessonSearchLoading] = useState(false);
    
    // Quiz attempt states
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentAttempt, setCurrentAttempt] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [quizResults, setQuizResults] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        if (searchMode === 'modules') {
            fetchModules();
        } else if (searchMode === 'lessons' && searchTerm.trim()) {
            searchLessons();
        } else if (searchMode === 'lessons' && !searchTerm.trim()) {
            setLessonSearchResults([]);
        }
    }, [searchTerm, selectedLevel, searchMode]);

    const fetchLessonQuizzes = async (lessonId) => {
        try {
            console.log('Fetching quizzes for lessonId:', lessonId);
            
            const token = localStorage.getItem('token');
            const headers = {
                "Content-Type": "application/json",
            };
            
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:3000/api/quiz/lesson/${lessonId}`, {
                method: "GET",
                headers,
                mode: "cors",
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Quiz fetch response for lesson', lessonId, ':', result);
                const quizzes = result.data || [];
                console.log(`Found ${quizzes.length} quizzes for lesson ${lessonId}`);
                return quizzes;
            } else {
                const errorData = await response.json();
                console.warn(`Failed to fetch quizzes for lesson ${lessonId}:`, errorData);
                return [];
            }
        } catch (error) {
            console.warn(`Error fetching quizzes for lesson ${lessonId}:`, error);
            return [];
        }
    };

    // Test function to create a mock quiz for debugging
    const testQuizModal = () => {
        const mockQuiz = {
            _id: "test-quiz-id",
            title: "Test Fire Safety Quiz",
            description: "A test quiz to verify modal functionality",
            questions: [
                {
                    _id: "q1",
                    text: "What is the first thing to do in case of fire?",
                    options: ["Run away", "Call emergency services", "Try to put it out"],
                    correctOption: 1,
                    points: 1
                },
                {
                    _id: "q2", 
                    text: "What should you do if your clothes catch fire?",
                    options: ["Run", "Stop, Drop, and Roll", "Jump in water"],
                    correctOption: 1,
                    points: 1
                }
            ]
        };

        const mockAttempt = {
            attemptId: "test-attempt-id",
            totalPoints: 2
        };

        setCurrentQuiz(mockQuiz);
        setCurrentAttempt(mockAttempt);
        setQuizAnswers({});
        setQuizResults(null);
        setShowQuizModal(true);
        setError("");
    };

    const startQuizAttempt = async (quiz) => {
        try {
            console.log('Starting quiz attempt with quiz data:', quiz);
            
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('role');
            
            if (!token) {
                setError("Please log in to take quizzes");
                return;
            }

            if (userRole !== 'student') {
                setError("Only students can take quizzes");
                return;
            }

            // Use quiz._id or quizId depending on the structure
            const quizId = quiz._id || quiz.quizId;
            console.log('Using quiz ID:', quizId);

            if (!quizId) {
                setError("Quiz ID not found");
                console.error('Quiz object missing ID:', quiz);
                return;
            }

            const response = await fetch(`http://localhost:3000/api/attempts/start/${quizId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();
            console.log('Start quiz attempt response:', result);

            if (response.ok && result.success) {
                setCurrentQuiz(result.data.quiz);
                setCurrentAttempt(result.data);
                setQuizAnswers({});
                setQuizResults(null);
                setShowQuizModal(true);
                setError(""); // Clear any previous errors
            } else {
                setError(result.message || "Failed to start quiz attempt");
                console.error('Failed to start quiz attempt:', result);
            }
        } catch (error) {
            console.error("Error starting quiz attempt:", error);
            setError("Error starting quiz attempt: " + error.message);
        }
    };

    const handleAnswerChange = (questionId, selectedOption) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const submitQuizAttempt = async () => {
        if (!currentAttempt || !currentQuiz) return;

        // Check if all questions are answered
        const unansweredQuestions = currentQuiz.questions.filter(q => 
            quizAnswers[q._id] === undefined || quizAnswers[q._id] === null
        );

        if (unansweredQuestions.length > 0) {
            setError(`Please answer all questions. ${unansweredQuestions.length} questions remaining.`);
            return;
        }

        setSubmittingQuiz(true);
        setError("");

        try {
            const token = localStorage.getItem('token');
            
            // Format answers for submission
            const formattedAnswers = currentQuiz.questions.map(question => ({
                questionId: question._id,
                selectedOption: quizAnswers[question._id]
            }));

            const response = await fetch(`http://localhost:3000/api/attempts/submit/${currentAttempt.attemptId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    answers: formattedAnswers
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setQuizResults(result.data);
            } else {
                setError(result.message || "Failed to submit quiz");
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            setError("Error submitting quiz");
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const closeQuizModal = () => {
        setShowQuizModal(false);
        setCurrentQuiz(null);
        setCurrentAttempt(null);
        setQuizAnswers({});
        setQuizResults(null);
        setSubmittingQuiz(false);
        setError("");
    };

    const searchLessons = async () => {
        try {
            setLessonSearchLoading(true);
            setError("");
            
            const token = localStorage.getItem('token');
            const headers = {
                "Content-Type": "application/json",
            };
            
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            // Convert search term to hyphen-separated format
            const hyphenatedSearch = searchTerm.toLowerCase()
                .replace(/\s+/g, '-')  // Replace spaces with hyphens
                .replace(/[^a-z0-9-]/g, ''); // Remove special characters except hyphens

            const response = await fetch(
                `http://localhost:3000/api/lessons/search?searchTerm=${encodeURIComponent(hyphenatedSearch)}`, 
                {
                    method: "GET",
                    headers,
                    mode: "cors",
                }
            );
            
            const json = await response.json();
            
            if (!response.ok) {
                throw new Error(json.message || `Failed to search lessons (${response.status})`);
            }
            
            console.log("Lesson search results:", json);
            const searchResults = json.data || [];
            
            // Enhance search results with quizzes
            const enhancedSearchResults = await Promise.all(
                searchResults.map(async (lesson) => {
                    const quizzes = await fetchLessonQuizzes(lesson._id);
                    return {
                        ...lesson,
                        quizzes: quizzes
                    };
                })
            );
            
            setLessonSearchResults(enhancedSearchResults);
            
        } catch (err) {
            console.error("Error searching lessons:", err);
            setError(`Failed to search lessons: ${err.message}`);
            setLessonSearchResults([]);
        } finally {
            setLessonSearchLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            setLoading(true);
            setError("");
            
            // Get auth token
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole') || 'guest';
            
            // Build URL with query parameters
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedLevel) params.append('level', selectedLevel);
            params.append('page', '1');
            params.append('limit', '20');
            
            // Use student-specific endpoint if user is a student
            const endpoint = userRole === 'student' 
                ? `http://localhost:3000/api/modules/student/my-modules?${params}`
                : `http://localhost:3000/api/modules?${params}`;
            
            const headers = {
                "Content-Type": "application/json",
            };
            
            // Add auth header if token exists
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(endpoint, {
                method: "GET",
                headers,
                mode: "cors",
            });
            
            const json = await response.json();
            
            if (!response.ok) {
                throw new Error(json.message || `Failed to fetch modules (${response.status})`);
            }
            
            console.log("Modules fetched:", json?.data?.modules);
            setModules(json?.data?.modules || []);
        } catch (err) {
            console.error("Error fetching modules:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchModuleLessons = async (moduleId) => {
        try {
            setLessonLoading(prev => ({ ...prev, [moduleId]: true }));
            setEnhancingLessons(prev => ({ ...prev, [moduleId]: false }));
            
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('role') || 'guest';
            
            // First get lessons from module endpoint
            const moduleEndpoint = userRole === 'student' 
                ? `http://localhost:3000/api/modules/student/${moduleId}/lessons`
                : `http://localhost:3000/api/lessons?moduleId=${moduleId}`;
            
            const headers = {
                "Content-Type": "application/json",
            };
            
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const moduleResponse = await fetch(moduleEndpoint, {
                method: "GET",
                headers,
                mode: "cors",
            });
            
            const moduleJson = await moduleResponse.json();
            
            if (!moduleResponse.ok) {
                throw new Error(moduleJson.message || `Failed to fetch lessons (${moduleResponse.status})`);
            }
            
            // Get the basic lesson list
            let lessons = moduleJson?.data?.lessons || moduleJson?.lessons || [];
            
            // Show basic lessons first, then enhance them
            setModuleLessons(prev => ({ 
                ...prev, 
                [moduleId]: lessons
            }));
            setLessonLoading(prev => ({ ...prev, [moduleId]: false }));
            
            // Now enhance lessons with detailed data
            setEnhancingLessons(prev => ({ ...prev, [moduleId]: true }));
            
            const enhancedLessons = await Promise.all(
                lessons.map(async (lesson) => {
                    try {
                        const lessonDetailEndpoint = userRole === 'student' 
                            ? `http://localhost:3000/api/lessons/student/${lesson._id}`
                            : `http://localhost:3000/api/lessons/${lesson._id}`;
                        
                        const lessonResponse = await fetch(lessonDetailEndpoint, {
                            method: "GET",
                            headers,
                            mode: "cors",
                        });
                        
                        let actualLessonData = lesson; // fallback to basic lesson data
                        
                        if (lessonResponse.ok) {
                            const lessonDetail = await lessonResponse.json();
                            console.log("Raw lesson detail response:", lessonDetail);
                            
                            // Handle nested data structure - extract from data property if it exists
                            actualLessonData = lessonDetail.data || lessonDetail;
                            console.log("Processed lesson data:", actualLessonData);
                        } else {
                            console.warn(`Failed to fetch details for lesson ${lesson._id}`);
                        }
                        
                        // Fetch quizzes for this lesson
                        const quizzes = await fetchLessonQuizzes(lesson._id);
                        
                        // Merge basic lesson data with detailed data and quizzes
                        return {
                            _id: lesson._id || actualLessonData._id,
                            title: actualLessonData.title || lesson.title,
                            description: actualLessonData.description || lesson.description,
                            content: actualLessonData.content,
                            duration: actualLessonData.duration || lesson.duration,
                            level: actualLessonData.level || lesson.level,
                            lessonId: actualLessonData.lessonId || lesson.lessonId,
                            quiz: actualLessonData.quiz,
                            quizzes: quizzes, // Add related quizzes
                            createdBy: actualLessonData.createdBy,
                            module: actualLessonData.module,
                            completed: actualLessonData.completed || lesson.completed,
                            createdAt: actualLessonData.createdAt || lesson.createdAt,
                            updatedAt: actualLessonData.updatedAt || lesson.updatedAt,
                            // Include any additional fields from the response
                            siblingLessons: actualLessonData.siblingLessons,
                            moduleInfo: actualLessonData.moduleInfo
                        };
                    } catch (error) {
                        console.warn(`Error fetching details for lesson ${lesson._id}:`, error);
                        // Still try to fetch quizzes even if lesson details fail
                        const quizzes = await fetchLessonQuizzes(lesson._id);
                        return {
                            ...lesson,
                            quizzes: quizzes
                        };
                    }
                })
            );
            
            console.log("Enhanced lessons fetched for module:", moduleId, enhancedLessons);
            console.log("Sample enhanced lesson structure:", enhancedLessons[0]);
            setModuleLessons(prev => ({ 
                ...prev, 
                [moduleId]: enhancedLessons
            }));
            
        } catch (err) {
            console.error("Error fetching module lessons:", err);
            setError(`Failed to load lessons: ${err.message}`);
        } finally {
            setLessonLoading(prev => ({ ...prev, [moduleId]: false }));
            setEnhancingLessons(prev => ({ ...prev, [moduleId]: false }));
        }
    };

    const handleModuleExpand = async (moduleId) => {
        if (expandedModule === moduleId) {
            // Collapse if already expanded
            setExpandedModule(null);
        } else {
            // Expand and fetch lessons if not already loaded
            setExpandedModule(moduleId);
            if (!moduleLessons[moduleId]) {
                await fetchModuleLessons(moduleId);
            }
        }
    };

    const handleLessonClick = async (lessonId) => {
        setViewingLesson(lessonId);
        setLessonContentLoading(true);
        await fetchLessonContent(lessonId);
        setLessonContentLoading(false);
    };

    const fetchLessonContent = async (lessonId) => {
        try {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('role');
            
            if (!token) {
                setError("Please log in to access lesson content");
                return;
            }

            const apiUrl = userRole === 'student' 
                ? `http://localhost:3000/api/lessons/student/${lessonId}`
                : `http://localhost:3000/api/lessons/${lessonId}`;

            console.log('Fetching lesson content from:', apiUrl);

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const lessonData = await response.json();
                console.log('Raw lesson data response:', lessonData);
                
                // Handle nested data structure - extract from data property if it exists
                const actualLessonData = lessonData.data || lessonData;
                console.log('Processed lesson data:', actualLessonData);
                
                // Fetch quizzes for this lesson using both lesson._id and lessonId
                console.log('Fetching quizzes for lesson ID:', actualLessonData._id, 'and lessonId:', actualLessonData.lessonId);
                
                // Try fetching quizzes using both possible identifiers
                let quizzes = [];
                if (actualLessonData._id) {
                    console.log('Fetching quizzes by lesson._id:', actualLessonData._id);
                    const quizzesByObjectId = await fetchLessonQuizzes(actualLessonData._id);
                    quizzes = quizzes.concat(quizzesByObjectId);
                }
                
                if (actualLessonData.lessonId && actualLessonData.lessonId !== actualLessonData._id) {
                    console.log('Fetching quizzes by lessonId:', actualLessonData.lessonId);
                    const quizzesByLessonId = await fetchLessonQuizzes(actualLessonData.lessonId);
                    quizzes = quizzes.concat(quizzesByLessonId);
                }
                
                // Remove duplicates if any
                const uniqueQuizzes = quizzes.filter((quiz, index, self) => 
                    index === self.findIndex(q => q._id === quiz._id)
                );
                
                console.log('Final quizzes found:', uniqueQuizzes);
                
                setCurrentLesson({
                    ...actualLessonData,
                    quizzes: uniqueQuizzes
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to fetch lesson content");
            }
        } catch (error) {
            console.error("Error fetching lesson content:", error);
            setError("Error loading lesson content");
        }
    };

    const handleBackToModules = () => {
        setViewingLesson(null);
        setCurrentLesson(null);
        setLessonContentLoading(false);
        setError("");
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleLevelFilter = (e) => {
        setSelectedLevel(e.target.value);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading modules...</span>
            </div>
        );
    }

    // If viewing a lesson, show lesson content
    if (viewingLesson) {
        if (lessonContentLoading) {
            return (
                <div className="p-6 max-w-4xl mx-auto">
                    <button
                        onClick={handleBackToModules}
                        className="flex items-center gap-2 mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Modules
                    </button>
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading lesson content...</span>
                    </div>
                </div>
            );
        }

        if (!currentLesson) {
            return (
                <div className="p-6 max-w-4xl mx-auto">
                    <button
                        onClick={handleBackToModules}
                        className="flex items-center gap-2 mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Modules
                    </button>
                    <div className="text-center py-12">
                        <p className="text-red-600">Failed to load lesson content.</p>
                        <button 
                            onClick={() => fetchLessonContent(viewingLesson)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-6 max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={handleBackToModules}
                    className="flex items-center gap-2 mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Modules
                </button>

                {/* Lesson Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentLesson.title}</h1>
                    {currentLesson.description && (
                        <p className="text-gray-600 text-lg mb-4">{currentLesson.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{currentLesson.duration || 'Self-paced'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen size={16} />
                            <span>Level: {currentLesson.level || 'Beginner'}</span>
                        </div>
                        {currentLesson.completed && (
                            <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle size={16} />
                                <span>Completed</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lesson Content */}
                <div className="bg-white rounded-lg shadow-lg">
                    {currentLesson.content ? (
                        <div className="p-6">
                            <div 
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                            />
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                            <p>Lesson content will be available soon.</p>
                        </div>
                    )}

                    {/* Lesson Resources */}
                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                        <div className="border-t border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resources</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentLesson.resources.map((resource, index) => (
                                    <a
                                        key={index}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <BookOpen size={20} className="text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">{resource.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Debug Info */}
                    {process.env.NODE_ENV === 'development' && error && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
                            <p><strong>Debug Info:</strong></p>
                            <p>Error: {error}</p>
                            <p>User Role: {localStorage.getItem('role')}</p>
                            <p>Token Exists: {!!localStorage.getItem('token')}</p>
                            {currentLesson && (
                                <>
                                    <p>Lesson ID: {currentLesson._id}</p>
                                    <p>Lesson lessonId: {currentLesson.lessonId}</p>
                                    <p>Quizzes Found: {currentLesson.quizzes?.length || 0}</p>
                                    {currentLesson.quizzes?.map((quiz, idx) => (
                                        <p key={idx}>Quiz {idx + 1}: {quiz.title} (ID: {quiz._id}, QuizID: {quiz.quizId})</p>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* Related Quizzes */}
                    {currentLesson.quizzes && currentLesson.quizzes.length > 0 && (
                        <div className="border-t border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Target className="text-indigo-600" size={20} />
                                Related Quizzes ({currentLesson.quizzes.length})
                            </h3>
                            <div className="grid gap-4">
                                {currentLesson.quizzes.map((quiz) => (
                                    <div
                                        key={quiz._id}
                                        className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-indigo-900 mb-2">
                                                    {quiz.title}
                                                </h4>
                                                {quiz.description && (
                                                    <p className="text-sm text-indigo-700 mb-3">
                                                        {quiz.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-600">
                                                    <div className="flex items-center gap-1">
                                                        <Target className="w-4 h-4" />
                                                        <span>{quiz.questions?.length || 0} questions</span>
                                                    </div>
                                                    {quiz.createdBy?.name && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-4 h-4" />
                                                            <span>Created by {quiz.createdBy.name}</span>
                                                        </div>
                                                    )}
                                                    {quiz.createdAt && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex flex-col gap-2">
                                                <button 
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('=== TAKE QUIZ BUTTON CLICKED ===');
                                                        console.log('Quiz object received:', quiz);
                                                        console.log('Quiz ID field:', quiz._id);
                                                        console.log('Quiz quizId field:', quiz.quizId);
                                                        console.log('Quiz title:', quiz.title);
                                                        console.log('Quiz questions:', quiz.questions);
                                                        console.log('User role:', localStorage.getItem('role'));
                                                        console.log('User token exists:', !!localStorage.getItem('token'));
                                                        console.log('=== STARTING QUIZ ATTEMPT ===');
                                                        startQuizAttempt(quiz);
                                                    }}
                                                >
                                                    <Trophy size={16} />
                                                    Take Quiz
                                                </button>
                                                <div className="text-xs text-center text-indigo-600">
                                                    ID: {quiz.quizId || quiz._id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header and Filters */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Learning Hub</h1>
                
                {/* Search Mode Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setSearchMode('modules')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            searchMode === 'modules' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Browse Modules
                    </button>
                    <button
                        onClick={() => setSearchMode('lessons')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            searchMode === 'lessons' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Search Lessons
                    </button>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={searchMode === 'modules' ? "Search modules..." : "Search lessons by name (e.g., 'fire-safety-basics')"}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchMode === 'lessons' && (
                            <p className="text-xs text-gray-500 mt-1">
                                Tip: Use hyphens between words (e.g., "earthquake-preparedness" or "fire-safety")
                            </p>
                        )}
                    </div>
                    <div className="md:w-48">
                        <select
                            value={selectedLevel}
                            onChange={handleLevelFilter}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    <p>Error: {error}</p>
                </div>
            )}

            {/* Lesson Search Results */}
            {searchMode === 'lessons' && (
                <div className="mb-8">
                    {lessonSearchLoading ? (
                        <div className="flex justify-center items-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Searching lessons...</span>
                        </div>
                    ) : lessonSearchResults.length > 0 ? (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Found {lessonSearchResults.length} lesson(s) matching "{searchTerm}"
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {lessonSearchResults.map((lesson) => (
                                    <div
                                        key={lesson._id}
                                        className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 cursor-pointer group"
                                        onClick={() => handleLessonClick(lesson._id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                                                    {lesson.title}
                                                </h3>
                                                
                                                {/* Lesson ID Display */}
                                                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono mb-2">
                                                    {lesson.lessonId}
                                                </div>
                                                
                                                {lesson.description && (
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {lesson.description}
                                                    </p>
                                                )}
                                                
                                                {/* Module Info */}
                                                {lesson.module && (
                                                    <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                                                        <BookOpen className="w-3 h-3" />
                                                        <span>Module: {lesson.module.name}</span>
                                                    </div>
                                                )}
                                                
                                                {/* Lesson Metadata */}
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    {lesson.duration && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{lesson.duration} min</span>
                                                        </div>
                                                    )}
                                                    
                                                    {lesson.createdBy?.name && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            <span>By {lesson.createdBy.name}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                        <div className="flex items-center gap-1 text-indigo-600">
                                                            <Target className="w-3 h-3" />
                                                            <span>{lesson.quizzes.length} Quiz{lesson.quizzes.length > 1 ? 'es' : ''}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Related Quizzes for Search Results */}
                                                {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                    <div className="mt-3 space-y-1">
                                                        <div className="text-xs font-medium text-gray-700 mb-1">
                                                            Available Quizzes:
                                                        </div>
                                                        {lesson.quizzes.slice(0, 2).map((quiz) => (
                                                            <div key={quiz._id} className="bg-indigo-50 border border-indigo-200 rounded p-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="text-xs font-medium text-indigo-800">
                                                                            {quiz.title}
                                                                        </div>
                                                                        <div className="text-xs text-indigo-600">
                                                                            {quiz.questions?.length || 0} questions
                                                                        </div>
                                                                    </div>
                                                                    <Trophy className="w-3 h-3 text-indigo-600" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {lesson.quizzes.length > 2 && (
                                                            <div className="text-xs text-gray-500 text-center">
                                                                +{lesson.quizzes.length - 2} more quiz{lesson.quizzes.length - 2 > 1 ? 'es' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                <Play size={12} />
                                                Open
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : searchTerm.trim() ? (
                        <div className="text-center py-12">
                            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">No lessons found for "{searchTerm}"</p>
                            <p className="text-sm text-gray-500">Try using hyphen-separated terms like "fire-safety" or "earthquake-preparedness"</p>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Enter a search term to find lessons</p>
                            <p className="text-sm text-gray-500">Try searching for "fire-safety", "earthquake-preparedness", or any lesson topic</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modules Grid */}
            {searchMode === 'modules' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {modules.length > 0 ? (
                    modules.map((module) => (
                        <div
                            key={module._id}
                            className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col"
                        >
                            {/* Header with Level Badge */}
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-semibold text-gray-800 flex-1 mr-2">
                                    {module.title}
                                </h2>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    module.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                    module.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {module.level}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                {module.description || 'No description available'}
                            </p>

                            {/* Lesson Count and Districts */}
                            <div className="space-y-2 text-sm text-gray-500 mb-4">
                                <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2 text-gray-700" />
                                    <span className="font-medium text-gray-700">Lessons:</span>
                                    <span className="ml-2">
                                        {module.lessonCount || module.lessons?.length || 0} lessons
                                    </span>
                                </div>
                                
                                {module.allowedDistricts && module.allowedDistricts.length > 0 && (
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-700">🏢 Districts:</span>
                                        <span className="ml-2 truncate">
                                            {Array.isArray(module.allowedDistricts)
                                                ? module.allowedDistricts.slice(0, 2).join(", ") + 
                                                  (module.allowedDistricts.length > 2 ? "..." : "")
                                                : module.allowedDistricts}
                                        </span>
                                    </div>
                                )}
                                
                                {module.createdBy && (
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-700" />
                                        <span className="font-medium text-gray-700">Created by:</span>
                                        <span className="ml-2">{module.createdBy.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Expand/Collapse Button */}
                            <button 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mb-3"
                                onClick={() => handleModuleExpand(module._id)}
                            >
                                <BookOpen className="w-4 h-4" />
                                {expandedModule === module._id ? 'Hide Lessons' : 'View Lessons'}
                                {expandedModule === module._id ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>

                            {/* Expanded Lessons Content */}
                            {expandedModule === module._id && (
                                <div className="border-t border-gray-200 pt-4 mt-2">
                                    {lessonLoading[module._id] ? (
                                        <div className="flex justify-center items-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-sm text-gray-600">Loading lessons...</span>
                                        </div>
                                    ) : moduleLessons[module._id] && moduleLessons[module._id].length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    Lessons ({moduleLessons[module._id].length})
                                                </h4>
                                                {enhancingLessons[module._id] && (
                                                    <div className="flex items-center gap-2 text-xs text-blue-600">
                                                        <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                                                        <span>Enhancing with detailed data...</span>
                                                    </div>
                                                )}
                                            </div>
                                            {moduleLessons[module._id].map((lesson, index) => (
                                                <div
                                                    key={lesson._id}
                                                    className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer border border-gray-200 group"
                                                    onClick={() => handleLessonClick(lesson._id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-gray-800 text-sm mb-2 group-hover:text-blue-700 transition-colors">
                                                                {index + 1}. {lesson.title}
                                                            </h5>
                                                            
                                                            {/* Lesson ID Display for debugging */}
                                                            {lesson.lessonId && (
                                                                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono mb-2">
                                                                    {lesson.lessonId}
                                                                </div>
                                                            )}
                                                            
                                                            {lesson.description && (
                                                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                                                    {lesson.description}
                                                                </p>
                                                            )}
                                                            
                                                            {/* Enhanced lesson metadata */}
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                {lesson.duration && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        <span>{lesson.duration} min</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {lesson.level && (
                                                                    <div className="flex items-center gap-1">
                                                                        <BookOpen className="w-3 h-3" />
                                                                        <span className="capitalize">{lesson.level}</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {lesson.quiz && (
                                                                    <div className="flex items-center gap-1 text-purple-600">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        <span>Quiz Available</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                                    <div className="flex items-center gap-1 text-indigo-600">
                                                                        <Target className="w-3 h-3" />
                                                                        <span>{lesson.quizzes.length} Quiz{lesson.quizzes.length > 1 ? 'es' : ''}</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {lesson.completed && (
                                                                    <div className="flex items-center gap-1 text-green-600">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        <span>Completed</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {lesson.createdBy?.name && (
                                                                    <div className="flex items-center gap-1">
                                                                        <User className="w-3 h-3" />
                                                                        <span>By {lesson.createdBy.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Content preview */}
                                                            {lesson.content && (
                                                                <div className="mt-2 text-xs text-gray-500">
                                                                    <span className="bg-gray-200 px-2 py-1 rounded-full">
                                                                        Content Available
                                                                    </span>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Related Quizzes */}
                                                            {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                                <div className="mt-3 space-y-1">
                                                                    <div className="text-xs font-medium text-gray-700 mb-1">
                                                                        Related Quizzes:
                                                                    </div>
                                                                    {lesson.quizzes.map((quiz, qIndex) => (
                                                                        <div key={quiz._id} className="bg-indigo-50 border border-indigo-200 rounded p-2">
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <div className="text-xs font-medium text-indigo-800">
                                                                                        {quiz.title}
                                                                                    </div>
                                                                                    {quiz.description && (
                                                                                        <div className="text-xs text-indigo-600 mt-1 line-clamp-1">
                                                                                            {quiz.description}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="flex items-center gap-2 mt-1 text-xs text-indigo-500">
                                                                                        <Target className="w-3 h-3" />
                                                                                        <span>{quiz.questions?.length || 0} questions</span>
                                                                                        {quiz.createdBy?.name && (
                                                                                            <>
                                                                                                <span>•</span>
                                                                                                <span>By {quiz.createdBy.name}</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <button 
                                                                                    className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        // Handle quiz navigation here
                                                                                        console.log('Opening quiz:', quiz._id);
                                                                                    }}
                                                                                >
                                                                                    <Trophy className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="ml-3 flex flex-col items-center gap-2">
                                                            <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                                <Play size={12} />
                                                                Start
                                                            </button>
                                                            
                                                            {/* Progress indicator for completed lessons */}
                                                            {lesson.completed && (
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 text-sm">No lessons available in this module</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm || selectedLevel ? 'No modules found matching your criteria.' : 'No modules available.'}
                        </p>
                        {(searchTerm || selectedLevel) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedLevel("");
                                }}
                                className="mt-4 text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
                </div>
            )}

            {/* Quiz Modal */}
            {showQuizModal && currentQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Quiz Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h2>
                                    {currentQuiz.description && (
                                        <p className="text-gray-600 mt-1">{currentQuiz.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span>{currentQuiz.questions?.length || 0} questions</span>
                                        <span>Total Points: {currentAttempt?.totalPoints || 0}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={closeQuizModal}
                                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Quiz Results */}
                        {quizResults ? (
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="bg-green-100 border border-green-200 rounded-lg p-6">
                                        <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-green-800 mb-2">Quiz Completed!</h3>
                                        <div className="text-lg text-green-700">
                                            Score: {quizResults.score}/{quizResults.totalPoints} ({quizResults.percentage}%)
                                        </div>
                                        <div className="text-sm text-green-600 mt-2">
                                            Correct Answers: {quizResults.correctAnswers}/{quizResults.totalQuestions}
                                        </div>
                                        {quizResults.duration && (
                                            <div className="text-sm text-green-600">
                                                Time Taken: {Math.floor(quizResults.duration / 60)}:{(quizResults.duration % 60).toString().padStart(2, '0')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={closeQuizModal}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Quiz Questions */
                            <div className="p-6">
                                {currentQuiz.questions.map((question, index) => (
                                    <div key={question._id} className="mb-8 p-4 border border-gray-200 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            {index + 1}. {question.text}
                                        </h3>
                                        <div className="space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <label
                                                    key={optionIndex}
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${question._id}`}
                                                        value={optionIndex}
                                                        checked={quizAnswers[question._id] === optionIndex}
                                                        onChange={() => handleAnswerChange(question._id, optionIndex)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <span className="text-gray-700">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            Points: {question.points || 1}
                                        </div>
                                    </div>
                                ))}

                                {/* Submit Button */}
                                <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 mt-6">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            Answered: {Object.keys(quizAnswers).length}/{currentQuiz.questions?.length || 0} questions
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={closeQuizModal}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={submitQuizAttempt}
                                                disabled={submittingQuiz || Object.keys(quizAnswers).length !== currentQuiz.questions?.length}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                            >
                                                {submittingQuiz ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trophy size={16} />
                                                        Submit Quiz
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModulesRead;
