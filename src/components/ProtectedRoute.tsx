import { Navigate, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '../store/api';

export default function ProtectedRoute({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const location = useLocation();
  const { data, isLoading, isFetching } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading || isFetching) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!data?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (admin && data.user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
