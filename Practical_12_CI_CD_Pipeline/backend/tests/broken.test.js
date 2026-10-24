const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Practical 12: Deliberately Broken Test (Failure Demonstration)', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });

  test('GET / returns 999 (DELIBERATE FAILURE ASSERTION)', async () => {
    const res = await request(app).get('/');
    // Intentionally fails with Expected: 999, Received: 200 to produce Red X
    expect(res.statusCode).toBe(999);
  });
});
