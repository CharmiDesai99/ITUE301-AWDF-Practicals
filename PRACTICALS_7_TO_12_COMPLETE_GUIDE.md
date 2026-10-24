# Complete Lab Report & Submission Guide: Practicals 7 to 12
**Course:** Advanced Web Development Frameworks (ITUE301)  
**Academic Year:** 2026–27 (ODD Semester)  
**Author / Student:** Charusat Student  
**Primary Source of Truth:** Official Charusat ITUE301 Practical List PDF  

---

# Table of Contents
1. [Practical 7: Authentication and Middleware Pipeline](#practical-7-authentication-and-middleware-pipeline)
2. [Practical 8: Performance Optimization and Lazy Loading in React](#practical-8-performance-optimization-and-lazy-loading-in-react)
3. [Practical 9: In-Memory Caching and Query Optimization](#practical-9-in-memory-caching-and-query-optimization)
4. [Practical 10: Asynchronous Processing with Event-Driven Architecture](#practical-10-asynchronous-processing-with-event-driven-architecture)
5. [Practical 11: Containerization with Docker and Docker Compose](#practical-11-containerization-with-docker-and-docker-compose)
6. [Practical 12: CI/CD Pipeline with GitHub Actions](#practical-12-cicd-pipeline-with-github-actions)

---

# Practical 7: Authentication and Middleware Pipeline

### 1. Objective & Problem Statement
- **Objective:** To implement JWT-based authentication, password hashing using `bcryptjs`, and input validation as part of the Express middleware pipeline.
- **Problem Statement:**
  - Add user registration and login functionality to the Task Management application.
  - Hash passwords using `bcrypt` (salt rounds: 10) before saving the `User` document to MongoDB.
  - Implement JWT token generation on successful login with an expiry of 1 hour.
  - Protect task routes using an authentication middleware (`protect`) that verifies the JWT.
  - Add server-side input validation that rejects malformed requests before reaching the database.
  - Provide a `/me` endpoint returning the logged-in user's details.

### 2. Architecture & Request Pipeline
```
[Client Request]
       │
       ▼  (Headers: Authorization: Bearer <token>)
[Auth Middleware: protect] ──► verifies JWT signature via process.env.JWT_SECRET
       │                      └── (Throws 401 if token missing or invalid/expired)
       ▼
[Validation Middleware]    ──► validates Content-Type, title, priority
       │                      └── (Throws 400 if validation fails)
       ▼
[Task Controller / Route]  ──► performs user-scoped CRUD (filter: { user: req.user._id })
       │
       ▼
[MongoDB Database]         ──► persisted securely with bcrypt-hashed passwords
```

### 3. Important Code Files & Implementations

#### File 1: `models/User.js` (User Schema & Pre-Save Bcrypt Hashing)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
  },
  { timestamps: true }
);

// Pre-save hook: Hash password with bcrypt before saving to MongoDB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered candidate password with stored bcrypt hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

#### File 2: `middleware/auth.js` (JWT Authentication Middleware)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_practical7_2026'
      );

      // Attach decoded user document (excluding password)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User belonging to this token no longer exists',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Not authorized, access token missing',
    });
  }
};

module.exports = { protect };
```

#### File 3: `controllers/authController.js` (Register, Login, & /me)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_practical7_2026',
    { expiresIn: '1h' }
  );
};

// POST /auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email address is already registered',
      });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) { next(error); }
};

// POST /auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) { next(error); }
};

// GET /auth/me
const getMe = async (req, res, next) => {
  res.status(200).json({
    message: 'User profile retrieved successfully',
    user: req.user,
  });
};
```

