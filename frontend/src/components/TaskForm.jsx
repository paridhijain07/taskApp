import { useEffect, useMemo, useState } from 'react';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function TaskForm({ initialTask, onSubmit, onCancel, isSubmitting }) {
  const isEdit = Boolean(initialTask?._id);

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState(initialTask?.status || 'pending');
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(initialTask?.title || '');
    setDescription(initialTask?.description || '');
    setStatus(initialTask?.status || 'pending');
    setPriority(initialTask?.priority || 'medium');
    setError('');
  }, [initialTask]);

  const canSubmit = useMemo(() => title.trim().length > 0 && !isSubmitting, [title, isSubmitting]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (title.trim().length === 0) {
      setError('Title is required');
      return;
    }

    onSubmit?.({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__header">
          <div className="modal__title">{isEdit ? 'Edit Task' : 'Add Task'}</div>
          <button className="icon-btn" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <div className="field__label">Title *</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Task title"
            />
          </label>

          <label className="field">
            <div className="field__label">Description</div>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Optional details"
              rows={4}
            />
          </label>

          <div className="grid-2">
            <label className="field">
              <div className="field__label">Status</div>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <div className="field__label">Priority</div>
              <select
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {priorityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <div className="inline-error">{error}</div> : null}

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

