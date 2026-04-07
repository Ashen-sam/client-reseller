import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation, useGetMeQuery } from '../store/api';
import { useAppDispatch } from '../store/hooks';
import { setSession } from '../store/authSlice';
import { setAuthToken } from '../lib/authToken';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string; registered?: boolean } | null)?.from ?? '/';
  const { data: me, isLoading } = useGetMeQuery();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading: submitting, error }] = useLoginMutation();

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (me?.user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (res.token) setAuthToken(res.token);
      dispatch(setSession({ user: res.user, limits: res.limits }));
      navigate(from, { replace: true });
    } catch {
      /* handled below */
    }
  }

  const msg =
    error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String((error.data as { message: string }).message)
      : 'Login failed';

  return (
    <div className="container auth-page">
      <header className="page-surface page-surface--auth">
        <div className="page-surface__inner">
          <p className="page-header-eyebrow">Welcome back</p>
          <h1 className="page-header-title" style={{ fontSize: 'var(--text-2xl)' }}>
            Log in
          </h1>
          <p className="page-header-subtitle" style={{ margin: '0 auto', maxWidth: '22rem' }}>
            Access your dashboard and listings.
          </p>
        </div>
      </header>
      <p className="text-muted" style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
      <form className="auth-card" onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
        {(location.state as { registered?: boolean } | null)?.registered && (
          <div className="success-banner" role="status">
            Account created. Sign in with your email and password.
          </div>
        )}
        {error && <div className="error-banner">{msg}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
