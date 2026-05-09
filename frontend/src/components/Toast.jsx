import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      onClose?.();
    }, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const variant = toast.variant || 'info';

  return (
    <div className={`toast toast--${variant}`} role="status" aria-live="polite">
      <div className="toast__content">
        <div className="toast__title">{toast.title || variant.toUpperCase()}</div>
        {toast.message ? <div className="toast__message">{toast.message}</div> : null}
      </div>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}

