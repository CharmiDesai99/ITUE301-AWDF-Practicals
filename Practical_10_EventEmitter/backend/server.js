const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize event-driven architecture listeners (Practical 10)
require('./listeners');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_manager_api';

// Enable CORS for frontend integration
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'API operational',
    message: 'Task Manager API with Mongoose & JWT Authentication',
    version: '1.0.0',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login', 'GET /auth/me'],
      tasks: ['GET /tasks', 'GET /tasks/:id', 'POST /tasks', 'PUT /tasks/:id', 'DELETE /tasks/:id'],
    },
  });
});

// Authentication Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Task CRUD Routes (Protected)
app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

// Test Error Handler Route
app.get('/error-test', (req, res, next) => {
  next(new Error('Testing global error handler'));
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Connect to MongoDB & Start Express Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
