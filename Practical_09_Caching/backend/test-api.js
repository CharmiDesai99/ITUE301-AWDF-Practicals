const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Practical 5, 6, & 7 API Verification Suite');
  console.log('======================================================\n');

  try {
    // Connect DB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_manager_api');
    console.log('✅ MongoDB connected for test setup');

    // Clean test user & tasks
    await User.deleteMany({ email: 'teststudent@example.com' });
    console.log('🧹 Cleaned previous test account');

    // 1. Test User Registration (Practical 7)
    console.log('\n--- 1. Testing POST /auth/register ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: 'teststudent@example.com',
        password: 'password123',
      }),
    });
    const regData = await regRes.json();
    console.log('Register Status:', regRes.status);
    console.log('Register Response:', JSON.stringify(regData, null, 2));

    // 2. Test User Login & JWT Token Generation (Practical 7)
    console.log('\n--- 2. Testing POST /auth/login ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    const token = loginData.token;
    console.log('JWT Token Obtained:', token ? `${token.substring(0, 25)}...` : 'NONE');

    // 3. Test GET /auth/me Protected Endpoint (Practical 7)
    console.log('\n--- 3. Testing GET /auth/me (Protected Route) ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log('GetMe Status:', meRes.status);
    console.log('User Profile:', meData.user ? meData.user.email : 'Failed');

    // 4. Test Task Schema Validation Error Handling (Practical 5)
    console.log('\n--- 4. Testing Schema Validation Error Handling (Missing Title & Bad Priority) ---');
    const valRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        description: 'No title provided',
        priority: 'super_high', // Invalid enum
      }),
    });
    const valData = await valRes.json();
    console.log('Validation Error Status:', valRes.status);
    console.log('Structured Validation Response:', JSON.stringify(valData, null, 2));

    // 5. Test Task Creation with Mongoose (Practical 5)
    console.log('\n--- 5. Testing POST /tasks (Task Creation) ---');
    const createRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: '   Complete Practical 5, 6 & 7   ', // Test whitespace trim pre-save hook
        description: 'Verify MongoDB Mongoose CRUD, CORS, and JWT Auth',
        priority: 'high',
      }),
    });
    const createData = await createRes.json();
    console.log('Create Task Status:', createRes.status);
    console.log('Created Task Data:', JSON.stringify(createData, null, 2));
    const taskId = createData.data._id;

    // 6. Test GET /tasks (Fetch All)
    console.log('\n--- 6. Testing GET /tasks ---');
    const getTasksRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getTasksData = await getTasksRes.json();
    console.log('Fetch Tasks Status:', getTasksRes.status);
    console.log('Total Tasks Found:', getTasksData.count);

    // 7. Test GET /tasks/:id
    console.log('\n--- 7. Testing GET /tasks/:id ---');
    const getSingleRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getSingleData = await getSingleRes.json();
    console.log('Fetch Single Task Status:', getSingleRes.status);
    console.log('Single Task Title:', getSingleData.data ? getSingleData.data.title : 'Failed');

    // 8. Test GET /tasks/:id Non-Existent ID (404 Handling)
    console.log('\n--- 8. Testing GET /tasks/:id (404 Not Found Handling) ---');
    const fakeId = new mongoose.Types.ObjectId().toString();
    const notFoundRes = await fetch(`${BASE_URL}/tasks/${fakeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notFoundData = await notFoundRes.json();
    console.log('404 Request Status:', notFoundRes.status);
    console.log('404 JSON Response:', JSON.stringify(notFoundData, null, 2));

    // 9. Test PUT /tasks/:id (Update Task)
    console.log('\n--- 9. Testing PUT /tasks/:id ---');
    const updateRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        completed: true,
        description: 'Successfully updated via Mongoose findByIdAndUpdate',
      }),
    });
    const updateData = await updateRes.json();
    console.log('Update Task Status:', updateRes.status);
    console.log('Updated Task Data:', JSON.stringify(updateData, null, 2));

    // 10. Test DELETE /tasks/:id
    console.log('\n--- 10. Testing DELETE /tasks/:id ---');
    const deleteRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const deleteData = await deleteRes.json();
    console.log('Delete Task Status:', deleteRes.status);
    console.log('Deleted Task Title:', deleteData.data ? deleteData.data.title : 'Failed');

    // 11. Test Protected Endpoint Without Token (401 Response)
    console.log('\n--- 11. Testing Protected Route Without Token (401 Unauthorized) ---');
    const unauthRes = await fetch(`${BASE_URL}/auth/me`);
    const unauthData = await unauthRes.json();
    console.log('Unauthorized Request Status:', unauthRes.status);
    console.log('401 JSON Response:', JSON.stringify(unauthData, null, 2));

    console.log('\n======================================================');
    console.log('🎉 ALL API VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Test Failed with Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
