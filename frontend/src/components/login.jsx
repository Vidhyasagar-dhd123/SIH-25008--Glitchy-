// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, GraduationCap } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Save dummy token and role
      localStorage.setItem("token", "dummy-token");
      localStorage.setItem("role", formData.role.toLowerCase());
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-100 px-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-indigo-200">
        
        {/* Left Illustration / Info Section */}
        <motion.div
          className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-10 relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold mb-4">Welcome Back 🚀</h2>
          <p className="text-lg text-indigo-100 leading-relaxed text-center mb-6">
            Access your SurakshaEd dashboard to manage disaster preparedness training,
            interactive learning modules, and real-time alerts.
          </p>
          <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center text-5xl font-bold shadow-lg">
            SE
          </div>
        </motion.div>

        {/* Right Login Form */}
        <motion.div
          className="p-8 lg:p-10 overflow-y-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center mr-2 shadow-md">
                <span className="text-white font-bold text-lg">SE</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">SurakshaEd</span>
            </div>
            <p className="text-gray-600 text-sm">Sign in to continue 🚀</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            <div className="relative">
              <GraduationCap className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
              >
                <option value="Student">👨‍🎓 Student</option>
                <option value="Teacher">👨‍🏫 Teacher</option>
                <option value="Admin">👨‍💼 Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md"
            >
              🔐 Login
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-700 font-semibold ml-2 hover:underline"
              >
                Sign up here
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Secure • Trusted • For Schools & Colleges in India 🇮🇳
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
