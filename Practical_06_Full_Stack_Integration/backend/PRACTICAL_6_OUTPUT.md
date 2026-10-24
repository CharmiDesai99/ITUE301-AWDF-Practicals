# Practical 6: Full Stack Integration (React + Node + MongoDB)

## Objective
To connect the React frontend (`student-portfolio`) to the Express/MongoDB backend into a fully functional full-stack application with CORS enablement, API consumption, loading/error states, and UI state synchronization.

---

## Technical Implementation Summary

### 1. CORS Configuration on Express Backend (`server.js`)
Configured `cors` middleware to allow cross-origin requests from the React development server (`http://localhost:5173`).

```javascript
const cors = require('cors');
app.use(cors());
```

### 2. Central API Service (`src/services/api.js`)
Created a central API module in React with base URL `http://localhost:5000`, request headers configuration, token injection, and 401 handling:

```javascript
const BASE_URL = 'http://localhost:5000';

export const getTasks = () => fetchAPI('/tasks');
export const createTask = (taskData) => fetchAPI('/tasks', { method: 'POST', body: JSON.stringify(taskData) });
export const updateTask = (id, taskData) => fetchAPI(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskData) });
export const deleteTask = (id) => fetchAPI(`/tasks/${id}`, { method: 'DELETE' });
```

### 3. Full-Stack State Synchronization
- **Create (POST)**: Form submission sends data to API; on HTTP 201 response, returned task is added to React state (`setTasks(prev => [newTask, ...prev])`).
- **Update (PUT)**: Toggling task completion or editing task detail calls API; on HTTP 200 response, matching item in state array is updated.
- **Delete (DELETE)**: Delete action calls API; on HTTP 200 response, item is removed from state array (`setTasks(prev => prev.filter(t => t._id !== id))`).
- **Read (GET)**: Initial fetch on component mount populates state directly from MongoDB.

### 4. User Experience Enhancements
- **Delete Confirmation Modal (`ConfirmModal.jsx`)**: Prompts confirmation popup before executing task deletion.
- **Toast Notifications (`Toast.jsx`)**: Real-time floating alert toasts showing success or failure messages.
- **Loading & Error Handling**: Skeletons and inline error banners present state during asynchronous fetch operations.

---

## Answers to Key Questions

1. **What changes are required on the backend (CORS) to allow the React dev server to call the Express API?**
   - Web browsers enforce the Same-Origin Policy. Since React runs on `localhost:5173` and Express runs on `localhost:5000`, the backend must attach `Access-Control-Allow-Origin` HTTP headers using `app.use(cors())` to permit cross-origin requests.

2. **Why should the UI re-fetch or update local state after a successful POST/PUT/DELETE rather than assuming success silently?**
   - Relying on silent assumption causes UI state divergence if backend operations fail, trigger database validation errors, or append database-generated fields (like `_id` and `createdAt`). Updating UI state on verified HTTP response ensures frontend accurately reflects true server state.

3. **What is the risk of not handling errors on write operations (POST/PUT/DELETE) the same way as read operations (GET)?**
   - If write errors are unhandled, users may believe a task was saved, edited, or deleted when it actually failed on the server. This causes silent data loss, corrupt UI state, and poor user trust.
