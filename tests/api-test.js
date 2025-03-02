const axios = require('axios');

// Base URL - change this if your server runs on a different port
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let doctorId = '';
let patientId = '';

// Test user credentials
const adminUser = {
  email: 'admin@test.com',
  password: 'admin123'
};

const testDoctor = {
  email: 'doctor@test.com',
  password: 'doctor123',
  name: 'Dr. Test',
  userType: 'doctor',
  specialization: 'General Medicine',
  registrationNumber: 'DOC123'
};

const testPatient = {
  email: 'patient@test.com',
  password: 'patient123',
  name: 'Test Patient',
  userType: 'patient',
  aadhaarNumber: '123456789012'
};

// Helper function to make authenticated requests
const authenticatedRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      headers: { 'x-auth-token': authToken }
    };
    
    if (method === 'get') {
      const response = await axios.get(`${BASE_URL}${endpoint}`, config);
      return response.data;
    } else if (method === 'post') {
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, config);
      return response.data;
    } else if (method === 'put') {
      const response = await axios.put(`${BASE_URL}${endpoint}`, data, config);
      return response.data;
    } else if (method === 'delete') {
      const response = await axios.delete(`${BASE_URL}${endpoint}`, {
        ...config,
        data
      });
      return response.data;
    }
  } catch (error) {
    console.error(`Error in ${method.toUpperCase()} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
async function loginAsAdmin() {
  try {
    console.log('\n🔑 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, adminUser);
    authToken = response.data.token;
    console.log('✅ Admin login successful');
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAdminEndpoints() {
  try {
    console.log('\n📊 Testing admin endpoints...');
    
    // Get system statistics
    const stats = await authenticatedRequest('get', '/admin/statistics');
    console.log('System Statistics:', stats);

    // Get all users
    const users = await authenticatedRequest('get', '/admin/users');
    console.log('Total users:', users.length);

    // Get pending verifications
    const pending = await authenticatedRequest('get', '/admin/pending-verifications');
    console.log('Pending verifications:', pending.length);

  } catch (error) {
    console.error('❌ Admin endpoints test failed');
    throw error;
  }
}

async function testRelationships() {
  try {
    console.log('\n🤝 Testing relationship endpoints...');

    // Create doctor-patient relationship
    await authenticatedRequest('post', '/relationships/doctor-patient', {
      doctorId,
      patientId
    });
    console.log('✅ Relationship created');

    // Get doctor's patients
    const patients = await authenticatedRequest('get', `/relationships/doctor/${doctorId}/patients`);
    console.log('Doctor\'s patients:', patients);

    // Get patient's doctors
    const doctors = await authenticatedRequest('get', `/relationships/patient/${patientId}/doctors`);
    console.log('Patient\'s doctors:', doctors);

    // Remove relationship
    await authenticatedRequest('delete', '/relationships/doctor-patient', {
      doctorId,
      patientId
    });
    console.log('✅ Relationship removed');

  } catch (error) {
    console.error('❌ Relationships test failed');
    throw error;
  }
}

// Main test function
async function runTests() {
  try {
    console.log('🚀 Starting API tests...');

    // Login as admin
    await loginAsAdmin();

    // Test admin endpoints
    await testAdminEndpoints();

    // Test relationships
    await testRelationships();

    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
  }
}

// Run the tests
runTests(); 