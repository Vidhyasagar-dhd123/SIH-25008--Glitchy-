import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    
    // Clear general message
    if (message.content) {
      setMessage({ type: '', content: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', content: 'Please fix the errors above' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store token and role in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        setMessage({ 
          type: 'success', 
          content: 'Account created successfully! Redirecting to dashboard...' 
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/admin'; // Use location.href for full page reload
        }, 1500);
        
      } else {
        throw new Error(data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ 
        type: 'error', 
        content: error.message || 'Failed to create account. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-100 to-indigo-100 px-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-indigo-200">
        
        {/* Left Illustration / Info Section */}
        <motion.div
          className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-10 relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold mb-4">Join SurakshaEd 🚀</h2>
          <p className="text-lg text-indigo-100 leading-relaxed text-center mb-6">
            Empower your school or institute with disaster preparedness training, 
            interactive modules, and real-time safety updates.
          </p>
          <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center text-5xl font-bold shadow-lg">
            SE
          </div>
        </motion.div>

        {/* Right Signup Form */}
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
            <p className="text-gray-600 text-sm">
              Create your account to get started 🚀
            </p>
          </div>

          {/* Message Display */}
          {message.content && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.content}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="relative">
              <Mail className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm transition-colors ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="relative">
              <GraduationCap className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                disabled={loading}
              >
                <option value="student">👨‍🎓 Student</option>
                <option value="institute-admin">👨‍🏫 Institute Admin</option>
                <option value="admin">👨‍💼 Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 disabled:from-indigo-400 disabled:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  🚀 Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-700 font-semibold ml-2 hover:underline"
              >
                Sign in here
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

export default SignUpPage;
