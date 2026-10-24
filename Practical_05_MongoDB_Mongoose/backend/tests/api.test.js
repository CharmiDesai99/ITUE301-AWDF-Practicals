const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Task Management API Test Suite (Practical 12 CI/CD Pipeline)', () => {
  afterAll(async () => {
    // Gracefully close Mongoose connection after tests finish
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // Test 1: Health check endpoint (Practical 4 / Baseline)
  test('1. GET / returns HTTP 200 and operational status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('API operational');
    expect(res.body.endpoints).toBeDefined();
  });

  // Test 2: Protected route middleware rejection (Practical 7)
  test('2. GET /tasks without Bearer token returns HTTP 401 Unauthorized', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // Test 3: Input validation middleware rejection (Practical 7)
  test('3. POST /auth/register with invalid data returns HTTP 400 Bad Request', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'T',
        email: 'invalid-email-address',
        password: '123', // less than 6 chars
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  // Test 4: In-memory cache statistics endpoint (Practical 9)
  test('4. GET /tasks/cache-stats returns HTTP 200 with cache metrics', async () => {
    const res = await request(app).get('/tasks/cache-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.statistics).toBeDefined();
    expect(typeof res.body.statistics.keys).toBe('number');
  });
});
