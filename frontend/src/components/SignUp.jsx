import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
} from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    city: "",
    district: "",
    instituteName: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.instituteName.trim()) newErrors.instituteName = "Institute name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      localStorage.setItem("token", "dummy-token");
      localStorage.setItem("role", formData.role.toLowerCase());
      navigate("/admin", { replace: true });
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
              </div>
              <div className="relative">
                <User className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
              </div>
            </div>

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
              <Lock className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>

            <div className="relative">
              <Phone className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
              />
              {errors.contactNumber && <p className="text-red-500 text-xs">{errors.contactNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                />
                {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
              </div>
              <div className="relative">
                <MapPin className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                />
                {errors.district && <p className="text-red-500 text-xs">{errors.district}</p>}
              </div>
            </div>

            <div className="relative">
              <Building2 className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="instituteName"
                placeholder="Institute Name"
                value={formData.instituteName}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
              />
              {errors.instituteName && <p className="text-red-500 text-xs">{errors.instituteName}</p>}
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
              🚀 Create Account
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