### 4. Required Screenshots for Practical 7
| # | Test Scenario | Method & URL | Headers / Body | Expected Output to Capture |
|---|---------------|--------------|----------------|----------------------------|
| **1** | **User Registration** | `POST http://localhost:5000/auth/register` | Body (JSON): `{"name":"Jane Student","email":"jane@example.com","password":"password123"}` | **Status 201 Created**, returns `token` and user object |
| **2** | **User Login & Token** | `POST http://localhost:5000/auth/login` | Body (JSON): `{"email":"jane@example.com","password":"password123"}` | **Status 200 OK**, returns signed JWT `token` string |
| **3** | **Bcrypt Password Hash in DB** | MongoDB Compass or Shell | Query: `db.users.find()` | Document showing `password: "$2a$10$..."` (Plain text is never stored) |
| **4** | **Protected /me Profile** | `GET http://localhost:5000/auth/me` | Header: `Authorization: Bearer <your_jwt_token>` | **Status 200 OK**, returns decoded user profile |
| **5** | **Protected Route Rejection** | `GET http://localhost:5000/tasks` | *(No Authorization header)* | **Status 401 Unauthorized**, `"Not authorized, access token missing"` |
| **6** | **Validation Middleware Failure** | `POST http://localhost:5000/auth/register` | Body: `{"name":"J","email":"bad-email","password":"123"}` | **Status 400 Bad Request**, returns structured validation error array |
| **7** | **Frontend Auth UI** | Browser: `http://localhost:5173/tasks` | Log in as Jane Student | Authenticated user badge in header with avatar & Logout button |

---

# Practical 8: Performance Optimization and Lazy Loading in React

### 1. Objective & Problem Statement
- **Objective:** To improve frontend performance using lazy loading and code splitting techniques.
- **Problem Statement:**
  - Optimize the React frontend by implementing route-based code splitting using `React.lazy()` and `<Suspense>`.
  - Apply lazy loading to routes: `Home`, `Projects`, `TaskApp`, and `Contact`.
  - Provide an elegant, accessible fallback UI (`LoadingFallback`) while chunks are loading.
  - Measure and compare bundle size and load time before and after optimization using Vite build output and DevTools Network tab.

### 2. Architecture & Code Splitting Diagram
```
[Before Optimization: Single Monolithic Bundle]
dist/assets/index-BOZ5Xi4p.js (275.85 kB) ──► Loads ALL pages upfront on first visit

[After Optimization: Route-Based Chunks]
dist/assets/index-BCbA5obU.js   (237.89 kB) ──► Entry bundle (reduced by 38 kB!)
├── Home-AZo7J6GJ.js            (2.44 kB)   ──► Downloaded ONLY when visiting '/'
├── Projects-C3anlNFo.js        (3.26 kB)   ──► Downloaded ONLY when visiting '/projects'
├── TaskApp-HkdvCA0Y.js         (31.50 kB)  ──► Downloaded ONLY when visiting '/tasks'
└── Contact-Cy5ZDZBO.js         (1.78 kB)   ──► Downloaded ONLY when visiting '/contact'
```

### 3. Important Code Files & Implementations

#### File 1: `student-portfolio/src/App.jsx`
```javascript
import { useState, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import LoadingFallback from "./components/LoadingFallback";
import { AuthProvider } from "./context/AuthContext";
import { skills } from "./data/portfolio";
import "./App.css";

// Route-based code splitting using React.lazy (Practical 8)
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const TaskApp = lazy(() => import("./components/TaskManager/TaskApp"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <AuthProvider>
      <div className={isDarkMode ? "app dark-mode" : "app"}>
        <NavBar isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />

        {/* Suspense wrapper with animated fallback during chunk loading */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home skills={skills} />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<TaskApp />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
```

#### File 2: `student-portfolio/src/components/LoadingFallback.jsx`
```javascript
export default function LoadingFallback({ message = 'Loading page...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', color: '#94a3b8' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#cbd5e1' }}>{message}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
```

### 4. Before vs After Performance Measurement Table
| Metric | Before Optimization (Single Bundle) | After Optimization (Code Splitting) | Improvement / Difference |
|---|---|---|---|
| **Main JS Bundle Size** | `275.85 kB` (gzip: `85.21 kB`) | `237.89 kB` (gzip: `76.69 kB`) | **-37.96 kB (-13.8%)** smaller initial download |
| **Route Chunks** | None (All included in main bundle) | 5 separate lazy chunks generated | Loaded on demand when route visited |
| **TaskApp Chunk** | Bundled in main | `31.50 kB` (`TaskApp-*.js`) | Defers heavy component code until `/tasks` visited |
| **Projects Chunk** | Bundled in main | `3.26 kB` (`Projects-*.js`) | Loaded only when `/projects` is visited |
| **Initial Load Time (Slow 3G)** | ~3.8 seconds | ~2.9 seconds | **~900ms faster** First Contentful Paint |

### 5. Required Screenshots for Practical 8
| # | Test Scenario | Tool | Action / Command | Expected Output to Capture |
|---|---------------|------|------------------|----------------------------|
| **1** | **Vite Build Output (Chunk List)** | Terminal | `npm run build` | Terminal displaying separate chunks: `TaskApp-*.js`, `Projects-*.js`, `Home-*.js`, `Contact-*.js`, and `index-*.js`. |
| **2** | **On-Demand Chunk Loading** | Chrome DevTools (Network Tab) | Filter by `JS`. Navigate from `/` to `/projects`, then to `/tasks` | Capture Network requests showing `Projects-*.js` and `TaskApp-*.js` loading only upon navigation. |
| **3** | **Suspense Fallback UI** | Chrome DevTools | Set Network Throttling to **Slow 3G**, click **Tasks** tab | Capture the circular blue spinner `<LoadingFallback />` rendering before the chunk finishes loading. |
| **4** | **React Component Tree** | React DevTools (Profiler/Components) | Inspect App component | Show `<Suspense>` wrapping `<Routes>` with `<Lazy>` component branches. |

---

# Practical 9: In-Memory Caching and Query Optimization

### 1. Objective & Problem Statement
- **Objective:** To implement server-side in-memory caching using `node-cache` and measure its impact on API response time.
- **Problem Statement:**
  - Add in-memory caching to `GET /tasks` with a TTL of 60 seconds using `node-cache`.
  - Invalidate the cache on write operations (`POST`, `PUT`, `DELETE`) so stale data is never served.
  - Implement single-task caching for `GET /tasks/:id`.
  - Provide a `/tasks/cache-stats` debug endpoint exposing hits, misses, and hit ratio.
  - Record and compare response times with and without caching using Postman.

### 2. Architecture & Cache Invalidation Flow
```
Client: GET /tasks
       │
       ▼
[Cache Check: node-cache]
  ├── HIT  ──► Return cached tasks immediately (RAM access ~1-5ms)
  └── MISS ──► Query MongoDB Database (Disk/I/O ~12-30ms)
                 │
                 └──► Store in node-cache (stdTTL: 60s) ──► Return response to client

Client: POST / PUT / DELETE /tasks
       │
       ▼
[Write to MongoDB Database]
       │
       ▼
[Cache Invalidation: cache.del('tasks_user_<id>')] ──► Stale cache purged immediately!
```

### 3. Important Code Files & Implementations

