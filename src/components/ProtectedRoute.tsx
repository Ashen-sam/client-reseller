import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';
import PageLoader from './PageLoader';

function syncErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const st = (error as { status: number }).status;
    if (st === 503) {
      return 'The API could not create or load your marketplace profile. Check that MongoDB is running and your Clerk user has an email.';
    }
    if (st === 401) {
      return 'The API did not accept your Clerk session. See troubleshooting below.';
    }
  }
  return 'Could not reach the API or verify your session.';
}

export default function ProtectedRoute({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { data, isLoading, isError, error } = useSessionMeQuery();

  if (!isLoaded) {
    return <PageLoader message="Loading…" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isError) {
    return (
      <div className="container" style={{ padding: '2rem', maxWidth: '40rem' }}>
        <h1 className="page-header-title" style={{ fontSize: '1.25rem' }}>
          Can’t unlock this page yet
        </h1>
        <p style={{ marginTop: '0.75rem', color: 'var(--color-text-secondary)' }}>{syncErrorMessage(error)}</p>
        <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', color: 'var(--color-text-secondary)' }}>
          <li>
            In the browser Network tab, if requests to <code>clerk.</code> or <code>clerk.com</code> fail, disable
            ad-blockers/VPN or try another network so Clerk can load — without that, no JWT is sent to your API.
          </li>
          <li>
            In <code>server/.env</code>, <code>CLERK_SECRET_KEY</code> must be from the <strong>same</strong> Clerk
            application as <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>client/.env</code>.
          </li>
          <li>
            Dev only: open{' '}
            <a href="/api/auth/clerk-debug" target="_blank" rel="noreferrer">
              /api/auth/clerk-debug
            </a>{' '}
            while logged in — it shows whether your session token reaches the API.
          </li>
        </ul>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoader message="Checking your account..." />;
  }

  if (!data?.user) {
    return <PageLoader message="Syncing your account..." />;
  }

  if (admin && data.user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
