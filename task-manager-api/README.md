# Full-Stack Task Management API & Application

A complete full-stack Node.js + Express + MongoDB (Mongoose) + React application covering **Practical 5**, **Practical 6**, and **Practical 7**.

---

## Features Implemented

- **MongoDB & Mongoose Integration (Practical 5)**:
  - Validated Mongoose Schema (`title`, `description`, `completed`, `priority`, `createdAt`, `user`).
  - Pre-save title whitespace trimming hook.
  - CRUD operations using Mongoose model methods (`Task.find()`, `Task.create()`, `Task.findByIdAndUpdate()`, `Task.findByIdAndDelete()`).
  - Clean structured JSON validation error responses (no raw stack traces).
  - GET `/tasks/:id` returning 404 JSON response if ID does not exist.

- **Full-Stack Integration (Practical 6)**:
  - CORS middleware enabled on Express backend (`localhost:5000`).
  - React Task UI with real-time state synchronization.
  - Task deletion confirmation modal (`ConfirmModal.jsx`).
  - Floating toast notification banner (`Toast.jsx`).
  - Data persistence confirmed in MongoDB across browser reloads.

- **Authentication & Middleware Pipeline (Practical 7)**:
  - User registration & login with password hashing via `bcryptjs`.
  - JWT token generation with 1-hour expiry.
  - `protect` authentication middleware verifying `Authorization: Bearer <token>` header.
  - Server-side input validation middleware (`validate.js`).
  - GET `/auth/me` profile endpoint.
  - User-isolated task management in MongoDB.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/task_manager_api` (or Atlas connection string)

### 1. Run Express Backend (`task-manager-api`)
```bash
cd task-manager-api
npm install
npm start
```
*Backend server runs on port `5000`.*

To run the automated API verification test suite:
```bash
node test-api.js
```

### 2. Run React Frontend (`student-portfolio`)
```bash
cd student-portfolio
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:5173/tasks`.*

---

## Environment Variables (.env)

Ensure `.env` exists in `task-manager-api`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task_manager_api
JWT_SECRET=super_secret_jwt_key_practical7_2026
```

---

## Postman Deliverables
The repository includes `task-manager-api.postman_collection.json` with pre-configured requests for Auth (`Register`, `Login`, `Get Profile`) and protected Task CRUD operations.
