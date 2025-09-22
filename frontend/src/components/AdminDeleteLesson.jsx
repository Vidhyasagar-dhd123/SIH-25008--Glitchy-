import React, { useState } from "react";
import { Search, Trash2, AlertTriangle, X, Eye } from "lucide-react";

export default function AdminDeleteLesson() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setError("Please enter a lesson name to search");
            return;
        }

        setSearching(true);
        setError("");
        setSuccess("");
        setSearchResults([]);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3000/api/lessons/search?searchTerm=${encodeURIComponent(searchTerm)}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Search failed (${response.status})`);
            }

            if (result.success && result.data) {
                setSearchResults(result.data);
                if (result.data.length === 0) {
                    setError(`No lessons found matching "${searchTerm}"`);
                }
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Search error:", err);
            setError(err.message || "Failed to search lessons");
        } finally {
            setSearching(false);
        }
    };

    const handleDeleteConfirm = (lesson) => {
        setSelectedLesson(lesson);
        setShowDeleteModal(true);
    };

    const handleDeleteLesson = async () => {
        if (!selectedLesson) return;

        setDeleting(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3000/api/lessons/${selectedLesson._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Delete failed (${response.status})`);
            }

            setSuccess(`Lesson "${selectedLesson.title}" has been deleted successfully!`);
            setSearchResults(searchResults.filter(lesson => lesson._id !== selectedLesson._id));
            setShowDeleteModal(false);
            setSelectedLesson(null);
        } catch (err) {
            console.error("Delete error:", err);
            setError(err.message || "Failed to delete lesson");
        } finally {
            setDeleting(false);
        }
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        setSelectedLesson(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-3xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 text-center mb-6 flex items-center justify-center gap-2">
                <Trash2 size={24} />
                Delete Lesson
            </h2>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Search Lessons by Name
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setError("");
                                setSuccess("");
                            }}
                            placeholder="Enter lesson title to search..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={searching}
                            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                                searching
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                        >
                            <Search size={18} />
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Search Results ({searchResults.length} found)
                    </h3>
                    
                    <div className="grid gap-4">
                        {searchResults.map((lesson) => (
                            <div
                                key={lesson._id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                            {lesson.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Lesson ID:</span> {lesson.lessonId}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Module:</span> {lesson.module?.name || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Created By:</span> {lesson.createdBy?.name || 'Unknown'} ({lesson.createdBy?.email || 'N/A'})
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Created:</span> {formatDate(lesson.createdAt)}
                                        </p>
                                        {lesson.content && (
                                            <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border">
                                                <span className="font-medium">Content Preview:</span> {lesson.content.substring(0, 150)}
                                                {lesson.content.length > 150 && "..."}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => handleDeleteConfirm(lesson)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedLesson && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Confirm Deletion
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete this lesson? This action cannot be undone.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-semibold text-gray-900">{selectedLesson.title}</p>
                                <p className="text-sm text-gray-600">ID: {selectedLesson.lessonId}</p>
                                <p className="text-sm text-gray-600">Module: {selectedLesson.module?.name || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteLesson}
                                disabled={deleting}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                                    deleting
                                        ? "bg-red-400 cursor-not-allowed text-white"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                            >
                                <Trash2 size={16} />
                                {deleting ? "Deleting..." : "Delete Lesson"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}