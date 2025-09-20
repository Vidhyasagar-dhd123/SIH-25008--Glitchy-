import React, { useState } from "react";
import { Zap, AlertTriangle, Target, ArrowLeft, Play, Trophy, Clock, Users } from "lucide-react";
import DisasterDrillGame from "./DisasterDrillGame";
import DrillGameSimple from "./DrillGameSimple";

const VirtualDrillHub = () => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [gameMode, setGameMode] = useState('simple'); // 'simple' or 'advanced'

    const drillGames = [
        {
            id: 'disaster-drill',
            title: 'Disaster Drill Training',
            subtitle: 'Comprehensive Emergency Response',
            description: 'Interactive training for fire and earthquake emergency responses with detailed instructions and scoring.',
            icon: <AlertTriangle size={32} className="text-red-500" />,
            features: ['Multi-stage scenarios', 'Voice instructions', 'Progress tracking', 'Performance scoring'],
            difficulty: 'Advanced',
            duration: '10-15 minutes',
            participants: 'Individual',
            bgGradient: 'from-red-50 to-orange-50',
            borderColor: 'border-red-200',
            buttonColor: 'bg-red-500 hover:bg-red-600'
        },
        {
            id: 'simple-drill',
            title: 'Emergency Drill Simulator', 
            subtitle: 'Interactive Safety Training',
            description: 'Streamlined disaster response training with enhanced animations and focused gameplay mechanics.',
            icon: <Target size={32} className="text-blue-500" />,
            features: ['Interactive elements', 'Sprite animations', 'Click interactions', 'Real-time feedback'],
            difficulty: 'Beginner',
            duration: '5-10 minutes', 
            participants: 'Individual',
            bgGradient: 'from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200',
            buttonColor: 'bg-blue-500 hover:bg-blue-600'
        }
    ];

    const handleStartGame = (gameId) => {
        setSelectedGame(gameId);
    };

    const handleBackToHub = () => {
        setSelectedGame(null);
    };

    const renderGameComponent = () => {
        switch(selectedGame) {
            case 'disaster-drill':
                return <DisasterDrillGame />;
            case 'simple-drill':
                return <DrillGameSimple />;
            default:
                return null;
        }
    };

    if (selectedGame) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Back button */}
                <div className="p-4">
                    <button
                        onClick={handleBackToHub}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                        <ArrowLeft size={20} />
                        Back to Drill Hub
                    </button>
                </div>
                
                {/* Game component */}
                <div className="px-4 pb-4">
                    {renderGameComponent()}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <Zap size={40} className="text-blue-600" />
                    <h1 className="text-4xl font-bold text-gray-800">Virtual Drill Hub</h1>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Practice emergency response procedures through interactive simulations. 
                    Choose your training mode and learn life-saving skills in a safe, virtual environment.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-green-500">
                    <Trophy size={32} className="text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Emergency Skills</h3>
                    <p className="text-sm text-gray-600">Learn essential safety procedures</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-blue-500">
                    <Clock size={32} className="text-blue-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Quick Training</h3>
                    <p className="text-sm text-gray-600">Complete drills in 5-15 minutes</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-purple-500">
                    <Users size={32} className="text-purple-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Individual Practice</h3>
                    <p className="text-sm text-gray-600">Self-paced learning experience</p>
                </div>
            </div>

            {/* Game Selection */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Training Mode</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                    {drillGames.map((game) => (
                        <div 
                            key={game.id}
                            className={`bg-gradient-to-br ${game.bgGradient} border-2 ${game.borderColor} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                        >
                            {/* Game Header */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-white rounded-xl shadow-md">
                                    {game.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{game.title}</h3>
                                    <p className="text-lg text-gray-600 font-medium">{game.subtitle}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 mb-6 leading-relaxed">{game.description}</p>

                            {/* Features */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Key Features</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {game.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Game Details */}
                            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Difficulty</p>
                                    <p className="text-sm font-bold text-gray-800">{game.difficulty}</p>
                                </div>
                                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Duration</p>
                                    <p className="text-sm font-bold text-gray-800">{game.duration}</p>
                                </div>
                                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Mode</p>
                                    <p className="text-sm font-bold text-gray-800">{game.participants}</p>
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={() => handleStartGame(game.id)}
                                className={`w-full ${game.buttonColor} text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105`}
                            >
                                <Play size={24} />
                                Start Training
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Emergency Tips */}
            <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 border-l-4 border-yellow-500">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={24} className="text-yellow-500" />
                    <h3 className="text-xl font-bold text-gray-800">Quick Emergency Reminders</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <div>
                        <h4 className="font-semibold text-red-600 mb-2">🔥 Fire Emergency:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Check doors before opening (feel for heat)</li>
                            <li>Stay low to avoid smoke inhalation</li>
                            <li>Exit quickly through nearest safe route</li>
                            <li>Meet at designated assembly point</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-orange-600 mb-2">🌍 Earthquake Emergency:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>DROP: Get down immediately</li>
                            <li>COVER: Take cover under sturdy furniture</li>
                            <li>HOLD ON: Protect your head and neck</li>
                            <li>Stay where you are until shaking stops</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-gray-500">
                <p className="text-sm">© 2025 SurakshaEd - Emergency Preparedness Training Platform</p>
            </div>
        </div>
    );
};

export default VirtualDrillHub;