import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useLoginMutation, useSessionMeQuery } from '../store/api';
import { useAppDispatch } from '../store/hooks';
import { setSession } from '../store/authSlice';
import { setAuthToken } from '../lib/authToken';
import PageLoader from '../components/PageLoader';
import { SYSTEM_ADMIN_LOGIN } from '../constants/adminLogin';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string; registered?: boolean } | null)?.from ?? '/';
  const { data: me, isLoading } = useSessionMeQuery();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading: submitting, error }] = useLoginMutation();

  if (isLoading) return <PageLoader message="Preparing login..." />;

  if (me?.user) {
    const to =
      me.user.role === 'admin' && (!from || from === '/' || from === '/login') ? '/admin' : from;
    return <Navigate to={to} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (res.token) setAuthToken(res.token);
      dispatch(setSession({ user: res.user, limits: res.limits }));
      const redirectTo =
        res.user.role === 'admin' && (!from || from === '/' || from === '/login')
          ? '/admin'
          : from;
      navigate(redirectTo, { replace: true });
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
      <section className="auth-shell">
        <aside className="auth-brand">
          <div className="auth-brand__badge">
            <ShoppingBag size={16} />
            <span>Reseller</span>
          </div>
          <h1 className="auth-brand__title">Sell smarter with a trusted marketplace.</h1>
          <p className="auth-brand__subtitle">Manage listings, track views, and reach buyers with a clean dashboard experience.</p>
          <div className="auth-brand__point">
            <ShieldCheck size={16} />
            <span>Secure sign in with JWT and protected routes</span>
          </div>
        </aside>

        <form className="auth-card auth-card--pro" onSubmit={onSubmit}>
          <div className="auth-card__header">
            <p className="auth-card__eyebrow">Welcome back</p>
            <h2 className="auth-card__title">Log in to your account</h2>
            <p className="auth-card__subtitle">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </div>

          {(location.state as { registered?: boolean } | null)?.registered && (
            <div className="success-banner" role="status">
              Account created. Sign in with your email and password.
            </div>
          )}
          {error && <div className="error-banner">{msg}</div>}

          <div className="admin-login-hint" role="region" aria-label="System administrator demo login">
            <p className="admin-login-hint__title">System administrator (single account)</p>
            <p className="admin-login-hint__meta">
              Email <code>{SYSTEM_ADMIN_LOGIN.email}</code> · Password <code>{SYSTEM_ADMIN_LOGIN.password}</code>
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ marginTop: '0.5rem' }}
              onClick={() => {
                setEmail(SYSTEM_ADMIN_LOGIN.email);
                setPassword(SYSTEM_ADMIN_LOGIN.password);
              }}
            >
              Fill admin credentials
            </button>
            <p className="admin-login-hint__warn">
              Change this password in production after first login (Profile → security).
            </p>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="field-with-icon">
              <Mail className="field-with-icon__icon" size={16} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="field-with-icon">
              <Lock className="field-with-icon__icon" size={16} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="field-with-icon__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={submitting}>
            <span>{submitting ? 'Signing in...' : 'Sign in'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
      {submitting && <PageLoader message="Signing you in..." />}
    </div>
  );
}
