import React, { useState, useEffect } from "react";
import { User, BookOpen, Trophy, AlertTriangle, School } from "lucide-react";

// Example avatar image (replace with dynamic or actual image as needed)
import avatar from "../assets/img1.jpg";

export default function StudentProfile() {
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchProfileData();
	}, []);

	const fetchProfileData = async () => {
		try {
			setLoading(true);
			setError(null);

			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No authentication token found');
			}

			const response = await fetch('http://localhost:3000/api/user/profile', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			
			if (result.success) {
				setProfileData(result.data);
			} else {
				throw new Error(result.message || 'Failed to fetch profile data');
			}

		} catch (err) {
			console.error('Error fetching profile:', err);
			setError(err.message || 'Failed to load profile data');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-100">
				<div className="animate-pulse">
					<div className="flex items-center gap-6 mb-6">
						<div className="w-20 h-20 bg-gray-200 rounded-full"></div>
						<div>
							<div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-24"></div>
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-4 bg-gray-200 rounded"></div>
						<div className="h-8 bg-gray-200 rounded"></div>
						<div className="grid grid-cols-3 gap-4">
							<div className="h-16 bg-gray-200 rounded"></div>
							<div className="h-16 bg-gray-200 rounded"></div>
							<div className="h-16 bg-gray-200 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-100">
				<div className="text-center">
					<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={fetchProfileData}
						className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (!profileData) {
		return (
			<div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-100">
				<div className="text-center">
					<User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600">No profile data available</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-100">
			<div className="flex items-center gap-6 mb-6">
				<img
					src={avatar}
					alt="Student Avatar"
					className="w-20 h-20 rounded-full border-4 border-blue-200 object-cover shadow"
				/>
				<div>
					<h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
					<div className="flex items-center gap-2 text-sm font-medium text-gray-600">
						<School className="w-4 h-4" />
						<span>{profileData.grade}</span>
					</div>
					{profileData.rollNumber && (
						<p className="text-xs text-gray-500">Roll: {profileData.rollNumber}</p>
					)}
					{profileData.instituteName && (
						<p className="text-xs text-gray-500">{profileData.instituteName}</p>
					)}
				</div>
			</div>
			
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm text-gray-600 font-medium">Preparedness Score</span>
					<span className="text-lg font-bold text-blue-600">{profileData.preparednessScore || 0}%</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="bg-blue-500 h-2 rounded-full transition-all duration-300"
						style={{ width: `${profileData.preparednessScore || 0}%` }}
					></div>
				</div>
			</div>
			
			<div className="grid grid-cols-3 gap-4 mb-6 text-center">
				<div className="p-2 bg-blue-50 rounded-lg">
					<BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
					<div className="text-xl font-extrabold text-gray-900">{profileData.modulesCompleted || 0}</div>
					<div className="text-xs text-gray-600">Modules Completed</div>
				</div>
				<div className="p-2 bg-green-50 rounded-lg">
					<Trophy className="w-5 h-5 text-green-600 mx-auto mb-1" />
					<div className="text-xl font-extrabold text-gray-900">{profileData.scheduledDrills || 0}</div>
					<div className="text-xs text-gray-600">Drills Completed</div>
				</div>
				<div className="p-2 bg-red-50 rounded-lg">
					<AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
					<div className="text-xl font-extrabold text-gray-900">{profileData.liveAlerts || 0}</div>
					<div className="text-xs text-gray-600">Live Alerts</div>
				</div>
			</div>
			
			<div className="flex flex-col gap-2">
				<span className="text-sm text-gray-500">
					Progress: {profileData.modulesCompleted || 0} / {profileData.totalModules || 0} modules
				</span>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
						style={{ 
							width: `${profileData.totalModules ? 
								Math.round((profileData.modulesCompleted / profileData.totalModules) * 100) : 0}%` 
						}}
					></div>
				</div>
			</div>

			{profileData.quizAttempts !== undefined && (
				<div className="mt-4 pt-4 border-t border-gray-100">
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-600">Quiz Attempts:</span>
						<span className="font-semibold text-gray-900">{profileData.quizAttempts}</span>
					</div>
				</div>
			)}
		</div>
	);
}
