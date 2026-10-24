# Practical 7: Authentication and Middleware Pipeline

## Objective
To implement JWT-based authentication, secure password hashing using `bcryptjs`, and input validation as part of the Express middleware pipeline.

---

## Technical Implementation Summary

### 1. User Schema & Password Hashing (`models/User.js`)
Implemented user schema with `name`, `email` (unique, lowercase, regex format validated), and `password`. Embedded pre-save hook hashing password via `bcrypt.hash(password, 10)`:

```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### 2. Authentication Endpoints (`controllers/authController.js`)
- `POST /auth/register`: Validates user input, hashes password, saves User to MongoDB, and returns 201 with signed JWT token (`expiresIn: '1h'`).
- `POST /auth/login`: Finds user by email, verifies password using `bcrypt.compare`, signs JWT token, and returns HTTP 200 JSON.
- `GET /auth/me`: Protected route returning authenticated user profile (excluding password).

### 3. JWT Authentication Middleware (`middleware/auth.js`)
Extracts token from `Authorization: Bearer <token>` header, verifies signature using `jwt.verify()`, fetches user profile, and attaches decoded payload (`req.user`) to request. Returns HTTP 401 JSON response if token is missing or invalid/expired.

```javascript
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Not authorized, token failed or expired' });
    }
  }
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Not authorized, access token missing' });
  }
};
```

### 4. Server-Side Input Validation Middleware (`middleware/validate.js`)
Enforces server-side validation rules (valid email format, password length >= 6, required title) before request reaches controller or database.

---

## Required Submission Screenshots & Verification Checklist

To complete your lab submission report for Practical 7, attach screenshots of the following 6 key test scenarios:

### Screenshot 1: User Registration (`POST /auth/register`)
- **Tool**: Postman / Thunder Client
- **URL**: `POST http://localhost:5000/auth/register`
- **Body** (JSON):
  ```json
  {
    "name": "Jane Student",
    "email": "jane.student@example.com",
    "password": "secretpassword123"
  }
  ```
- **What to Capture**: Status **201 Created**, JSON response containing `message`, `user` profile, and the signed `token`.

### Screenshot 2: User Login & JWT Token Generation (`POST /auth/login`)
- **Tool**: Postman / Thunder Client
- **URL**: `POST http://localhost:5000/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "jane.student@example.com",
    "password": "secretpassword123"
  }
  ```
- **What to Capture**: Status **200 OK** returning the signed JWT `token` string.

### Screenshot 3: Password Hashing Verification in MongoDB
- **Tool**: MongoDB Compass / Mongo Shell
- **Database / Collection**: `task_manager_api.users`
- **What to Capture**: The created user document showing the `password` field stored as a bcrypt hash (e.g., `$2a$10$...`) confirming plain-text passwords are never saved.

### Screenshot 4: Get Current User Profile (`GET /auth/me`)
- **Tool**: Postman / Thunder Client
- **URL**: `GET http://localhost:5000/auth/me`
- **Headers**: `Authorization: Bearer <your_jwt_token>`
- **What to Capture**: Status **200 OK** returning the decoded user details (excluding password).

### Screenshot 5: Protected Route Verification (HTTP 401 Unauthorized)
- **Tool**: Postman / Thunder Client
- **URL**: `GET http://localhost:5000/tasks` (Without Authorization header)
- **What to Capture**: Status **401 Unauthorized** with JSON error message: `"Not authorized, access token missing"`.

### Screenshot 6: Input Validation Failure (HTTP 400 Bad Request)
- **Tool**: Postman / Thunder Client
- **URL**: `POST http://localhost:5000/auth/register`
- **Body** (JSON):
  ```json
  {
    "name": "J",
    "email": "invalid-email-format",
    "password": "123"
  }
  ```
- **What to Capture**: Status **400 Bad Request** returning structured validation error details array.

### Screenshot 7: Full-Stack React Auth UI (Browser)
- **Tool**: Web Browser (`http://localhost:5173/tasks`)
- **What to Capture**:
  1. The Sign In / Register Modal dialog.
  2. The authenticated header showing the user avatar badge (`Jane Student`) and Logout button.

---

## Answers to Key Questions

1. **Why must passwords be hashed before storage instead of saved as plain text, even in a lab/demo project?**
   - Storing plain-text passwords exposes user credentials to database leaks, unauthorized admin access, and log leaks. Hashing with `bcryptjs` creates a one-way salt-protected cryptographic hash that cannot be reversed back into the original password.

2. **What does the authentication middleware actually verify, and what happens if the token is missing or expired?**
   - The middleware verifies the JWT cryptographic signature against `process.env.JWT_SECRET` and checks the token expiry payload (`exp`). If missing or expired, `jwt.verify()` throws an error caught by the middleware, returning HTTP 401 Unauthorized JSON before controller logic executes.

3. **Why should input validation happen on the server even if the frontend already validates the same fields?**
   - Frontend validation is solely for User Experience. Any client can bypass frontend JavaScript forms by sending raw HTTP requests using Postman, cURL, or automated tools. Server-side validation acts as the true security perimeter guarding database integrity.
