import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react';
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
      <section className="auth-shell">
        <aside className="auth-brand">
          <div className="auth-brand__badge">
            <ShoppingBag size={16} />
            <span>Reseller</span>
          </div>
          <h1 className="auth-brand__title">Start selling products and services in minutes.</h1>
          <p className="auth-brand__subtitle">Build trust with buyers and manage your storefront from one professional dashboard.</p>
          <div className="auth-brand__point">
            <ShieldCheck size={16} />
            <span>Secure account creation with protected data</span>
          </div>
        </aside>

        <form className="auth-card auth-card--pro" onSubmit={onSubmit}>
          <div className="auth-card__header">
            <p className="auth-card__eyebrow">Join Reseller</p>
            <h2 className="auth-card__title">Create your account</h2>
            <p className="auth-card__subtitle">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>

        {error && <div className="error-banner">{msg}</div>}
          <div className="field">
            <label htmlFor="name">Name</label>
            <div className="field-with-icon">
              <UserRound className="field-with-icon__icon" size={16} />
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="field-with-icon">
              <Mail className="field-with-icon__icon" size={16} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
            <span>{submitting ? 'Creating account...' : 'Create account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}
