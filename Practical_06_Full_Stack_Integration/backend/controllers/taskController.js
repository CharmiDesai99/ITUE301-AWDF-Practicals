const Task = require('../models/Task');
const { cache, getCacheStats } = require('../utils/cache');
const taskEvents = require('../events');

// Helper to determine cache key
const getTasksCacheKey = (req) => {
  return req.user ? `tasks_user_${req.user._id}` : 'all_tasks';
};

// @desc    Get all tasks (with In-Memory Caching - Practical 9)
// @route   GET /tasks
// @access  Protected (Practical 7)
const getTasks = async (req, res, next) => {
  try {
    const cacheKey = getTasksCacheKey(req);

    // 1. Check in-memory cache first (Practical 9)
    const cachedTasks = cache.get(cacheKey);
    if (cachedTasks) {
      return res.status(200).json({
        message: 'Tasks fetched successfully (from In-Memory Cache)',
        source: 'cache',
        count: cachedTasks.length,
        data: cachedTasks,
      });
    }

    // 2. Cache miss: Query MongoDB database
    const filter = req.user ? { user: req.user._id } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    // 3. Store result in cache with 60s TTL
    cache.set(cacheKey, tasks);

    res.status(200).json({
      message: 'Tasks fetched successfully (from MongoDB Database)',
      source: 'database',
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID (with In-Memory Caching - Practical 9)
// @route   GET /tasks/:id
// @access  Protected (Practical 7)
const getTaskById = async (req, res, next) => {
  try {
    const singleCacheKey = `task_${req.params.id}`;

    // Check single-task cache
    const cachedTask = cache.get(singleCacheKey);
    if (cachedTask) {
      return res.status(200).json({
        message: 'Task fetched successfully (from In-Memory Cache)',
        source: 'cache',
        data: cachedTask,
      });
    }

    const filter = req.user
      ? { _id: req.params.id, user: req.user._id }
      : { _id: req.params.id };

    const task = await Task.findOne(filter);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task with ID ${req.params.id} does not exist`,
      });
    }

    cache.set(singleCacheKey, task);

    res.status(200).json({
      message: 'Task fetched successfully (from MongoDB Database)',
      source: 'database',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task (Cache Invalidation & EventEmitter - Practical 9 & 10)
// @route   POST /tasks
// @access  Protected (Practical 7)
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const taskPayload = {
      title,
      description: description || '',
      completed: completed === true || completed === 'true',
      priority: priority || 'medium',
    };

    if (req.user) {
      taskPayload.user = req.user._id;
    }

    const task = await Task.create(taskPayload);

    // Invalidate task list cache after write (Practical 9)
    const cacheKey = getTasksCacheKey(req);
    cache.del(cacheKey);

    // Demonstrate Async Event-Driven Flow (Practical 10):
    // 1. Send API response immediately
    console.log(`[API] Response sent at ${new Date().toISOString()}`);
    res.status(201).json({
      message: 'Task created successfully',
      data: task,
    });

    // 2. Emit background domain event after responding (non-blocking)
    taskEvents.emit('task-created', task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task by ID (Cache Invalidation - Practical 9)
// @route   PUT /tasks/:id
// @access  Protected (Practical 7)
const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) {
      updates.completed = completed === true || completed === 'true';
    }
    if (priority !== undefined) updates.priority = priority;

    const filter = req.user
      ? { _id: req.params.id, user: req.user._id }
      : { _id: req.params.id };

    const task = await Task.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task with ID ${req.params.id} does not exist`,
      });
    }

    // Invalidate both collection and single-task caches (Practical 9)
    cache.del(getTasksCacheKey(req));
    cache.del(`task_${req.params.id}`);

    res.status(200).json({
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task by ID (Cache Invalidation & EventEmitter - Practical 9 & 10)
// @route   DELETE /tasks/:id
// @access  Protected (Practical 7)
const deleteTask = async (req, res, next) => {
  try {
    const filter = req.user
      ? { _id: req.params.id, user: req.user._id }
      : { _id: req.params.id };

    const task = await Task.findOneAndDelete(filter);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task with ID ${req.params.id} does not exist`,
      });
    }

    // Invalidate caches (Practical 9)
    cache.del(getTasksCacheKey(req));
    cache.del(`task_${req.params.id}`);

    res.status(200).json({
      message: 'Task deleted successfully',
      data: task,
    });

    // Emit event asynchronously (Practical 10)
    taskEvents.emit('task-deleted', task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get In-Memory Cache Performance & Debug Statistics (Practical 9 Supplementary)
// @route   GET /tasks/cache-stats
// @access  Public / Protected
const getCacheStatsHandler = (req, res) => {
  res.status(200).json({
    message: 'Cache performance statistics retrieved',
    statistics: getCacheStats(),
  });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStatsHandler,
};
