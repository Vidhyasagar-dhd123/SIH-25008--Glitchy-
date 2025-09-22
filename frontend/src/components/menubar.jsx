import React from "react";
import { LayoutDashboard, User, BookOpen, Trophy, ListOrdered, FileText, School, UserPlus, Settings, Building2, PlusSquare, HelpCircle, Hammer, MessageSquare, GraduationCap, Zap, Trash2 } from 'lucide-react';

const icons = {
  Dashboard: <LayoutDashboard size={20} />,
  "Student Profile": <User size={20} />,
  Module: <BookOpen size={20} />,
  "Virtual Drill": <Zap size={20} />,
  Scoreboard: <Trophy size={20} />,
  Leaderboard: <ListOrdered size={20} />,
  Posts: <FileText size={20} />,
  Institution: <School size={20} />,
  "Add Admin": <UserPlus size={20} />,
  "Add Student": <GraduationCap size={20} />, // Added icon for Add Student
  Management: <Settings size={20} />,
  "Add Institute": <Building2 size={20} />,
  "Add Module": <PlusSquare size={20} />,
  "Add Lesson": <PlusSquare size={20} />, // added icon mapping
  "Delete Lesson": <Trash2 size={20} />, // added icon mapping for delete lesson
  Quizes: <HelpCircle size={20} />,
  "Add Drill": <Hammer size={20} />,
  Message: <MessageSquare size={20} />,
  Logout: <User size={20} />
};

import { useState } from "react";

export default function Sidebar({ adminAccess, setActive }) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  // Add Logout for student role
  const role = localStorage.getItem("role")?.toLowerCase();
  // Prevent duplicate Logout button if already present in adminAccess
  let menuItems = adminAccess;
  
  // Ensure admin / institute-admin see "Add Lesson" in sidebar (append if not present)
  if (role === "admin" || role === "institute-admin") {
    const hasAddLesson = menuItems.some(item => item?.name === "Add Lesson");
    if (!hasAddLesson) {
      menuItems = [...menuItems, { name: "Add Lesson" }];
    }
    
    // Also add "Delete Lesson" for admin and institute-admin
    const hasDeleteLesson = menuItems.some(item => item?.name === "Delete Lesson");
    if (!hasDeleteLesson) {
      menuItems = [...menuItems, { name: "Delete Lesson" }];
    }
  }
  
  // Add "Add Student" functionality for institute admins
  if (role === "institute-admin") {
    const hasAddStudent = menuItems.some(item => item?.name === "Add Student");
    if (!hasAddStudent) {
      menuItems = [...menuItems, { name: "Add Student" }];
    }
  }
  
  if (role === "student") {
    const hasLogout = adminAccess.some(item => item.name === "Logout");
    if (!hasLogout) {
      menuItems = [...adminAccess, { name: "Logout" }];
    }
  }

  const handleClick = (name) => {
    if (name === "Logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/"; // Redirect to home page
      return;
    }
    setActiveItem(name);
    setActive(name);
  };
  return (
    <aside className="w-72 bg-gradient-to-b from-blue-50 to-blue-100 border-r shadow-xl p-6 min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-8 text-blue-700 tracking-wide flex items-center gap-2">
        <span className=" text-black px-2 py-1 rounded-lg">Menu</span>
      </h2>
      <ul className="space-y-3 text-gray-800 font-medium flex-1">
        {menuItems.map((value, key) => (
          <li
            onClick={() => handleClick(value?.name)}
            key={key}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 shadow-sm group ${activeItem === value?.name ? "bg-blue-500 text-white" : "hover:bg-blue-500 hover:text-white"}`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">
              {icons[value?.name] || <LayoutDashboard size={20} />}
            </span>
            <span className="text-base font-semibold">{value?.name}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center text-xs text-gray-400">© 2025 SurakshaEd</div>
    </aside>
  );
}