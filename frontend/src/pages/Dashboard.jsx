import { useEffect, useMemo, useState } from 'react';

import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import { taskApi } from '../api/taskApi';

function parseApiError(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [toast, setToast] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => {
    const c = { total: meta.total || 0, pending: 0, in_progress: 0, done: 0 };
    for (const t of tasks) c[t.status] = (c[t.status] || 0) + 1;
    return c;
  }, [meta.total, tasks]);

  async function load(page = 1) {
    setLoading(true);
    try {
      const params = {
        page,
        limit: meta.limit,
        ...(filterStatus ? { status: filterStatus } : null),
        ...(filterPriority ? { priority: filterPriority } : null),
        ...(search.trim() ? { search: search.trim() } : null),
      };
      const res = await taskApi.listTasks(params);
      const payload = res?.data?.data || res?.data;
      const m = res?.data?.meta || payload?.meta || res?.data?.data?.meta;
      setTasks(payload);
      setMeta(m || { page, limit: meta.limit, total: payload?.length || 0, totalPages: 1 });
    } catch (err) {
      setToast({ variant: 'error', title: 'Error', message: parseApiError(err) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPriority]);

  useEffect(() => {
    const t = setTimeout(() => {
      load(1);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  async function submitTask(payload) {
    setSaving(true);
    try {
      if (editingTask?._id) {
        await taskApi.updateTask(editingTask._id, payload);
        setToast({ variant: 'success', title: 'Success', message: 'Task updated' });
      } else {
        await taskApi.createTask(payload);
        setToast({ variant: 'success', title: 'Success', message: 'Task created' });
      }
      setFormOpen(false);
      setEditingTask(null);
      await load(meta.page || 1);
    } catch (err) {
      setToast({ variant: 'error', title: 'Error', message: parseApiError(err) });
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(task) {
    const ok = window.confirm('Delete this task? This cannot be undone.');
    if (!ok) return;

    try {
      await taskApi.deleteTask(task._id);
      setToast({ variant: 'success', title: 'Deleted', message: 'Task deleted' });
      await load(meta.page || 1);
    } catch (err) {
      setToast({ variant: 'error', title: 'Error', message: parseApiError(err) });
    }
  }

  const page = meta.page || 1;
  const totalPages = meta.totalPages || 1;

  return (
    <div className="app-shell">
      <Navbar onLogout={logout} />

      <main className="container">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="page-header">
          <div>
            <h2 className="page-title">Dashboard</h2>
            <div className="muted">
              {isAdmin ? 'Admin view: all tasks across users' : 'Your tasks'}
            </div>
          </div>
          <button className="btn btn--primary" onClick={openCreate}>
            + Add Task
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-card__label">Total Tasks</div>
            <div className="stat-card__value">{counts.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Pending</div>
            <div className="stat-card__value">{counts.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">In Progress</div>
            <div className="stat-card__value">{counts.in_progress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Done</div>
            <div className="stat-card__value">{counts.done}</div>
          </div>
        </div>

        <div className="filter-bar">
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            className="select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
          />

          <button className="btn btn--secondary" onClick={() => load(1)} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="centered">
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No tasks found</div>
            <div className="muted">Try changing filters or create a new task.</div>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}

        <div className="pagination">
          <button
            className="btn btn--secondary"
            onClick={() => load(Math.max(page - 1, 1))}
            disabled={loading || page <= 1}
          >
            Previous
          </button>
          <div className="pagination__label">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
          <button
            className="btn btn--secondary"
            onClick={() => load(Math.min(page + 1, totalPages))}
            disabled={loading || page >= totalPages}
          >
            Next
          </button>
        </div>
      </main>

      {formOpen ? (
        <TaskForm
          initialTask={editingTask}
          onSubmit={submitTask}
          onCancel={() => {
            setFormOpen(false);
            setEditingTask(null);
          }}
          isSubmitting={saving}
        />
      ) : null}
    </div>
  );
}

