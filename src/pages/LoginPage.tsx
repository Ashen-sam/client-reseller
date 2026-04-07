import { Navigate } from 'react-router-dom';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { useGetMeQuery } from '../store/api';

export default function LoginPage() {
  const { isSignedIn } = useAuth();
  const { data: me, isLoading } = useGetMeQuery();
  if (isLoading) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (isSignedIn && me?.user) return <Navigate to="/" replace />;

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
        Secure sign in powered by Clerk.
      </p>
      <div className="auth-card">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/register"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
