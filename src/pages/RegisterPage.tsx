import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useRegisterMutation, useGetMeQuery } from '../store/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { data: me, isLoading, isFetching } = useGetMeQuery();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [register, { isLoading: submitting, error }] = useRegisterMutation();

  if (isLoading || isFetching) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (me?.user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register({ email, password, name }).unwrap();
      navigate('/login', { replace: true, state: { registered: true } });
    } catch {
      /* handled */
    }
  }

  const msg =
    error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String((error.data as { message: string }).message)
      : 'Could not register';

  return (
    <div className="container auth-page">
      <header className="page-surface page-surface--auth">
        <div className="page-surface__inner">
          <p className="page-header-eyebrow">Join Reseller</p>
          <h1 className="page-header-title" style={{ fontSize: 'var(--text-2xl)' }}>
            Create account
          </h1>
          <p className="page-header-subtitle" style={{ margin: '0 auto', maxWidth: '24rem' }}>
            List products, upload photos, and connect with buyers.
          </p>
        </div>
      </header>
      <p className="text-muted" style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      <form className="auth-card" onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
        {error && <div className="error-banner">{msg}</div>}
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
