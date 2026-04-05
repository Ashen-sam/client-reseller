import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useRegisterMutation, useGetMeQuery } from '../store/api';
import { useAppDispatch } from '../store/hooks';
import { setSession } from '../store/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { data: me, isLoading, isFetching } = useGetMeQuery();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading: submitting, error }] = useRegisterMutation();

  if (isLoading || isFetching) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (me?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await register({ email, password, name }).unwrap();
      dispatch(setSession({ user: res.user, limits: res.limits }));
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
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
