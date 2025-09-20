import { useState, useEffect } from 'react';
import { BookOpen, Trophy, ListOrdered, User, FileText, LogOut, School, LayoutDashboard, UserPlus, Settings, Smartphone, Building2, PlusSquare, HelpCircle, Target, MessageSquare, Users, Zap} from 'lucide-react';

const studentAccess = [
  { name: "Module", icon: <BookOpen size={18} /> },
  { name: "Virtual Drill", icon: <Zap size={18} /> },
  { name: "Scoreboard", icon: <Trophy size={18} /> },
  { name: "Leaderboard", icon: <ListOrdered size={18} /> },
  { name: "Student Profile", icon: <User size={18} /> },
  { name: "Posts", icon: <FileText size={18} /> },
  { name: "Logout", icon: <LogOut  size={18} /> }
];

const teacherAccess = [
  { name: "Institution", icon: <School size={18} /> },
  { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Leaderboard", icon: <ListOrdered size={18} /> },
  { name: "Profile", icon: <User size={18} /> },
  { name: "Add Admin", icon: <UserPlus size={18} /> },
  { name: "Posts", icon: <FileText size={18} /> },
  { name: "Management", icon: <Settings size={18} /> },
  { name: "Logout", icon: <LogOut  size={18} /> }
];

const adminAccess = [
  { name: "Application", icon: <Smartphone size={18} /> },
  { name: "Add Module", icon: <PlusSquare size={18} /> },
  { name: "Posts", icon: <FileText size={18} /> },
  { name: "Quizes", icon: <HelpCircle size={18} /> },
  { name: "Add Drill", icon: <Target size={18} /> },
  { name: "Message", icon: <MessageSquare size={18} /> },
  { name: "New Admin", icon: <Users size={18} /> },
  { name: "Institution", icon: <School size={18} /> },
  { name: "Logout", icon: <LogOut  size={18} /> }
];

export default function Access() {
  const [sidebarItems, setSidebarItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    switch(userRole?.toLowerCase()) {
      case 'student':
        setSidebarItems(studentAccess);
        break;
      case 'teacher':
        setSidebarItems(teacherAccess);
        break;
      case 'admin':
        setSidebarItems(adminAccess);
        break;
      default:
        setSidebarItems([]);
    }
  }, []);

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
    // Add navigation or content change logic here
  };

  return (
    <div className="h-screen w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleItemClick(item.name)}
                  className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                    activeItem === item.name
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export { studentAccess, teacherAccess, adminAccess };