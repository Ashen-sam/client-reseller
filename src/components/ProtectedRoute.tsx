import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useGetMeQuery } from '../store/api';

export default function ProtectedRoute({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { data, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !isSignedIn,
    refetchOnMountOrArgChange: true,
  });

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // For signed-in users, avoid redirect loops while /me is warming up.
  if (!admin && (isLoading || isFetching || !data?.user)) {
    return <>{children}</>;
  }

  if (admin && (isLoading || isFetching || !data?.user)) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Checking admin access…</p>
      </div>
    );
  }

  if (admin && data?.user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
