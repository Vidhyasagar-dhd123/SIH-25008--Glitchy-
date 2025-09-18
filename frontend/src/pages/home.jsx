import { useState } from 'react';
import ImageSlider from "../components/ImageSlider";
import SignUpPage from '../components/SignUp';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img4 from '../assets/img4.jpg';


export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
    
   const slides = [
    { url: img1 },
   { url: img2 },
   { url: img3 },
   { url: img4 }
  ];
  const containerStyles = {
    width: "900px",
    height: "300px",
    margin: "0 auto",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Modal */}
      {showLogin && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto"
          onClick={() => setShowLogin(false)}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative w-full h-full"
          >
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-white text-xl z-50 hover:text-gray-300"
            >
              ✕
            </button>
            <SignUpPage />
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 text-white px-3 py-2 rounded-lg font-bold text-lg">
                SE
              </div>
              <span className="text-xl font-semibold text-gray-900">SurakshaEd</span>
            </div>
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
                Features
              </a>
              <a href="#students" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
                Students
              </a>
              <a href="#teachers" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
                Teachers
              </a>
              <a href="#admin" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
                Admin
              </a>
            </div>
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowLogin(true)}
                className="text-gray-600 hover:text-blue-500 px-4 py-2 font-medium transition-colors"
              >
                Login
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div>
       <br></br>
      <div style={containerStyles}>
        <ImageSlider slides={slides} />
      </div>
    </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <span className="text-lg">🛡</span>
                <span>For Schools & Colleges in India</span>
              </div>
              {/* Title - Reduced size */}
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                SurakshaEd — Disaster Preparedness, Education, and Drills
              </h1>
              {/* Description */}
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
                A modern platform to integrate disaster management education into the curriculum with 
                interactive modules, virtual drills, region-specific alerts, and real-time communications.
              </p>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                  Explore Student Dashboard
                </button>
                <button className="border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-lg text-base font-semibold transition-all">
                  View Features
                </button>
              </div>
              {/* Server Status */}
              <p className="text-gray-500 text-sm">Hello from Express server</p>
            </div>

            {/* Hero Right - Enhanced Preparedness Widget */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-100 w-full max-w-md hover:shadow-2xl transition-shadow duration-300">
                
                {/* Widget Title */}
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-2xl animate-pulse">💓</span>
                  <h3 className="text-lg font-bold text-gray-900">Live Preparedness Snapshot</h3>
                </div>
                {/* Score Section */}
                <div className="mb-8">
                  <div className="text-sm text-gray-600 mb-2">School Preparedness Score</div>
                  <div className="text-3xl font-extrabold text-green-600 mb-4">72%</div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{width: '72%'}}></div>
                  </div>
                  {/* Status Indicators */}
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Green: All Clear
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      Yellow: Advisory
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                      Red: Critical
                    </span>
                  </div>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-xl font-extrabold text-gray-900">18</div>
                    <div className="text-xs text-gray-600">Active Modules</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-xl font-extrabold text-gray-900">6</div>
                    <div className="text-xs text-gray-600">Scheduled Drills</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-xl font-extrabold text-gray-900">3</div>
                    <div className="text-xs text-gray-600">Live Alerts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stakeholders Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Built for Every Stakeholder
            </h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Role-based dashboards streamline learning, practice, and oversight — for Students, Teachers, and Admins.
            </p>
          </div>

          {/* Stakeholder Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Students Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎓</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                Students
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                Interactive modules, quizzes, and gamified leaderboards to make preparedness engaging.
              </p>
              <div className="flex items-center space-x-2 text-blue-600 font-medium text-sm">
                <span className="text-lg">📊</span>
                <span>Preparedness Score & progress tracking</span>
              </div>
            </div>

            {/* Teachers Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                Teachers
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                Assign modules, schedule virtual drills, and view class performance analytics in one place.
              </p>
              <div className="flex items-center space-x-2 text-green-600 font-medium text-sm">
                <span className="text-lg">📈</span>
                <span>Real-time drill monitoring</span>
              </div>
            </div>

            {/* Admins Card */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group md:col-span-2 lg:col-span-1">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚠</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">
                Admins
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                Manage institution-wide content, publish alerts, and broadcast emergency communications instantly.
              </p>
              <div className="flex items-center space-x-2 text-red-600 font-medium text-sm">
                <span className="text-lg">🚨</span>
                <span>Live/Test alert controls</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="bg-gradient-to-r from-gray-100 to-blue-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-lg border border-gray-200">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-12">
              
              {/* CTA Content */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Ready to run your next drill?
                </h2>
                <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                  Kick off with our sample Student Dashboard and see how SurakshaEd works end-to-end.
                </p>
              </div>
              {/* CTA Button */}
              <div className="flex-shrink-0">
                <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Open Student Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}