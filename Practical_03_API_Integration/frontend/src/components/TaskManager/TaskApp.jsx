import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../../services/api';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import HeaderUserMenu from './HeaderUserMenu';
import AuthModal from './AuthModal';

export default function TaskApp() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal States
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchTaskData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message);
      setError(err.message || 'Failed to load tasks from server');
      triggerToast(err.message || 'Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskData();
  }, [fetchTaskData, user]);

  // Task Create / Update Handler
  const handleTaskSubmit = async (taskPayload) => {
    setIsFormSubmitting(true);
    try {
      if (taskToEdit) {
        // Update task via PUT /tasks/:id
        const response = await updateTask(taskToEdit._id, taskPayload);
        const updatedTask = response.data;

        // Synchronize local UI state
        setTasks((prev) =>
          prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );

        triggerToast('Task updated successfully!', 'success');
      } else {
        // Create new task via POST /tasks
        const response = await createTask(taskPayload);
        const newTask = response.data;

        // Synchronize local UI state
        setTasks((prev) => [newTask, ...prev]);

        triggerToast('Task created successfully!', 'success');
      }

      setIsTaskFormOpen(false);
      setTaskToEdit(null);
    } catch (err) {
      console.error('Task operation error:', err);
      triggerToast(err.message || 'Failed to save task', 'error');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Toggle Completed Handler
  const handleToggleComplete = async (task) => {
    const updatedStatus = !task.completed;

    // Optimistic UI state update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: updatedStatus } : t))
    );

    try {
      const response = await updateTask(task._id, { completed: updatedStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === response.data._id ? response.data : t))
      );
      triggerToast(
        updatedStatus ? 'Task marked as completed!' : 'Task marked as pending!',
        'success'
      );
    } catch (err) {
      // Revert state on failure
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed: task.completed } : t))
      );
      triggerToast(err.message || 'Failed to update task status', 'error');
    }
  };

  // Task Delete Handler
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);

    try {
      await deleteTask(taskToDelete._id);

      // Synchronize local state
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));

      triggerToast('Task deleted successfully!', 'success');
      setTaskToDelete(null);
    } catch (err) {
      triggerToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateModal = () => {
    setTaskToEdit(null);
    setIsTaskFormOpen(true);
  };

  const openEditModal = (task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        paddingBottom: '48px',
      }}
    >
      {/* Toast Banner */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Main Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Header Bar */}
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingBottom: '24px',
            marginBottom: '32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Database size={28} style={{ color: '#3b82f6' }} />
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', tracking: '-0.5px' }}>
                Task Manager <span style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: '600' }}>Mongoose & JWT</span>
              </h1>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.92rem' }}>
              Practicals 5, 6 & 7 — MongoDB Mongoose Validation, Full-Stack React Integration, & Auth Pipeline
            </p>
          </div>

          <HeaderUserMenu onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        </header>

        {/* Full-Stack Status & Integration Banner */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            marginBottom: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '0.82rem',
                fontWeight: '600',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              MongoDB Connected (localhost:5000)
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {user
                ? `Logged in as ${user.name} • Private Tasks (Practical 7)`
                : 'Full-Stack CRUD Active (Practical 6) • Persisted directly in MongoDB'}
            </span>
          </div>

          {!user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Sign In / Register (Practical 7)
            </button>
          )}
        </div>

        {/* Task Management Dashboard */}
        <div>
            {/* Dashboard Action Controls */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: '700' }}>
                  My Tasks ({tasks.length})
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Persisted in MongoDB via Express API
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={fetchTaskData}
                  disabled={loading}
                  title="Reload Tasks from MongoDB"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                  Refresh
                </button>

                <button
                  onClick={openCreateModal}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <Plus size={18} />
                  Create Task
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{error}</span>
                <button
                  onClick={fetchTaskData}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Task List Component */}
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEdit={openEditModal}
              onDeleteRequest={(task) => setTaskToDelete(task)}
              isLoading={loading}
            />
          </div>

        {/* Modal Dialogs */}
        <TaskForm
          isOpen={isTaskFormOpen}
          taskToEdit={taskToEdit}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            setIsTaskFormOpen(false);
            setTaskToEdit(null);
          }}
          isLoading={isFormSubmitting}
        />

        <ConfirmModal
          isOpen={Boolean(taskToDelete)}
          title="Delete Task"
          message={`Are you sure you want to delete task "${taskToDelete?.title}"? This will permanently remove it from MongoDB.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setTaskToDelete(null)}
          isLoading={isDeleting}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(msg) => triggerToast(msg, 'success')}
        />
      </div>
    </div>
  );
}
