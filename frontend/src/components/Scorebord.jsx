import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Filter, Search, Award, Zap, Target, BookOpen } from 'lucide-react';

export default function Scorebord() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('overall'); // overall, weekly, monthly
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole') || 'student';
    setUserRole(role);
    fetchLeaderboardData(filter);
  }, [filter]);

  const fetchLeaderboardData = async (filterType) => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockLeaderboardData = {
        overall: [
          { 
            id: 1, 
            rank: 1, 
            name: 'Sarah Chen', 
            email: 'sarah.chen@email.com',
            institute: 'Greenwood High School',
            totalScore: 3250, 
            level: 15, 
            modulesCompleted: 28,
            quizzesCompleted: 142,
            drillsCompleted: 35,
            averageScore: 94.2,
            streakDays: 21,
            avatar: '👩‍🎓',
            badges: ['🏆', '⭐', '🔥', '📚']
          },
          { 
            id: 2, 
            rank: 2, 
            name: 'Alex Kumar', 
            email: 'alex.kumar@email.com',
            institute: 'Tech Valley Academy',
            totalScore: 2980, 
            level: 13, 
            modulesCompleted: 25,
            quizzesCompleted: 128,
            drillsCompleted: 31,
            averageScore: 91.8,
            streakDays: 15,
            avatar: '👨‍🎓',
            badges: ['🥈', '⭐', '📚']
          },
          { 
            id: 3, 
            rank: 3, 
            name: 'Emma Rodriguez', 
            email: 'emma.rod@email.com',
            institute: 'Central High School',
            totalScore: 2750, 
            level: 12, 
            modulesCompleted: 22,
            quizzesCompleted: 115,
            drillsCompleted: 28,
            averageScore: 89.5,
            streakDays: 12,
            avatar: '👩‍🎓',
            badges: ['🥉', '⭐', '🎯']
          },
          { 
            id: 4, 
            rank: 4, 
            name: 'Michael Zhang', 
            email: 'michael.zhang@email.com',
            institute: 'Riverside Academy',
            totalScore: 2650, 
            level: 11, 
            modulesCompleted: 20,
            quizzesCompleted: 108,
            drillsCompleted: 25,
            averageScore: 87.3,
            streakDays: 8,
            avatar: '👨‍🎓',
            badges: ['⭐', '🎯']
          },
          { 
            id: 5, 
            rank: 5, 
            name: 'You', 
            email: 'current.user@email.com',
            institute: 'Your Institute',
            totalScore: 2450, 
            level: 10, 
            modulesCompleted: 18,
            quizzesCompleted: 95,
            drillsCompleted: 22,
            averageScore: 85.7,
            streakDays: 7,
            avatar: '🧑‍🎓',
            badges: ['⭐', '🔥'],
            isCurrentUser: true
          }
        ],
        weekly: [
          { id: 1, rank: 1, name: 'Emma Rodriguez', totalScore: 480, avatar: '👩‍🎓', weeklyXP: 480 },
          { id: 2, rank: 2, name: 'Sarah Chen', totalScore: 445, avatar: '👩‍🎓', weeklyXP: 445 },
          { id: 3, rank: 3, name: 'You', totalScore: 320, avatar: '🧑‍🎓', weeklyXP: 320, isCurrentUser: true },
          { id: 4, rank: 4, name: 'Alex Kumar', totalScore: 295, avatar: '👨‍🎓', weeklyXP: 295 },
          { id: 5, rank: 5, name: 'Michael Zhang', totalScore: 280, avatar: '👨‍🎓', weeklyXP: 280 }
        ],
        monthly: [
          { id: 1, rank: 1, name: 'Sarah Chen', totalScore: 1850, avatar: '👩‍🎓', monthlyXP: 1850 },
          { id: 2, rank: 2, name: 'Alex Kumar', totalScore: 1720, avatar: '👨‍🎓', monthlyXP: 1720 },
          { id: 3, rank: 3, name: 'You', totalScore: 1450, avatar: '🧑‍🎓', monthlyXP: 1450, isCurrentUser: true },
          { id: 4, rank: 4, name: 'Emma Rodriguez', totalScore: 1380, avatar: '👩‍🎓', monthlyXP: 1380 },
          { id: 5, rank: 5, name: 'Michael Zhang', totalScore: 1320, avatar: '👨‍🎓', monthlyXP: 1320 }
        ]
      };

      const mockStats = {
        totalStudents: 1247,
        totalInstitutes: 23,
        averageScore: 78.5,
        topPerformer: 'Sarah Chen'
      };

      setLeaderboard(mockLeaderboardData[filterType] || []);
      setStats(mockStats);
      
      // Set current user
      const currentUserData = mockLeaderboardData[filterType].find(user => user.isCurrentUser);
      setCurrentUser(currentUserData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.institute && user.institute.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-500" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">{rank}</div>;
    }
  };

  const getRankBg = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-blue-50 border-blue-200 ring-2 ring-blue-300';
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default: return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Trophy className="w-10 h-10 mr-3 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-600">See how you rank among your peers</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
                <p className="text-gray-600">Total Students</p>
              </div>
              <Users className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalInstitutes}</p>
                <p className="text-gray-600">Institutes</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.averageScore}%</p>
                <p className="text-gray-600">Average Score</p>
              </div>
              <Target className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-yellow-600">{stats.topPerformer}</p>
                <p className="text-gray-600">Top Performer</p>
              </div>
              <Crown className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </motion.div>

        {/* Current User Highlight */}
        {currentUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                  {currentUser.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold">Your Current Rank</h3>
                  <p className="opacity-90">#{currentUser.rank} • {currentUser.totalScore} XP • Level {currentUser.level}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">#{currentUser.rank}</div>
                <div className="opacity-90">of {leaderboard.length}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['overall', 'weekly', 'monthly'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    filter === filterType
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students or institutes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
              {filter.charAt(0).toUpperCase() + filter.slice(1)} Rankings
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredLeaderboard.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 ${getRankBg(user.rank, user.isCurrentUser)} border-l-4 ${
                  user.isCurrentUser ? 'border-l-blue-500' : 'border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(user.rank)}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-xl">
                        {user.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center">
                          {user.name}
                          {user.isCurrentUser && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">You</span>
                          )}
                        </h3>
                        {user.institute && (
                          <p className="text-sm text-gray-600">{user.institute}</p>
                        )}
                        {user.badges && (
                          <div className="flex space-x-1 mt-1">
                            {user.badges.map((badge, i) => (
                              <span key={i} className="text-sm">{badge}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-right">
                    {filter === 'overall' ? (
                      <>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{user.totalScore}</p>
                          <p className="text-sm text-gray-600">Total XP</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-600">Level {user.level}</p>
                          <p className="text-sm text-gray-600">{user.averageScore}% avg</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-lg font-bold text-green-600">{user.modulesCompleted}</p>
                          <p className="text-sm text-gray-600">Modules</p>
                        </div>
                        <div className="hidden lg:block">
                          <p className="text-lg font-bold text-orange-600">{user.streakDays}</p>
                          <p className="text-sm text-gray-600">Day Streak</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {filter === 'weekly' ? user.weeklyXP : user.monthlyXP}
                        </p>
                        <p className="text-sm text-gray-600">
                          {filter === 'weekly' ? 'Weekly' : 'Monthly'} XP
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredLeaderboard.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No results found for "{searchTerm}"</p>
            </div>
          )}
        </motion.div>

        {/* Footer Message */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200"
        >
          <p className="text-gray-600">
            🎯 Keep learning and practicing to climb the leaderboard! 
            Complete more modules and quizzes to earn XP and unlock achievements.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
