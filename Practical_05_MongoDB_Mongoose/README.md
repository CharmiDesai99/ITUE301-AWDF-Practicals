# Practical 5: MongoDB Integration and Schema Design with Mongoose

## Objective
To connect Express API to a MongoDB database and persist task data using Mongoose ODM.

## Implementation Details
- Connected to MongoDB using mongoose.connect().
- Designed Mongoose schema in models/Task.js with fields: 	itle, description, status, dueDate, and priority.
- Implemented real database CRUD operations replacing in-memory storage.

## How to Run
`ash
cd backend
npm install
npm run dev
`
