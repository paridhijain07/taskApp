import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function strengthScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const score = useMemo(() => strengthScore(password), [password]);
  const strengthLabel =
    score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';

  function validate() {
    if (name.trim().length < 3) return 'Name must be at least 3 characters';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Email must be valid';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter';
    if (!/\d/.test(password)) return 'Password must include a number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character';
    if (password !== confirm) return 'Passwords do not match';
    return '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    const result = await register(name.trim(), email.trim(), password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="muted">Register to start managing your tasks.</p>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <div className="field__label">Name</div>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label className="field">
            <div className="field__label">Email</div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
            />
          </label>

          <label className="field">
            <div className="field__label">Password</div>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              type="password"
            />
            <div className="password-strength">
              <div className="password-strength__bar">
                <div
                  className={`password-strength__fill password-strength__fill--${score}`}
                  style={{ width: `${(score / 4) * 100}%` }}
                />
              </div>
              <div className="password-strength__label">{strengthLabel}</div>
            </div>
          </label>

          <label className="field">
            <div className="field__label">Confirm Password</div>
            <input
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="********"
              type="password"
            />
          </label>

          {error ? <div className="inline-error">{error}</div> : null}

          <button className="btn btn--primary btn--full" disabled={submitting || isLoading}>
            {submitting ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

