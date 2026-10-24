import { useState } from 'react';
import { CheckCircle2, Circle, Edit3, Trash2, Search, Filter, Calendar } from 'lucide-react';

export default function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDeleteRequest,
  isLoading,
}) {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      return matchTitle || matchDesc;
    }

    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return { label: 'High', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'medium':
        return { label: 'Medium', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'low':
      default:
        return { label: 'Low', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  return (
    <div>
      {/* Search & Filter Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '8px' }}>
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === tab ? '#3b82f6' : 'transparent',
                color: filter === tab ? '#ffffff' : '#94a3b8',
                fontWeight: filter === tab ? '600' : '400',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Priority Filter & Search Input */}
        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '260px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={15} style={{ position: 'absolute', left: '10px', color: '#64748b' }} />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '8px 12px 8px 30px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && tasks.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '80px',
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTasks.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            border: '1px border-dashed rgba(255, 255, 255, 0.1)',
            color: '#64748b',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#94a3b8', fontWeight: '500' }}>
            No tasks found
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            {tasks.length === 0
              ? "You haven't created any tasks yet. Click 'Create Task' to get started!"
              : 'Try clearing your search or status filters.'}
          </p>
        </div>
      )}

      {/* Task List Grid / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.map((task) => {
          const badge = getPriorityBadge(task.priority);
          return (
            <div
              key={task._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                backgroundColor: task.completed ? 'rgba(30, 41, 59, 0.6)' : '#1e293b',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                opacity: task.completed ? 0.75 : 1,
              }}
            >
              {/* Checkbox & Title Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, paddingRight: '16px' }}>
                <button
                  type="button"
                  onClick={() => onToggleComplete(task)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: task.completed ? '#10b981' : '#64748b',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: task.completed ? '#94a3b8' : '#f8fafc',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>

                    {/* Priority Badge */}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {task.description && (
                    <p
                      style={{
                        margin: '6px 0 0 0',
                        fontSize: '0.88rem',
                        color: '#94a3b8',
                        lineHeight: '1.4',
                      }}
                    >
                      {task.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#64748b', fontSize: '0.78rem' }}>
                    <Calendar size={12} />
                    <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  title="Edit Task"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: '#334155',
                    color: '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <Edit3 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteRequest(task)}
                  title="Delete Task"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
