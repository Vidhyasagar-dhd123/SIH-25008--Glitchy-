import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentModuleView = () => {
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { moduleId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchModuleWithLessons();
    }, [moduleId]);

    const fetchModuleWithLessons = async () => {
        try {
            setLoading(true);
            setError("");
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Please log in to access modules");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:3000/api/modules/student/${moduleId}/with-lessons`,
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
                throw new Error(json.message || `Failed to fetch module (${response.status})`);
            }
            
            console.log("Module with lessons fetched:", json.data);
            setModule(json.data);
        } catch (err) {
            console.error("Error fetching module:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonClick = (lessonId) => {
        navigate(`/student/lessons/${lessonId}`);
    };

    const handleBackToModules = () => {
        navigate('/student/modules');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading module...</span>
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
                    onClick={handleBackToModules}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Back to Modules
                </button>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="p-6">
                <p className="text-gray-500">Module not found.</p>
                <button
                    onClick={handleBackToModules}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Back to Modules
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Navigation */}
            <div className="mb-6">
                <button
                    onClick={handleBackToModules}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Modules
                </button>
            </div>

            {/* Module Header */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-4">
                            <h1 className="text-3xl font-bold text-gray-800 mr-4">{module.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                module.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                module.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {module.level}
                            </span>
                        </div>
                        
                        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                            {module.description || 'No description available'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                                <span className="font-medium text-gray-700">📚 Total Lessons:</span>
                                <span className="ml-2 text-blue-600 font-semibold">{module.lessonCount || 0}</span>
                            </div>
                            
                            {module.allowedDistricts && module.allowedDistricts.length > 0 && (
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-700">🏢 Districts:</span>
                                    <span className="ml-2">{module.allowedDistricts.slice(0, 2).join(", ")}</span>
                                </div>
                            )}
                            
                            {module.createdBy && (
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-700">👤 Created by:</span>
                                    <span className="ml-2">{module.createdBy.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lessons Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Lessons ({module.lessons?.length || 0})
                </h2>
                
                {module.lessons && module.lessons.length > 0 ? (
                    <div className="space-y-4">
                        {module.lessons.map((lesson, index) => (
                            <div
                                key={lesson._id}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                                onClick={() => handleLessonClick(lesson._id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mr-3">
                                                Lesson {index + 1}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {lesson.title}
                                            </h3>
                                        </div>
                                        
                                        {lesson.content && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {lesson.content.length > 150 
                                                    ? lesson.content.substring(0, 150) + "..."
                                                    : lesson.content
                                                }
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                                            <span>🕒 Added {new Date(lesson.createdAt).toLocaleDateString()}</span>
                                            {lesson.quiz && (
                                                <span className="flex items-center">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                                    Has Quiz
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="ml-4">
                                        <svg 
                                            className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📄</div>
                        <p className="text-gray-500 text-lg">No lessons available in this module yet.</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later for new content!</p>
                    </div>
                )}
            </div>

            {/* Progress Section (Future Implementation) */}
            {module.lessons && module.lessons.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h3>
                    <div className="bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: '0%' }} // This could be calculated based on completed lessons
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                        0 of {module.lessons.length} lessons completed (0%)
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Progress tracking will be available soon!
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudentModuleView;