# ITUE301: Advanced Web Development Frameworks (AWDF) - Practicals

**Student Name:** Charmi Desai  
**GitHub Profile:** [@CharmiDesai99](https://github.com/CharmiDesai99)  
**Subject Code:** ITUE301  
**Semester:** 5th Semester  
**Academic Year:** 2026-27  

---

## 📑 Practical Index & Implementation Matrix

| Practical # | Title & Core Objective | Technologies / Key Libraries | Practical Directory |
|---|---|---|---|
| **Practical 01** | **React Component Architecture**<br>Modular portfolio with reusable components (Header, Bio, SkillsList, ProjectCard, ContactForm). | React 18, Vite, Vanilla CSS | [`Practical_01_React_Components/`](./Practical_01_React_Components) |
| **Practical 02** | **State Management & Routing in React**<br>Multi-route navigation with React Router, dark/light theme state persistence. | React Router DOM v6, useState, useEffect | [`Practical_02_State_and_Routing/`](./Practical_02_State_and_Routing) |
| **Practical 03** | **API Integration & Data Rendering**<br>Consuming GitHub REST API asynchronously with dynamic Spinner and Error states. | Fetch API, Promises, Async/Await | [`Practical_03_API_Integration/`](./Practical_03_API_Integration) |
| **Practical 04** | **RESTful API with Node.js & Express**<br>Full in-memory CRUD operations (`GET`, `POST`, `PUT`, `DELETE`) for Task Management. | Node.js, Express, Postman | [`Practical_04_Express_REST_API/`](./Practical_04_Express_REST_API) |
| **Practical 05** | **MongoDB Integration & Schema Design**<br>Connecting Express to MongoDB via Mongoose with strict schema validation. | MongoDB, Mongoose ODM | [`Practical_05_MongoDB_Mongoose/`](./Practical_05_MongoDB_Mongoose) |
| **Practical 06** | **Full-Stack Application Integration**<br>Connecting React Frontend with Express & MongoDB Backend for real-time task CRUD. | React, Express, MongoDB, Axios/Fetch | [`Practical_06_Full_Stack_Integration/`](./Practical_06_Full_Stack_Integration) |
| **Practical 07** | **Authentication & Middleware Pipeline**<br>JWT authentication, bcrypt password hashing, input validation pipeline. | JSON Web Tokens (JWT), bcryptjs, Express Middleware | [`Practical_07_JWT_Authentication/`](./Practical_07_JWT_Authentication) |
| **Practical 08** | **Performance Optimization & Lazy Loading**<br>Route-based code splitting using `React.lazy()` and `<Suspense>` fallback. | `React.lazy()`, `<Suspense>`, Vite Rollup Chunking | [`Practical_08_Lazy_Loading/`](./Practical_08_Lazy_Loading) |
| **Practical 09** | **In-Memory Caching & Query Optimization**<br>TTL-based cache layer with cache invalidation on mutations and metrics benchmark. | `node-cache`, Cache-Aside Pattern | [`Practical_09_Caching/`](./Practical_09_Caching) |
| **Practical 10** | **Event-Driven Architecture with EventEmitter**<br>Decoupled background processing for task creation, deletion, and error logging. | Node.js `EventEmitter`, Asynchronous Dispatch | [`Practical_10_EventEmitter/`](./Practical_10_EventEmitter) |
| **Practical 11** | **Containerization with Docker & Docker Compose**<br>Multi-container orchestration for frontend, backend API, and MongoDB database. | Docker, Docker Compose, Bridge Network | [`Practical_11_Docker/`](./Practical_11_Docker) |
| **Practical 12** | **Automated Testing & CI/CD Pipeline**<br>Automated API testing suite with Jest & Supertest and GitHub Actions CI workflow. | Jest, Supertest, GitHub Actions CI | [`Practical_12_CI_CD_Pipeline/`](./Practical_12_CI_CD_Pipeline) |

---

## 🚀 Live Monorepo Project Structure

In addition to individual practical folders, the repository includes the unified full-stack application:

```text
ITUE301-AWDF-Practicals/
├── student-portfolio/            # Complete Modern React Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable UI & TaskManager Components
│   │   ├── context/              # AuthContext & Theme State
│   │   ├── pages/                # Home, Projects, Contact, NotFound
│   │   └── services/             # Axios API Client
│   └── Dockerfile
├── task-manager-api/             # Complete Node/Express/MongoDB Backend Application
│   ├── controllers/              # AuthController, TaskController
│   ├── middleware/               # Auth, Validation, Error Handling
│   ├── models/                   # User, Task (Mongoose)
│   ├── tests/                    # Jest/Supertest Test Suites
│   ├── utils/                    # NodeCache In-Memory Cache Layer
│   ├── events.js                 # Node.js EventEmitter Bus
│   └── Dockerfile
├── docker-compose.yml            # Multi-container orchestration (Frontend + Backend + DB)
└── .github/workflows/ci.yml      # CI/CD Automated Test Pipeline
```

---

## 🛠️ How to Run Locally

### Option A: Using Docker Compose (Recommended)
Run the entire full-stack application (MongoDB + Express Backend + React Frontend) with one command:
```bash
docker compose up --build
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **MongoDB:** `localhost:27017`

### Option B: Running Individually

#### 1. Backend Server
```bash
cd task-manager-api
npm install
npm run dev
```

#### 2. Frontend Application
```bash
cd student-portfolio
npm install
npm run dev
```

#### 3. Run Automated Tests (Practical 12)
```bash
cd task-manager-api
npm test
```
