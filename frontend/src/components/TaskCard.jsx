export default function TaskCard({ task, isAdmin, onEdit, onDelete }) {
  const statusClass =
    task.status === 'pending'
      ? 'badge--pending'
      : task.status === 'in_progress'
        ? 'badge--inprogress'
        : 'badge--done';

  const priorityClass =
    task.priority === 'low'
      ? 'badge--low'
      : task.priority === 'high'
        ? 'badge--high'
        : 'badge--medium';

  return (
    <div className="card task-card">
      <div className="task-card__top">
        <div className="task-card__title">{task.title}</div>
        <div className="task-card__badges">
          <span className={`badge ${statusClass}`}>{task.status.replace('_', ' ')}</span>
          <span className={`badge ${priorityClass}`}>{task.priority}</span>
        </div>
      </div>
      {task.description ? <div className="task-card__desc">{task.description}</div> : null}
      {isAdmin && task.owner ? (
        <div className="task-card__owner">
          Owner: <strong>{task.owner.name}</strong> ({task.owner.email})
        </div>
      ) : null}
      <div className="task-card__meta">
        <div className="muted">
          Created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : '—'}
        </div>
        <div className="task-card__actions">
          <button className="btn btn--secondary" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn btn--danger" onClick={() => onDelete(task)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

