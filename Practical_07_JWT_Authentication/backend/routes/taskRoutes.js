const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStatsHandler,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validateTaskInput, validateContentType } = require('../middleware/validate');

// Cache Debug & Statistics Endpoint (Practical 9 Supplementary)
router.get('/cache-stats', getCacheStatsHandler);

// Protect all task routes using authentication middleware (Practical 7)
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateContentType, validateTaskInput, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(validateContentType, validateTaskInput, updateTask)
  .delete(deleteTask);

module.exports = router;
