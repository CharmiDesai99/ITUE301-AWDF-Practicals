# Practical 5: MongoDB Integration and Schema Design with Mongoose

## Objective
To connect a MongoDB database to an Express server, enforce data validation through Mongoose schema, and perform CRUD operations using Mongoose model methods.

---

## Technical Implementation Summary

### 1. Database Connection (`server.js`)
Connected Express server to MongoDB using `mongoose.connect(process.env.MONGO_URI)` with `.then()` logging `MongoDB connected` and `.catch()` handling connection failures.

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_manager_api';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed:', err.message));
```

### 2. Task Schema & Pre-Save Hook (`models/Task.js`)
Defined Mongoose schema with 5 fields, validation constraints, default values, and a `pre('save')` hook to automatically trim title whitespace:

```javascript
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high',
    },
    default: 'medium',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

taskSchema.pre('save', function trimTitle(next) {
  if (typeof this.title === 'string') {
    this.title = this.title.trim();
  }
  next();
});
```

### 3. Mongoose Model CRUD Operations (`controllers/taskController.js`)
- `Task.find()`: Retrieves all task documents sorted by creation date.
- `Task.create()`: Inserts a new validated task document into MongoDB.
- `Task.findByIdAndUpdate()`: Updates task attributes with `{ new: true, runValidators: true }`.
- `Task.findByIdAndDelete()`: Deletes task document from MongoDB.

### 4. Structured Validation Error Handling (`middleware/errorHandler.js`)
Mongoose `ValidationError` is intercepted and formatted as clean JSON (no raw Mongoose error stack traces exposed to client):

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Task title is required and cannot be blank"
    },
    {
      "field": "priority",
      "message": "Priority must be low, medium, or high"
    }
  ]
}
```

### 5. GET /tasks/:id Endpoint & 404 Response
If a requested task ID does not exist, the API returns a structured HTTP 404 response:

```json
{
  "error": "Task not found",
  "message": "Task with ID 64f1a2b3c4d5e6f7a8b9c0d1 does not exist"
}
```

---

## Answers to Key Questions

1. **What is the purpose of a schema in a NoSQL database like MongoDB, given that MongoDB itself is schema-less?**
   - While MongoDB is document-based and schema-less at the database engine level, application-level schemas defined in Mongoose bring structural consistency, data integrity, automatic type casting, and validation rules to the application layer without losing NoSQL scalability.

2. **Why is it important to define required fields and default values at the schema level rather than relying on frontend validation alone?**
   - Frontend validation can easily be bypassed by direct API tools (e.g., Postman, cURL, scripts, or malicious actors). Schema-level enforcement guarantees that invalid data can never enter the database regardless of request origin.

3. **What happens internally when a document fails Mongoose validation — where is the request stopped?**
   - Validation occurs in Node.js within the Mongoose ODM layer *before* any network call or write command is sent to MongoDB. When validation fails, Mongoose throws a `ValidationError` which is intercepted in Express error middleware (`next(err)`), halting request execution before reaching the database.
