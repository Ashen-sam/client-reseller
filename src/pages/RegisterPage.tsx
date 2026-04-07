import { Navigate } from 'react-router-dom';
import { SignUp, useAuth } from '@clerk/clerk-react';
import { useGetMeQuery } from '../store/api';

const clerkAuthAppearance = {
  elements: {
    rootBox: 'clerk-root-box',
    card: 'clerk-card',
    footerActionLink: 'clerk-link',
    formButtonPrimary: 'clerk-primary-btn',
    socialButtonsBlockButton: 'clerk-social-btn',
  },
};

export default function RegisterPage() {
  const { isSignedIn } = useAuth();
  const { data: me, isLoading, isFetching } = useGetMeQuery();

  if (isLoading || isFetching) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (isSignedIn && me?.user) {
    return <Navigate to="/" replace />;
  }

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
        Create your account with email/password or Google via Clerk.
      </p>
      <div className="auth-card">
        <SignUp
          path="/register"
          routing="path"
          signInUrl="/login"
          forceRedirectUrl="/"
          appearance={clerkAuthAppearance}
        />
      </div>
    </div>
  );
}
