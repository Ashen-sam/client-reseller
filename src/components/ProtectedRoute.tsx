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

  if (!isLoaded || isLoading || isFetching) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!isSignedIn || !data?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (admin && data.user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
