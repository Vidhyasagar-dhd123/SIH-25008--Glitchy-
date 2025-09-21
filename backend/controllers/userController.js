import { User, Student, InstituteAdmin, Admin } from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";

// Add logger
const log = {
  info: (...args) => console.info(new Date().toISOString(), "[userController]", ...args),
  warn: (...args) => console.warn(new Date().toISOString(), "[userController]", ...args),
  error: (...args) => console.error(new Date().toISOString(), "[userController]", ...args),
};
// Create Institute Admin

const createInstituteAdmin = async (req, res) => {
  try {
    const { name, email, instituteName, address, contactNumber } = req.body;
    const createdBy = req.user?._id; // assuming you attach user info in auth middleware

    // Validate required fields
    if (!name || !email || !instituteName) {
      return res.status(400).json({ error: "Missing required fields: name, email, password, instituteName" });
    }

    const instituteAdmin = new InstituteAdmin({
      name,
      email,
      instituteName,
      address,
      contactNumber,
      createdBy
    });

    const savedAdmin = await instituteAdmin.save();
    res.status(201).json({ message: "Institute Admin created", user: savedAdmin });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, rollNumber, grade } = req.body;
    const createdBy = req.user?.id; // Institute admin creating the student
    const userRole = req.user?.role;

    log.info("Creating student", { createdBy, userRole, email });

    // Validate required fields
    if (!name || !email || !rollNumber || !grade) {
      log.warn("Student creation failed - missing required fields", { name, email, rollNumber, grade });
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: name, email, rollNumber, grade" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log.warn("Student creation failed - invalid email format", { email });
      return res.status(400).json({ 
        success: false,
        error: "Invalid email format" 
      });
    }

    // Check if user creating student is institute admin
    if (userRole !== 'institute-admin') {
      log.warn("Student creation failed - unauthorized user", { userRole, createdBy });
      return res.status(403).json({ 
        success: false,
        error: "Only institute admins can create students" 
      });
    }

    // Get institute admin details
    const instituteAdmin = await InstituteAdmin.findById(createdBy);
    if (!instituteAdmin) {
      log.warn("Student creation failed - institute admin not found", { createdBy });
      return res.status(404).json({ 
        success: false,
        error: "Institute admin not found" 
      });
    }

    // Check if student with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      log.warn("Student creation failed - email already exists", { email });
      return res.status(400).json({ 
        success: false,
        error: "User with this email already exists" 
      });
    }

    // Check if student with roll number already exists in the same institute
    const existingStudent = await Student.findOne({ 
      rollNumber, 
      institute: createdBy 
    });
    if (existingStudent) {
      log.warn("Student creation failed - roll number already exists", { rollNumber, institute: createdBy });
      return res.status(400).json({ 
        success: false,
        error: "Student with this roll number already exists in your institute" 
      });
    }

    const student = new Student({
      name,
      email,
      rollNumber,
      grade,
      institute: createdBy, // Link to institute admin
      createdBy
    });

    const savedStudent = await student.save();
    log.info("Student created successfully", { studentId: savedStudent._id, institute: createdBy });

    res.status(201).json({ 
      success: true,
      message: "Student created successfully", 
      data: {
        student: savedStudent
      }
    });

  } catch (err) {
    log.error("Error creating student:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get students by institute admin
const getMyStudents = async (req, res) => {
  try {
    const instituteAdminId = req.user?.id;
    const userRole = req.user?.role;
    const { page = 1, limit = 10, search, grade } = req.query;

    log.info("Getting students for institute admin", { instituteAdminId, userRole });

    // Check if user is institute admin
    if (userRole !== 'institute-admin') {
      log.warn("Get students failed - unauthorized user", { userRole, instituteAdminId });
      return res.status(403).json({ 
        success: false,
        error: "Only institute admins can view their students" 
      });
    }

    // Build filter
    const filter = { institute: instituteAdminId };
    
    // Add grade filter if specified
    if (grade) {
      filter.grade = grade;
    }

    // Add search filter if specified
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      Student.find(filter)
        .select('-password') // Don't include password in response
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(filter)
    ]);

    log.info("Students fetched successfully", { count: students.length, total });

    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (err) {
    log.error("Error fetching students:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update student by institute admin
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const instituteAdminId = req.user?.id;
    const userRole = req.user?.role;
    const updates = req.body;

    log.info("Updating student", { studentId: id, instituteAdminId, userRole });

    // Check if user is institute admin
    if (userRole !== 'institute-admin') {
      log.warn("Update student failed - unauthorized user", { userRole, instituteAdminId });
      return res.status(403).json({ 
        success: false,
        error: "Only institute admins can update their students" 
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "No updates provided" 
      });
    }

    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid student ID format" 
      });
    }

    // Find student and verify it belongs to the institute admin
    const student = await Student.findById(id);
    if (!student) {
      log.warn("Update student failed - student not found", { studentId: id });
      return res.status(404).json({ 
        success: false,
        error: "Student not found" 
      });
    }

    if (student.institute?.toString() !== instituteAdminId) {
      log.warn("Update student failed - student not in institute", { studentId: id, instituteAdminId });
      return res.status(403).json({ 
        success: false,
        error: "Student does not belong to your institute" 
      });
    }

    // Remove fields that shouldn't be updated
    delete updates.institute;
    delete updates.createdBy;
    delete updates._id;
    delete updates.__v;

    // Hash password if being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Check for duplicate roll number if being updated
    if (updates.rollNumber && updates.rollNumber !== student.rollNumber) {
      const existingStudent = await Student.findOne({ 
        rollNumber: updates.rollNumber, 
        institute: instituteAdminId,
        _id: { $ne: id }
      });
      if (existingStudent) {
        log.warn("Update student failed - roll number already exists", { rollNumber: updates.rollNumber });
        return res.status(400).json({ 
          success: false,
          error: "Student with this roll number already exists in your institute" 
        });
      }
    }

    // Check for duplicate email if being updated
    if (updates.email && updates.email !== student.email) {
      const existingUser = await User.findOne({ 
        email: updates.email,
        _id: { $ne: id }
      });
      if (existingUser) {
        log.warn("Update student failed - email already exists", { email: updates.email });
        return res.status(400).json({ 
          success: false,
          error: "User with this email already exists" 
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');

    log.info("Student updated successfully", { studentId: id });

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent
    });

  } catch (err) {
    log.error("Error updating student:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete student by institute admin
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const instituteAdminId = req.user?.id;
    const userRole = req.user?.role;

    log.info("Deleting student", { studentId: id, instituteAdminId, userRole });

    // Check if user is institute admin
    if (userRole !== 'institute-admin') {
      log.warn("Delete student failed - unauthorized user", { userRole, instituteAdminId });
      return res.status(403).json({ 
        success: false,
        error: "Only institute admins can delete their students" 
      });
    }

    // Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid student ID format" 
      });
    }

    // Find student and verify it belongs to the institute admin
    const student = await Student.findById(id);
    if (!student) {
      log.warn("Delete student failed - student not found", { studentId: id });
      return res.status(404).json({ 
        success: false,
        error: "Student not found" 
      });
    }

    if (student.institute?.toString() !== instituteAdminId) {
      log.warn("Delete student failed - student not in institute", { studentId: id, instituteAdminId });
      return res.status(403).json({ 
        success: false,
        error: "Student does not belong to your institute" 
      });
    }

    await Student.findByIdAndDelete(id);
    log.info("Student deleted successfully", { studentId: id });

    res.status(200).json({
      success: true,
      message: "Student deleted successfully"
    });

  } catch (err) {
    log.error("Error deleting student:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Create bulk students
const createBulkStudents = async (req, res) => {
  try {
    const { students } = req.body; // Array of student objects
    const createdBy = req.user?.id;
    const userRole = req.user?.role;

    log.info("Creating bulk students", { createdBy, userRole, count: students?.length });

    // Check if user is institute admin
    if (userRole !== 'institute-admin') {
      log.warn("Bulk student creation failed - unauthorized user", { userRole, createdBy });
      return res.status(403).json({ 
        success: false,
        error: "Only institute admins can create bulk students" 
      });
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Students array is required and must not be empty" 
      });
    }

    if (students.length > 100) {
      return res.status(400).json({ 
        success: false,
        error: "Cannot create more than 100 students at once" 
      });
    }

    // Get institute admin details
    const instituteAdmin = await InstituteAdmin.findById(createdBy);
    if (!instituteAdmin) {
      log.warn("Bulk student creation failed - institute admin not found", { createdBy });
      return res.status(404).json({ 
        success: false,
        error: "Institute admin not found" 
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      const { name, email, rollNumber, grade, password } = studentData;

      try {
        // Validate required fields
        if (!name || !email || !rollNumber || !grade) {
          errors.push({
            index: i,
            data: studentData,
            error: "Missing required fields: name, email, rollNumber, grade"
          });
          continue;
        }

        // Check if student with email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          errors.push({
            index: i,
            data: studentData,
            error: "User with this email already exists"
          });
          continue;
        }

        // Check if student with roll number already exists in the same institute
        const existingStudent = await Student.findOne({ 
          rollNumber, 
          institute: createdBy 
        });
        if (existingStudent) {
          errors.push({
            index: i,
            data: studentData,
            error: "Student with this roll number already exists in your institute"
          });
          continue;
        }

        // Generate default password if not provided
        const studentPassword = password || `${rollNumber}@${instituteAdmin.instituteName?.replace(/\s+/g, '').toLowerCase() || 'institute'}`;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(studentPassword, 10);

        const student = new Student({
          name,
          email,
          password: hashedPassword,
          rollNumber,
          grade,
          institute: createdBy,
          createdBy
        });

        const savedStudent = await student.save();
        
        // Don't return password in response
        const { password: _, ...studentResponse } = savedStudent.toObject();
        
        results.push({
          index: i,
          student: studentResponse,
          defaultPassword: password ? undefined : studentPassword
        });

      } catch (err) {
        errors.push({
          index: i,
          data: studentData,
          error: err.message
        });
      }
    }

    log.info("Bulk student creation completed", { 
      successful: results.length, 
      failed: errors.length 
    });

    res.status(results.length > 0 ? 201 : 400).json({
      success: results.length > 0,
      message: `${results.length} students created successfully, ${errors.length} failed`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: students.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (err) {
    log.error("Error in bulk student creation:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


  

const updateUser = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }
  const { id } = req.params;
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No updates provided" });
  }

  try {
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { 
  createStudent, 
  createInstituteAdmin, 
  updateUser, 
  deleteUser,
  getMyStudents,
  updateStudent,
  deleteStudent,
  createBulkStudents
};
