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
    <div className="container auth-page auth-page--clerk-only">
      <div className="auth-card auth-card--clerk-only">
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
