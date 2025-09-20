/**
 * Test script for Institute Admin Student Management API
 * 
 * This script demonstrates how to use the new institute admin features
 * for creating and managing students.
 * 
 * Prerequisites:
 * 1. Server should be running on http://localhost:3000
 * 2. You need a valid JWT token for an institute admin
 * 3. Install node-fetch: npm install node-fetch
 */

// Uncomment the following line if using Node.js < 18
// import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/user/institute';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

// Test 1: Create a single student
async function testCreateStudent() {
  console.log('\n=== Testing Single Student Creation ===');
  
  const studentData = {
    name: 'John Doe',
    email: 'john.doe@test.com',
    rollNumber: 'CS2024001',
    grade: '10th'
  };

  try {
    const response = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify(studentData)
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Student created successfully');
      return result.data.student._id; // Return student ID for other tests
    } else {
      console.log('❌ Failed to create student');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 2: Get all students
async function testGetStudents() {
  console.log('\n=== Testing Get Students ===');
  
  try {
    const response = await fetch(`${BASE_URL}/students?page=1&limit=5`, {
      headers
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ Retrieved ${result.data.students.length} students`);
    } else {
      console.log('❌ Failed to get students');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 3: Search students
async function testSearchStudents() {
  console.log('\n=== Testing Student Search ===');
  
  try {
    const response = await fetch(`${BASE_URL}/students?search=john&grade=10th`, {
      headers
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ Search returned ${result.data.students.length} students`);
    } else {
      console.log('❌ Failed to search students');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 4: Update student
async function testUpdateStudent(studentId) {
  if (!studentId) {
    console.log('\n⏭️  Skipping update test - no student ID available');
    return;
  }

  console.log('\n=== Testing Student Update ===');
  
  const updateData = {
    name: 'John Doe Updated',
    grade: '11th'
  };

  try {
    const response = await fetch(`${BASE_URL}/students/${studentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Student updated successfully');
    } else {
      console.log('❌ Failed to update student');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 5: Create bulk students
async function testBulkCreate() {
  console.log('\n=== Testing Bulk Student Creation ===');
  
  const studentsData = {
    students: [
      {
        name: 'Alice Smith',
        email: 'alice.smith@test.com',
        rollNumber: 'CS2024010',
        grade: '10th'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@test.com',
        rollNumber: 'CS2024011',
        grade: '10th'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@test.com',
        rollNumber: 'CS2024012',
        grade: '11th'
      }
    ]
  };

  try {
    const response = await fetch(`${BASE_URL}/students/bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify(studentsData)
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ Bulk creation completed: ${result.data.summary.successful} successful, ${result.data.summary.failed} failed`);
    } else {
      console.log('❌ Failed bulk creation');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 6: Delete student
async function testDeleteStudent(studentId) {
  if (!studentId) {
    console.log('\n⏭️  Skipping delete test - no student ID available');
    return;
  }

  console.log('\n=== Testing Student Deletion ===');
  
  try {
    const response = await fetch(`${BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
      headers
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Student deleted successfully');
    } else {
      console.log('❌ Failed to delete student');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Institute Admin Student Management API Tests');
  console.log('Make sure to replace AUTH_TOKEN with a valid institute admin JWT token');
  
  if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please set a valid AUTH_TOKEN before running tests');
    return;
  }

  try {
    // Run tests in sequence
    const studentId = await testCreateStudent();
    await testGetStudents();
    await testSearchStudents();
    await testUpdateStudent(studentId);
    await testBulkCreate();
    await testDeleteStudent(studentId);
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Export functions for individual testing
export {
  testCreateStudent,
  testGetStudents,
  testSearchStudents,
  testUpdateStudent,
  testBulkCreate,
  testDeleteStudent,
  runAllTests
};

// Run all tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}