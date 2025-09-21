
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, BookOpen, Clock, User, ArrowLeft, CheckCircle, Play } from "lucide-react";

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
            setLessonSearchResults(json.data || []);
            
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
                        
                        if (lessonResponse.ok) {
                            const lessonDetail = await lessonResponse.json();
                            console.log("Raw lesson detail response:", lessonDetail);
                            
                            // Handle nested data structure - extract from data property if it exists
                            const actualLessonData = lessonDetail.data || lessonDetail;
                            console.log("Processed lesson data:", actualLessonData);
                            
                            // Merge basic lesson data with detailed data
                            return {
                                _id: lesson._id || actualLessonData._id,
                                title: actualLessonData.title || lesson.title,
                                description: actualLessonData.description || lesson.description,
                                content: actualLessonData.content,
                                duration: actualLessonData.duration || lesson.duration,
                                level: actualLessonData.level || lesson.level,
                                lessonId: actualLessonData.lessonId || lesson.lessonId,
                                quiz: actualLessonData.quiz,
                                createdBy: actualLessonData.createdBy,
                                module: actualLessonData.module,
                                completed: actualLessonData.completed || lesson.completed,
                                createdAt: actualLessonData.createdAt || lesson.createdAt,
                                updatedAt: actualLessonData.updatedAt || lesson.updatedAt,
                                // Include any additional fields from the response
                                siblingLessons: actualLessonData.siblingLessons,
                                moduleInfo: actualLessonData.moduleInfo
                            };
                        } else {
                            // If detailed fetch fails, return basic lesson data
                            console.warn(`Failed to fetch details for lesson ${lesson._id}`);
                            return lesson;
                        }
                    } catch (error) {
                        console.warn(`Error fetching details for lesson ${lesson._id}:`, error);
                        return lesson;
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

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const lessonData = await response.json();
                // Handle nested data structure - extract from data property if it exists
                const actualLessonData = lessonData.data || lessonData;
                setCurrentLesson(actualLessonData);
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
                                                </div>
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
        </div>
    );
};

export default ModulesRead;
