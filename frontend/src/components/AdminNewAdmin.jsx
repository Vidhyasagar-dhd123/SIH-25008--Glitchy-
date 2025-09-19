import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Building2, Mail, Phone, MapPin, User } from 'lucide-react';

export default function AdminNewAdmin() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    instituteName: '',
    address: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [instituteAdmins, setInstituteAdmins] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Fetch existing institute admins (optional - if you have an endpoint)
  const fetchInstituteAdmins = async () => {
    setAdminLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/institute-admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInstituteAdmins(data.data || data || []);
      }
    } catch (err) {
      console.log('Could not fetch institute admins:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchInstituteAdmins();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear messages on input change
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!form.instituteName.trim()) {
      setError('Institute name is required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Invalid email format');
      return false;
    }

    // Phone validation (optional but if provided should be valid)
    if (form.contactNumber && form.contactNumber.length < 10) {
      setError('Contact number should be at least 10 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:3000/api/users/createInstituteAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to create institute admin (${response.status})`);
      }

      setSuccess('Institute Admin created successfully!');
      setForm({
        name: '',
        email: '',
        instituteName: '',
        address: '',
        contactNumber: ''
      });

      // Refresh the list
      fetchInstituteAdmins();

    } catch (err) {
      console.error('Error creating institute admin:', err);
      setError(err.message || 'Failed to create institute admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl rounded-3xl p-8 border border-blue-200"
          >
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-blue-700">Create Institute Admin</h2>
              <p className="text-gray-600 mt-2">Add a new institute administrator to the system</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-center font-medium">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="text-green-600 text-center font-medium">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter admin's full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@institute.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Institute Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Institute Name *
                </label>
                <input
                  type="text"
                  name="instituteName"
                  value={form.instituteName}
                  onChange={handleChange}
                  required
                  placeholder="Enter institute name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Contact Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Institute Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter complete address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                } text-white shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Admin...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Institute Admin
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Sidebar - Recent Institute Admins */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 sticky top-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Recent Institute Admins
            </h3>

            {adminLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : instituteAdmins.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm">No institute admins found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {instituteAdmins.slice(0, 10).map((admin, index) => (
                  <motion.div
                    key={admin._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="font-medium text-gray-800 text-sm">{admin.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{admin.instituteName}</div>
                    <div className="text-xs text-blue-600 mt-1">{admin.email}</div>
                    {admin.contactNumber && (
                      <div className="text-xs text-gray-500 mt-1">{admin.contactNumber}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
