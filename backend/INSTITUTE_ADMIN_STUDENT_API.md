# Institute Admin Student Management API

## Overview
This API allows Institute Admins to create and manage students within their institute. All operations are properly authenticated and restricted to the institute admin's own students.

## Base URL
```
http://localhost:3000/api/user/institute
```

## Authentication
All endpoints require authentication via JWT token with `institute-admin` role:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Single Student
```
POST /api/user/institute/students
```
**Description:** Create a new student in the institute admin's institute

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "rollNumber": "CS2024001",
  "grade": "10th",
  "password": "optional_password" // If not provided, auto-generated
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "student": {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "rollNumber": "CS2024001",
      "grade": "10th",
      "institute": "institute_admin_id",
      "createdBy": "institute_admin_id",
      "role": "student",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "defaultPassword": "CS2024001@institutename" // Only shown if auto-generated
  }
}
```

### 2. Get My Students
```
GET /api/user/institute/students
```
**Description:** Get all students belonging to the institute admin's institute

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 10) - Number of items per page
- `search` (optional) - Search term for name, email, or roll number
- `grade` (optional) - Filter by specific grade

**Response:**
```json
{
  "success": true,
  "message": "Students fetched successfully",
  "data": {
    "students": [
      {
        "_id": "student_id",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "rollNumber": "CS2024001",
        "grade": "10th",
        "institute": "institute_admin_id",
        "createdBy": {
          "_id": "institute_admin_id",
          "name": "Institute Admin Name",
          "email": "admin@institute.com"
        },
        "role": "student",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### 3. Update Student
```
PUT /api/user/institute/students/:id
```
**Description:** Update a student's information (only students in admin's institute)

**Parameters:**
- `id` - Student ID (MongoDB ObjectId)

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "email": "updated.email@example.com",
  "rollNumber": "CS2024002",
  "grade": "11th",
  "password": "new_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "_id": "student_id",
    "name": "Updated Name",
    // ... updated student data
  }
}
```

### 4. Delete Student
```
DELETE /api/user/institute/students/:id
```
**Description:** Delete a student (only students in admin's institute)

**Parameters:**
- `id` - Student ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### 5. Create Bulk Students
```
POST /api/user/institute/students/bulk
```
**Description:** Create multiple students at once (max 100 students)

**Request Body:**
```json
{
  "students": [
    {
      "name": "Student 1",
      "email": "student1@example.com",
      "rollNumber": "CS2024001",
      "grade": "10th",
      "password": "optional"
    },
    {
      "name": "Student 2",
      "email": "student2@example.com",
      "rollNumber": "CS2024002",
      "grade": "10th"
    }
    // ... up to 100 students
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "85 students created successfully, 15 failed",
  "data": {
    "successful": [
      {
        "index": 0,
        "student": {
          "_id": "student_id",
          "name": "Student 1",
          // ... student data
        },
        "defaultPassword": "CS2024001@institutename" // If auto-generated
      }
    ],
    "failed": [
      {
        "index": 1,
        "data": {
          "name": "Student 2",
          "email": "duplicate@example.com"
        },
        "error": "User with this email already exists"
      }
    ],
    "summary": {
      "total": 100,
      "successful": 85,
      "failed": 15
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: name, email, rollNumber, grade"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Only institute admins can create students"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Student not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Detailed error message (in development mode only)"
}
```

## Business Rules

### Password Generation
- If no password is provided, a default password is generated using the format: `{rollNumber}@{instituteName}`
- Example: For roll number "CS2024001" and institute "ABC College", password would be "CS2024001@abccollege"

### Validation Rules
1. **Required Fields:** name, email, rollNumber, grade
2. **Email:** Must be unique across all users
3. **Roll Number:** Must be unique within the same institute
4. **Email Format:** Must be a valid email format
5. **Access Control:** Institute admins can only manage students in their own institute

### Bulk Operations
- Maximum 100 students can be created at once
- Each student is processed individually
- Failed creations don't stop the process
- Detailed success/failure report is provided

## Security Features
- JWT-based authentication required
- Role-based access control (institute-admin only)
- Students are automatically linked to the creating institute admin
- Password hashing using bcrypt
- Input validation and sanitization
- Comprehensive error logging

## Usage Examples

### Creating a Single Student
```bash
curl -X POST "http://localhost:3000/api/user/institute/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "rollNumber": "CS2024001",
    "grade": "10th"
  }'
```

### Getting Students with Search
```bash
curl -X GET "http://localhost:3000/api/user/institute/students?search=john&grade=10th&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Bulk Student Creation
```bash
curl -X POST "http://localhost:3000/api/user/institute/students/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "students": [
      {
        "name": "Student 1",
        "email": "student1@example.com",
        "rollNumber": "CS2024001",
        "grade": "10th"
      },
      {
        "name": "Student 2",
        "email": "student2@example.com",
        "rollNumber": "CS2024002",
        "grade": "10th"
      }
    ]
  }'
```

## Integration Notes
- All student creation automatically links students to the creating institute admin
- Students can later log in using their email and generated/provided password
- The institute admin ID is stored in both `institute` and `createdBy` fields for proper tracking
- All operations are logged for audit purposes