#### File 1: `task-manager-api/utils/cache.js`
```javascript
const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 60,       // 60-second TTL as per syllabus
  checkperiod: 120, // Automatic expired key cleanup every 120s
  useClones: false,
});

let cacheHits = 0;
let cacheMisses = 0;

cache.on('hit', (key) => { cacheHits++; });
cache.on('miss', (key) => { cacheMisses++; });

const getCacheStats = () => {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    keys: cache.keys().length,
    cachedKeys: cache.keys(),
    hitRatio: cacheHits + cacheMisses > 0
      ? `${((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1)}%`
      : '0%',
  };
};

module.exports = { cache, getCacheStats };
```

#### File 2: `task-manager-api/controllers/taskController.js` (Cache Check & Invalidation)
```javascript
const { cache, getCacheStats } = require('../utils/cache');

const getTasks = async (req, res, next) => {
  try {
    const cacheKey = req.user ? `tasks_user_${req.user._id}` : 'all_tasks';

    // 1. Check in-memory cache
    const cachedTasks = cache.get(cacheKey);
    if (cachedTasks) {
      return res.status(200).json({
        message: 'Tasks fetched successfully (from In-Memory Cache)',
        source: 'cache',
        count: cachedTasks.length,
        data: cachedTasks,
      });
    }

    // 2. Fetch from MongoDB on cache miss
    const filter = req.user ? { user: req.user._id } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    // 3. Store in cache
    cache.set(cacheKey, tasks);

    res.status(200).json({
      message: 'Tasks fetched successfully (from MongoDB Database)',
      source: 'database',
      count: tasks.length,
      data: tasks,
    });
  } catch (error) { next(error); }
};

// Inside createTask, updateTask, and deleteTask:
cache.del(cacheKey); // Invalidate cache key after any write operation!
```

### 4. Measured Response Time Comparison Table
| Request Sample | Condition | Data Source | Response Time (Postman) | Performance Gain |
|---|---|---|---|---|
| **Sample 1** | Uncached (Initial Miss) | MongoDB Database | **12.48 ms** | Baseline |
| **Sample 2** | Cached (1st Hit) | node-cache (RAM) | **6.25 ms** | **~50% faster** |
| **Sample 3** | Cached (2nd Hit) | node-cache (RAM) | **6.34 ms** | **~49% faster** |
| **Sample 4** | Cached (3rd Hit) | node-cache (RAM) | **5.08 ms** | **~59% faster** |

### 5. Required Screenshots for Practical 9
| # | Test Scenario | Method & URL | Headers | Expected Output to Capture |
|---|---------------|--------------|---------|----------------------------|
| **1** | **Initial Request (Cache Miss)** | `GET http://localhost:5000/tasks` | `Authorization: Bearer <token>` | `source: "database"`, response time: **~12-25 ms** |
| **2** | **Repeated Request (Cache Hit)** | `GET http://localhost:5000/tasks` | `Authorization: Bearer <token>` | `source: "cache"`, response time: **~3-6 ms** (Highlight reduced Time) |
| **3** | **Cache Stats Debug Endpoint** | `GET http://localhost:5000/tasks/cache-stats` | None | Status 200 OK showing `hits`, `misses`, `hitRatio`, and active `cachedKeys` |
| **4** | **Cache Invalidation Verification** | `PUT http://localhost:5000/tasks/:id` then `GET /tasks` | `Authorization: Bearer <token>` | Post-PUT GET response showing `source: "database"` confirming the cache was invalidated |

---

# Practical 10: Asynchronous Processing with Event-Driven Architecture

### 1. Objective & Problem Statement
- **Objective:** To implement asynchronous background processing using Node.js native `EventEmitter` without external dependencies.
- **Problem Statement:**
  - Add a background notification system using Node.js built-in `EventEmitter`.
  - When a new task is created (`POST /tasks`), emit a `task-created` event handled asynchronously.
  - The event listener must process the notification without blocking the main HTTP response.
  - Demonstrate timestamp ordering: the API response timestamp must appear **before** the event handler finishes.
  - Implement `task-deleted` and error listeners as supplementary tasks.

### 2. Architecture & Event Flow Diagram
```
Client: POST /tasks
       │
       ▼
Save task to MongoDB
       │
       ├──► Console: "[API] Response sent at 14:34:43.670Z"
       ├──► res.status(201).json(task) ──► HTTP 201 returned to client instantly!
       │
       └──► taskEvents.emit('task-created', task)  [Decoupled Async Emission]
                   │
                   ▼
       [Notification Listener (listeners.js)]
       ├── logs: "[Notification Handler] Task registered at 14:34:43.671Z"
       └── background worker finishes at 14:34:44.072Z (400ms later, non-blocking)
```

### 3. Important Code Files & Implementations

#### File 1: `task-manager-api/events.js`
```javascript
const EventEmitter = require('events');

class TaskEvents extends EventEmitter {}
const taskEvents = new TaskEvents();

module.exports = taskEvents;
```

#### File 2: `task-manager-api/listeners.js`
```javascript
const taskEvents = require('./events');

taskEvents.on('task-created', (task) => {
  console.log(`[Notification Handler] Task "${task.title}" (ID: ${task._id}) registered at ${new Date().toISOString()}`);

  // Simulated non-blocking async worker (e.g., dispatching email notification)
  setTimeout(() => {
    console.log(`[Notification Worker] Background email dispatch finished for "${task.title}" at ${new Date().toISOString()}`);
  }, 400);
});

taskEvents.on('task-deleted', (task) => {
  console.log(`[Notification Handler] Task "${task.title || task._id}" permanently deleted at ${new Date().toISOString()}`);
});

taskEvents.on('error', (err) => {
  console.error(`[Event Error] Unhandled event error caught: ${err.message}`);
});
```

#### File 3: `task-manager-api/controllers/taskController.js` (Non-Blocking Emission)
```javascript
const taskEvents = require('../events');

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create(taskPayload);

    // 1. Return API response first
    console.log(`[API] Response sent at ${new Date().toISOString()}`);
    res.status(201).json({ message: 'Task created successfully', data: task });

    // 2. Emit event after response is sent (non-blocking)
    taskEvents.emit('task-created', task);
  } catch (error) { next(error); }
};
```

### 4. Timestamp Proof Evidence from Server Console
```
[API] Response sent at 2026-10-24T14:34:43.670Z
[Notification Handler] Task "Practical 9 Benchmark Task" (ID: 6adcc20301f8c59e5586e355) registered at 2026-10-24T14:34:43.671Z
[Notification Worker] Background email dispatch finished for "Practical 9 Benchmark Task" at 2026-10-24T14:34:44.072Z
```
*Proof Analysis:* The HTTP client received the 201 response at `14:34:43.670Z`. The notification worker completed 402ms later at `14:34:44.072Z`, proving the request-response cycle was never blocked!

### 5. Required Screenshots for Practical 10
| # | Test Scenario | Tool | Command / URL | Expected Output to Capture |
|---|---------------|------|---------------|----------------------------|
| **1** | **Instant API 201 Response** | Postman | `POST http://localhost:5000/tasks` | Status **201 Created** returned immediately with created task data. |
| **2** | **Timestamp Ordering in Console** | Terminal | Node/Express server terminal output | Highlight `[API] Response sent at ...` timestamp appearing **before** `[Notification Worker] Background email dispatch finished at ...`. |
| **3** | **Task Deletion Event** | Terminal / Postman | `DELETE http://localhost:5000/tasks/:id` | Console displaying: `[Notification Handler] Task "..." permanently deleted`. |

---

# Practical 11: Containerization with Docker and Docker Compose

### 1. Objective & Problem Statement
- **Objective:** To containerize the full-stack application using Docker and orchestrate services using Docker Compose.
- **Problem Statement:**
  - Write a `Dockerfile` for the React frontend (`student-portfolio`).
  - Write a `Dockerfile` for the Node/Express backend (`task-manager-api`).
  - Write a `docker-compose.yml` file orchestrating all 3 services: frontend, backend, and MongoDB.
  - Configure port mappings and an internal bridge network (`app-network`).
  - Run the entire multi-container stack with a single command: `docker-compose up --build`.

### 2. Architecture & Container Orchestration Diagram
```
docker-compose.yml
├── frontend (React, build & serve preview, port 5173:5173)
├── backend  (Node/Express API, port 5000:5000, MONGO_URI=mongodb://mongodb:27017/task_manager_api)
└── mongodb  (Official MongoDB image, port 27017:27017, volume: mongo-data:/data/db)

Internal Network: app-network (bridge)
frontend ──► backend ──► mongodb
```

### 3. Important Code Files & Implementations

#### File 1: `task-manager-api/Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### File 2: `student-portfolio/Dockerfile`
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host"]
```

#### File 3: `docker-compose.yml` (Project Root)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./student-portfolio
      dockerfile: Dockerfile
    container_name: awf-frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build:
      context: ./task-manager-api
      dockerfile: Dockerfile
    container_name: awf-backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/task_manager_api
      - JWT_SECRET=super_secret_jwt_key_practical7_2026
      - NODE_ENV=production
    depends_on:
      - mongodb
    networks:
      - app-network
    restart: unless-stopped

  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
    driver: local
```

### 4. Required Screenshots for Practical 11
| # | Test Scenario | Tool | Command / Action | Expected Output to Capture |
|---|---------------|------|------------------|----------------------------|
| **1** | **Docker Compose Build & Run** | Terminal | `docker-compose up --build` | Terminal logs showing all 3 images built and containers starting up together. |
| **2** | **Container Status (`docker ps`)** | Terminal | `docker ps` | Table displaying 3 active containers: `awf-frontend` (port 5173), `awf-backend` (port 5000), `mongodb` (port 27017) with status `Up`. |
| **3** | **Containerized Web App** | Browser | Navigate to `http://localhost:5173` | Browser displaying the Task Management application running from within the Docker container. |

---

# Practical 12: CI/CD Pipeline with GitHub Actions

### 1. Objective & Problem Statement
- **Objective:** To automate testing and deployment of the application using a CI/CD pipeline.
- **Problem Statement:**
  - Install testing libraries (`jest`, `supertest`) in the backend project.
  - Write automated tests verifying API endpoints.
  - Set up a GitHub Actions workflow (`.github/workflows/ci.yml`) triggering on pushes to `main`.
  - The pipeline must install dependencies (`npm install`) and run tests (`npm test`).
  - Demonstrate both a failed pipeline (caused by a deliberately broken test) and a fixed passing pipeline.

### 2. Architecture & CI/CD Pipeline Flow
```
git push origin main
       │
       ▼
[GitHub Actions Trigger (on: push)]
       │
       ▼
[Runner: ubuntu-latest]
├── 1. Service Container: MongoDB (mongo:latest on port 27017)
├── 2. Checkout Repository Code (actions/checkout@v4)
├── 3. Setup Node.js Runtime (actions/setup-node@v4, node-version: 18)
├── 4. Install Dependencies (npm install)
└── 5. Run Automated Test Suite (npm test)
       ├── Failed Test ──► ❌ Red X on GitHub (Pipeline Fails)
       └── Passed Test ──► ✅ Green Checkmark on GitHub (Pipeline Passes)
```

### 3. Important Code Files & Implementations

#### File 1: `task-manager-api/tests/api.test.js` (Automated Test Suite)
```javascript
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Task Management API Test Suite (Practical 12 CI/CD Pipeline)', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // Test 1: Root Health Check
  test('1. GET / returns HTTP 200 and operational status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('API operational');
  });

  // Test 2: Auth Middleware Rejection (401)
  test('2. GET /tasks without Bearer token returns HTTP 401 Unauthorized', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  // Test 3: Input Validation Middleware Rejection (400)
  test('3. POST /auth/register with invalid data returns HTTP 400 Bad Request', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'T',
      email: 'invalid-email',
      password: '123',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  // Test 4: Cache Statistics Endpoint (200)
  test('4. GET /tasks/cache-stats returns HTTP 200 with cache metrics', async () => {
    const res = await request(app).get('/tasks/cache-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.statistics).toBeDefined();
  });
});
```

#### File 2: `.github/workflows/ci.yml` (GitHub Actions Pipeline)
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build-and-test:
    name: Build & Test Task Management API
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017

    steps:
      - name: Checkout Repository Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: 'task-manager-api/package-lock.json'

      - name: Install Dependencies
        working-directory: ./task-manager-api
        run: npm install

      - name: Run Automated Test Suite
        working-directory: ./task-manager-api
        env:
          PORT: 5000
          MONGO_URI: mongodb://localhost:27017/task_manager_api_test
          JWT_SECRET: super_secret_jwt_key_practical7_2026
          NODE_ENV: test
        run: npm test
```

### 4. How to Demonstrate Failed and Passed Pipeline Runs

#### Step A: Demonstrating a Failed Pipeline (Red 'X')
1. In `task-manager-api/tests/api.test.js`, deliberately change line 15:
   ```javascript
   // Change expect(res.statusCode).toBe(200);
   // to:
   expect(res.statusCode).toBe(500); // Deliberately failing assertion!
   ```
2. Commit and push:
   ```bash
   git add task-manager-api/tests/api.test.js
   git commit -m "test: demonstrate deliberate pipeline failure (Practical 12)"
   git push origin main
   ```
3. Open GitHub repository ──► Click **Actions** tab ──► You will see a **Red 'X'** indicating the pipeline failed on the `Run Automated Test Suite` step with `Expected: 500, Received: 200`. Capture this screenshot!

#### Step B: Demonstrating a Fixed Passing Pipeline (Green '✓')
1. Correct line 15 back to `expect(res.statusCode).toBe(200);`.
2. Commit and push:
   ```bash
   git add task-manager-api/tests/api.test.js
   git commit -m "fix: correct test assertion to restore green CI pipeline (Practical 12)"
   git push origin main
   ```
3. In the GitHub **Actions** tab, the pipeline will rerun and show a **Green checkmark '✓'** indicating all steps passed! Capture this screenshot!

### 5. Required Screenshots for Practical 12
| # | Test Scenario | Tool | Location / View | Expected Output to Capture |
|---|---------------|------|-----------------|----------------------------|
| **1** | **Local Jest Test Execution** | Terminal | `npm test` in `task-manager-api` | Terminal displaying `PASS tests/api.test.js` with `4 passed, 4 total`. |
| **2** | **Failed CI Pipeline (Red 'X')** | Browser (GitHub Actions Tab) | `https://github.com/<user>/<repo>/actions` | Pipeline run showing red 'X' and log displaying `Expected: 500, Received: 200`. |
| **3** | **Passing CI Pipeline (Green '✓')** | Browser (GitHub Actions Tab) | `https://github.com/<user>/<repo>/actions` | Pipeline run showing green checkmark '✓' with all jobs (`Checkout`, `Setup Node`, `npm install`, `npm test`) completed. |

---

# Comprehensive Viva & Evaluation Questions (Practicals 7 to 12)

### Practical 7
1. **Why must passwords be hashed with bcrypt rather than SHA-256 or MD5?**
   - SHA-256 and MD5 are general-purpose hash functions designed to be fast, making them vulnerable to brute-force and GPU rainbow table attacks. `bcrypt` incorporates an adaptive work factor (salt rounds) that is intentionally slow and automatically includes a unique salt per password, preventing precomputed dictionary attacks.
2. **What does the authentication middleware actually verify, and what happens if the token is expired?**
   - The middleware verifies the JWT header and payload against the server's secret key (`JWT_SECRET`) using HMAC-SHA256 and inspects the `exp` timestamp. If expired, `jwt.verify()` throws a `TokenExpiredError`, caught by the middleware try/catch block, which returns HTTP 401 Unauthorized before any controller executes.
3. **Why must input validation happen on the server even if the client already validates?**
   - Client-side validation is easily bypassed using tools like Postman, curl, or custom HTTP scripts. Server-side validation is the true defensive perimeter guarding database schema integrity and application security.

### Practical 8
1. **What is the difference between an initial bundle and a lazy-loaded chunk?**
   - The initial bundle contains the critical JavaScript code needed to boot the application and render the first page. A lazy-loaded chunk is an isolated JavaScript file downloaded over the network only when the user navigates to the specific route that requires it.
2. **Why does lazy loading improve perceived performance?**
   - It reduces the size of the initial JavaScript bundle that the browser must download, parse, and execute on first visit, resulting in a substantially faster First Contentful Paint (FCP) and Time to Interactive (TTI).

### Practical 9
1. **Why must cache be invalidated on write operations?**
   - If the cache is not invalidated on `POST`, `PUT`, or `DELETE`, subsequent `GET` requests will continue serving stale data from RAM until the TTL expires, leading to data inconsistency.
2. **Why is in-memory caching (`node-cache`) not suitable for multi-server deployments?**
   - `node-cache` stores data in the local memory heap of a single Node.js process. In a multi-server or clustered deployment, writes to one server would not invalidate cache on other servers, resulting in cache divergence. A distributed in-memory cache like Redis or Memcached is required for multi-instance architectures.

### Practical 10
1. **Why does emitting an event not block the API response?**
   - `taskEvents.emit()` triggers event handlers synchronously or dispatches callbacks onto the Node.js event loop. Because `res.status(201).json(task)` sends the HTTP response payload to the socket immediately, the client connection is resolved before lengthy side-effects (like simulated email sending via `setTimeout`) finish executing.
2. **What is the key limitation of `EventEmitter` in large-scale production?**
   - `EventEmitter` is process-local and in-memory. If the Node.js process crashes, all pending events are lost. Production systems use durable message brokers like RabbitMQ, Apache Kafka, or Redis Streams to guarantee message persistence and horizontal scaling.

### Practical 11
1. **Why does the backend container reference MongoDB by service name (`mongodb`) instead of `localhost`?**
   - In Docker, each container has its own isolated network namespace with its own `localhost` (127.0.0.1). Docker Compose creates an internal bridge network with built-in DNS that resolves service names (e.g., `mongodb`) to the IP address of that specific container.
2. **What is the purpose of Docker named volumes?**
   - Containers are ephemeral; any files written inside a container are deleted when the container is removed. Named volumes (e.g. `mongo-data`) persist database storage on the host filesystem independently of the container lifecycle.

### Practical 12
1. **What is the difference between Continuous Integration (CI) and Continuous Deployment (CD)?**
   - Continuous Integration (CI) automatically builds, lints, and tests code changes on every commit or pull request to detect bugs early. Continuous Deployment (CD) automatically deploys the tested code to staging or production environments without manual intervention. Practical 12 demonstrates the CI portion.
2. **Why do we run automated tests in a GitHub Actions pipeline?**
   - Running tests in a clean, isolated virtual environment ensures that the application runs reliably regardless of local developer machine configurations, catching regressions before code is merged into `main`.
