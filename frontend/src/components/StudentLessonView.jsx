import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentLessonView = () => {
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { lessonId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            setLoading(true);
            setError("");
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Please log in to access lessons");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:3000/api/lessons/student/${lessonId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    mode: "cors",
                }
            );
            
            const json = await response.json();
            
            if (!response.ok) {
                throw new Error(json.error || json.message || `Failed to fetch lesson (${response.status})`);
            }
            
            console.log("Lesson fetched:", json.data);
            setLesson(json.data);
        } catch (err) {
            console.error("Error fetching lesson:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToModule = () => {
        if (lesson?.module?._id) {
            navigate(`/student/modules/${lesson.module._id}`);
        } else {
            navigate('/student/modules');
        }
    };

    const handleNavigateToSibling = (siblingLessonId) => {
        navigate(`/student/lessons/${siblingLessonId}`);
    };

    const handleTakeQuiz = () => {
        if (lesson?.quiz?._id) {
            navigate(`/student/quiz/${lesson.quiz._id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading lesson...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    <p>Error: {error}</p>
                </div>
                <button
                    onClick={() => navigate('/student/modules')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Back to Modules
                </button>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="p-6">
                <p className="text-gray-500">Lesson not found.</p>
                <button
                    onClick={() => navigate('/student/modules')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Back to Modules
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Navigation */}
            <div className="mb-6">
                <button
                    onClick={handleBackToModule}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to {lesson.module?.title || 'Module'}
                </button>
            </div>

            {/* Module Context */}
            {lesson.module && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Module</p>
                            <h2 className="text-lg font-semibold text-blue-800">{lesson.module.title}</h2>
                            {lesson.module.description && (
                                <p className="text-sm text-blue-600 mt-1">{lesson.module.description}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lesson.module.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                lesson.module.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {lesson.module.level}
                            </span>
                            {lesson.moduleInfo && (
                                <p className="text-xs text-blue-600 mt-1">
                                    {lesson.moduleInfo.totalLessons} lessons in module
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Content */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>🕒 Created {new Date(lesson.createdAt).toLocaleDateString()}</span>
                        {lesson.createdBy && (
                            <span>👤 By {lesson.createdBy.name}</span>
                        )}
                        {lesson.quiz && (
                            <span className="flex items-center text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Quiz Available
                            </span>
                        )}
                    </div>
                </div>

                {/* Lesson Content */}
                <div className="prose max-w-none">
                    {lesson.content ? (
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {lesson.content}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📄</div>
                            <p className="text-gray-500">No content available for this lesson yet.</p>
                        </div>
                    )}
                </div>

                {/* Quiz Section */}
                {lesson.quiz && (
                    <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    📝 {lesson.quiz.title}
                                </h3>
                                {lesson.quiz.description && (
                                    <p className="text-green-700 text-sm">{lesson.quiz.description}</p>
                                )}
                            </div>
                            <button
                                onClick={handleTakeQuiz}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Take Quiz
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation to Other Lessons */}
            {lesson.siblingLessons && lesson.siblingLessons.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Other Lessons in This Module</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {lesson.siblingLessons.map((siblingLesson) => (
                            <div
                                key={siblingLesson._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                                onClick={() => handleNavigateToSibling(siblingLesson._id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {siblingLesson.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Added {new Date(siblingLesson.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <svg 
                                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lesson Actions */}
            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={handleBackToModule}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Module
                </button>
                
                <div className="flex space-x-4">
                    {lesson.quiz && (
                        <button
                            onClick={handleTakeQuiz}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                        >
                            Take Quiz
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium"
                    >
                        Print Lesson
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentLessonView;