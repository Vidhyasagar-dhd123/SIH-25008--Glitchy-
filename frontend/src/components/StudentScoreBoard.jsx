import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Award, Target, Zap, Users, BookOpen, Clock } from 'lucide-react';

export default function StudentScoreBoard() {
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockStudentData = {
        totalScore: 2450,
        rank: 3,
        level: 8,
        xpToNextLevel: 350,
        currentLevelXP: 2450,
        nextLevelXP: 2800,
        modulesCompleted: 12,
        quizzesCompleted: 28,
        averageScore: 87.5,
        streakDays: 7,
        totalStudyTime: 145 // in hours
      };

      const mockRecentActivities = [
        {
          id: 1,
          type: 'quiz_completed',
          title: 'Fire Safety Quiz',
          score: 95,
          maxScore: 100,
          xpGained: 48,
          timeAgo: '2 hours ago',
          module: 'Emergency Response'
        },
        {
          id: 2,
          type: 'module_completed',
          title: 'Earthquake Preparedness',
          xpGained: 120,
          timeAgo: '1 day ago',
          module: 'Natural Disasters'
        },
        {
          id: 3,
          type: 'achievement_unlocked',
          title: 'Quiz Master',
          description: 'Complete 25 quizzes',
          xpGained: 100,
          timeAgo: '2 days ago'
        },
        {
          id: 4,
          type: 'drill_completed',
          title: 'Virtual Fire Drill',
          score: 88,
          maxScore: 100,
          xpGained: 44,
          timeAgo: '3 days ago',
          module: 'Fire Safety'
        }
      ];

      const mockAchievements = [
        {
          id: 1,
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          earned: true,
          earnedDate: '2 weeks ago'
        },
        {
          id: 2,
          title: 'Quiz Master',
          description: 'Complete 25 quizzes with 80%+ score',
          icon: '🏆',
          earned: true,
          earnedDate: '2 days ago'
        },
        {
          id: 3,
          title: 'Study Streak',
          description: 'Study for 7 consecutive days',
          icon: '🔥',
          earned: true,
          earnedDate: 'Today'
        },
        {
          id: 4,
          title: 'Module Expert',
          description: 'Complete 15 modules',
          icon: '📚',
          earned: false,
          progress: 12,
          target: 15
        },
        {
          id: 5,
          title: 'Speed Learner',
          description: 'Complete 5 quizzes in one day',
          icon: '⚡',
          earned: false,
          progress: 3,
          target: 5
        }
      ];

      const mockLeaderboard = [
        { rank: 1, name: 'Sarah Chen', score: 3200, level: 12, avatar: '👩‍🎓' },
        { rank: 2, name: 'Alex Kumar', score: 2850, level: 10, avatar: '👨‍🎓' },
        { rank: 3, name: 'You', score: 2450, level: 8, avatar: '🧑‍🎓', isCurrentUser: true },
        { rank: 4, name: 'Maya Patel', score: 2320, level: 8, avatar: '👩‍🎓' },
        { rank: 5, name: 'James Wilson', score: 2180, level: 7, avatar: '👨‍🎓' }
      ];

      setStudentStats(mockStudentData);
      setRecentActivities(mockRecentActivities);
      setAchievements(mockAchievements);
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz_completed': return <Target className="w-5 h-5 text-blue-500" />;
      case 'module_completed': return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'achievement_unlocked': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'drill_completed': return <Zap className="w-5 h-5 text-purple-500" />;
      default: return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'quiz_completed': return 'bg-blue-50 border-blue-200';
      case 'module_completed': return 'bg-green-50 border-green-200';
      case 'achievement_unlocked': return 'bg-yellow-50 border-yellow-200';
      case 'drill_completed': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My ScoreBoard</h1>
          <p className="text-gray-600">Track your learning progress and achievements</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">#{studentStats?.rank}</span>
            </div>
            <h3 className="text-gray-800 font-semibold">Current Rank</h3>
            <p className="text-sm text-gray-600">Out of 150 students</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{studentStats?.totalScore}</span>
            </div>
            <h3 className="text-gray-800 font-semibold">Total XP</h3>
            <p className="text-sm text-gray-600">Level {studentStats?.level}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{studentStats?.averageScore}%</span>
            </div>
            <h3 className="text-gray-800 font-semibold">Average Score</h3>
            <p className="text-sm text-gray-600">{studentStats?.quizzesCompleted} quizzes</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{studentStats?.streakDays}</span>
            </div>
            <h3 className="text-gray-800 font-semibold">Study Streak</h3>
            <p className="text-sm text-gray-600">Consecutive days</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress & Level */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Level Progress
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">Level {studentStats?.level}</div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((studentStats?.currentLevelXP || 0) / (studentStats?.nextLevelXP || 1)) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {studentStats?.xpToNextLevel} XP to level {(studentStats?.level || 0) + 1}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Modules Completed</span>
                <span className="font-semibold">{studentStats?.modulesCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quizzes Completed</span>
                <span className="font-semibold">{studentStats?.quizzesCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Study Time</span>
                <span className="font-semibold">{studentStats?.totalStudyTime}h</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              Recent Activities
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                        {activity.score && (
                          <p className="text-sm text-gray-600">
                            Score: {activity.score}/{activity.maxScore}
                          </p>
                        )}
                        {activity.module && (
                          <p className="text-xs text-gray-500">{activity.module}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">+{activity.xpGained} XP</div>
                      <div className="text-xs text-gray-500">{activity.timeAgo}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mini Leaderboard */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Class Ranking
            </h3>
            
            <div className="space-y-3">
              {leaderboard.map((student, index) => (
                <motion.div
                  key={student.rank}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    student.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      student.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      student.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      student.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {student.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{student.name}</div>
                      <div className="text-sm text-gray-600">Level {student.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">{student.score}</div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mt-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Achievements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  achievement.earned 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-gray-800 mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  
                  {achievement.earned ? (
                    <div className="text-xs text-green-600 font-semibold">
                      Earned {achievement.earnedDate}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      Progress: {achievement.progress}/{achievement.target}
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
