import React, { useEffect, useState } from "react";
import Sidebar from "../components/menubar";
import Content from "../components/contentpage";
import Access, { studentAccess, teacherAccess, adminAccess } from '../components/access';
import AlertEDLogo from "../assets/AlertED-1.jpg";

export default function Admin() {
  const [active, setActive] = useState("Dashboard");
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [sidebarAccess, setSidebarAccess] = useState([]);

  // Application modal state
  const [showAppModal, setShowAppModal] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState("");
  const [appSuccess, setAppSuccess] = useState(false);
  const [application, setApplication] = useState({
    name: "",
    email: "",
    phone: "",
    instituteCode: "",
    institute: "",
    address: ""
  });

  useEffect(() => {
      const storedToken = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");
      
      setToken(storedToken);
      setRole(storedRole);

      switch(storedRole?.toLowerCase()) {
          case 'student':
              setSidebarAccess(studentAccess);
              break;
          case 'institute-admin':
              setSidebarAccess(teacherAccess);
              break;
          case 'admin':
              setSidebarAccess(adminAccess);
              break;
          default:
              setSidebarAccess([]);
      }
  }, []);

  const handleAppChange = (e) => {
    setApplication({ ...application, [e.target.name]: e.target.value });
    setAppError("");
    setAppSuccess(false);
  };

  const submitApplication = async (e) => {
    e && e.preventDefault();
    setAppError("");
    setAppSuccess(false);
    // basic validation
    if (!application.name.trim() || !application.email.trim() || !application.phone.trim() || !application.institute.trim()) {
      setAppError("Name, email, phone and institute are required");
      return;
    }
    setAppLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/applications", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || `Failed to submit application (${res.status})`);
      setAppSuccess(true);
      setApplication({ name: "", email: "", phone: "", instituteCode: "", institute: "", address: "" });
      setTimeout(() => setShowAppModal(false), 1200);
    } catch (err) {
      console.error("Submit application error:", err);
      setAppError(err.message || "Failed to submit application");
    } finally {
      setAppLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">Please login first to access the admin dashboard.</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navbar */}
      <nav className="sticky top-0 w-full bg-white/90 backdrop-blur border-b border-gray-200 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <img 
                src={AlertEDLogo} 
                alt="AlertED Logo" 
                className="h-10 w-auto object-contain rounded-2xl"
              />
              <span className="text-2xl font-extrabold text-[#003e61] tracking-wide">
                AlertED
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
                <a href="#faq" className="text-gray-600 hover:text-blue-500 font-semibold transition-colors px-2">
                  FAQ's
                </a>
                <a href="#emergency" className="text-gray-600 hover:text-blue-500 font-semibold transition-colors px-2">
                  Emergency
                </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {/* Apply Institute button opens application modal */}
              <button
                onClick={() => setShowAppModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md"
              >
                Apply Institute
              </button>

              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Application Modal */}
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowAppModal(false)} />
          <div className="relative bg-white shadow-xl rounded-3xl p-6 z-10 w-full max-w-xl border border-blue-200">
            <h3 className="text-xl font-bold text-blue-700 mb-3 text-center">Apply to Register Institute</h3>
            {appError && <div className="mb-3 text-red-600 text-center">{appError}</div>}
            {appSuccess && <div className="mb-3 text-green-600 text-center">Application submitted!</div>}
            <form onSubmit={submitApplication} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input name="name" value={application.name} onChange={handleAppChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input name="email" value={application.email} onChange={handleAppChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input name="phone" value={application.phone} onChange={handleAppChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Institute Name</label>
                <input name="institute" value={application.institute} onChange={handleAppChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Institute Code (optional)</label>
                <input name="instituteCode" value={application.instituteCode} onChange={handleAppChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Address</label>
                <textarea name="address" value={application.address} onChange={handleAppChange} rows={3} className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowAppModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg">Cancel</button>
                <button type="submit" disabled={appLoading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60">
                  {appLoading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar adminAccess={sidebarAccess} setActive={setActive} />
        <div className="flex-1 overflow-y-auto">
          <Content activePage={active} />
        </div>
      </div>
    </div>
  );
}