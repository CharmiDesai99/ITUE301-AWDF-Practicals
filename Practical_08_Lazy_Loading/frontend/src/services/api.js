const BASE_URL = 'http://localhost:5000';

const getAuthToken = () => {
  return localStorage.getItem('task_app_token');
};

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('task_app_token', token);
  } else {
    localStorage.removeItem('task_app_token');
  }
};

const fetchAPI = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Clear expired or invalid token
      setAuthToken(null);
    }
    const errorMessage = data.message || data.error || 'An error occurred during request';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = data.details || null;
    throw error;
  }

  return data;
};

// Auth API endpoints
export const registerUser = (userData) => {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const loginUser = (credentials) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const getMe = () => {
  return fetchAPI('/auth/me');
};

// Task CRUD API endpoints
export const getTasks = () => {
  return fetchAPI('/tasks');
};

export const getTaskById = (id) => {
  return fetchAPI(`/tasks/${id}`);
};

export const createTask = (taskData) => {
  return fetchAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

export const updateTask = (id, taskData) => {
  return fetchAPI(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
};

export const deleteTask = (id) => {
  return fetchAPI(`/tasks/${id}`, {
    method: 'DELETE',
  });
};

export { getAuthToken, setAuthToken };
