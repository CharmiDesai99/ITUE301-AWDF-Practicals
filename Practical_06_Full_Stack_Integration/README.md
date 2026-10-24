# Practical 6: Full Stack Integration (React + Node.js + MongoDB)

## Objective
To connect the React portfolio frontend with the Express backend to enable real-time Task Management.

## Implementation Details
- Frontend client in rontend/src/services/api.js issues HTTP requests to backend on port 5000.
- CORS configured in Express server.
- Supports creating, viewing, updating status, and deleting tasks with optimistic UI updates.

## How to Run
1. Start backend:
`ash
cd backend && npm install && npm run dev
`
2. Start frontend:
`ash
cd frontend && npm install && npm run dev
`
