import { Navigate } from 'react-router-dom';
import { SignIn, useAuth } from '@clerk/clerk-react';

const clerkAuthAppearance = {
  elements: {
    rootBox: 'clerk-root-box',
    card: 'clerk-card',
    footerActionLink: 'clerk-link',
    formButtonPrimary: 'clerk-primary-btn',
    socialButtonsBlockButton: 'clerk-social-btn',
  },
};

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (isSignedIn) return <Navigate to="/" replace />;

  return (
    <div className="container auth-page auth-page--clerk-only">
      <div className="auth-card auth-card--clerk-only">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/register"
          forceRedirectUrl="/"
          appearance={clerkAuthAppearance}
        />
      </div>
    </div>
  );
}
