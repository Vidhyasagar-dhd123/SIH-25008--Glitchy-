import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StudentDashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentModules();
  }, []);

  const fetchStudentModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Please log in to view your dashboard");
        setLoading(false);
        return;
      }

      const response = await fetch(
        'http://localhost:3000/api/modules/student/my-modules?limit=20',
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
        throw new Error(json.message || `Failed to fetch modules (${response.status})`);
      }
      
      setModules(json?.data?.modules || []);
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from actual data
  const stats = {
    totalModules: modules.length,
    totalLessons: modules.reduce((sum, module) => sum + (module.lessonCount || 0), 0),
    completedModules: 0, // This would come from progress tracking
    averageScore: 0 // This would come from quiz results
  };

  // Generate chart data from actual modules
  const histogramData = {
    labels: modules.slice(0, 5).map(module => 
      module.title.length > 15 ? module.title.substring(0, 15) + '...' : module.title
    ),
    datasets: [
      {
        label: 'Lessons Available',
        data: modules.slice(0, 5).map(module => module.lessonCount || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data for module levels
  const levelCounts = modules.reduce((acc, module) => {
    acc[module.level] = (acc[module.level] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(levelCounts).map(level => 
      level.charAt(0).toUpperCase() + level.slice(1)
    ),
    datasets: [
      {
        data: Object.values(levelCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleModuleClick = (moduleId) => {
    navigate(`/student/modules/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Student Learning Dashboard</h2>
        <button
          onClick={() => navigate('/student/modules')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          View All Modules
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error: {error}</p>
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h4 className="text-sm font-semibold text-blue-700">Available Modules</h4>
          <p className="text-2xl font-bold text-blue-800">{stats.totalModules}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h4 className="text-sm font-semibold text-green-700">Total Lessons</h4>
          <p className="text-2xl font-bold text-green-800">{stats.totalLessons}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <h4 className="text-sm font-semibold text-purple-700">Completed</h4>
          <p className="text-2xl font-bold text-purple-800">{stats.completedModules}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <h4 className="text-sm font-semibold text-yellow-700">Progress</h4>
          <p className="text-2xl font-bold text-yellow-800">
            {stats.totalModules > 0 ? Math.round((stats.completedModules / stats.totalModules) * 100) : 0}%
          </p>
        </div>
      </div>

      {modules.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Histogram */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Lessons per Module</h3>
              <Bar
                data={histogramData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Available Lessons by Module'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Lessons'
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Pie Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Modules by Difficulty Level</h3>
              {Object.keys(levelCounts).length > 0 ? (
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      title: {
                        display: true,
                        text: 'Distribution by Level'
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Modules */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Learning Modules</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.slice(0, 6).map((module) => (
                <div
                  key={module._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleModuleClick(module._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm flex-1 mr-2">
                      {module.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      module.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      module.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {module.level}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {module.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>📚 {module.lessonCount || 0} lessons</span>
                    <span className="text-blue-600 hover:text-blue-800">Start Learning →</span>
                  </div>
                </div>
              ))}
            </div>
            
            {modules.length > 6 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate('/student/modules')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All {modules.length} Modules →
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Modules Available</h3>
          <p className="text-gray-500 mb-4">
            There are no learning modules available for you at the moment.
          </p>
          <p className="text-gray-400 text-sm">
            Check back later or contact your administrator for more information.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;