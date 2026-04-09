import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '../lib/authToken';
import { useSessionMeQuery } from '../store/api';
import PageLoader from './PageLoader';

export default function ProtectedRoute({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const location = useLocation();
  const token = getAuthToken();
  const { data, isLoading } = useSessionMeQuery();

  if (token && isLoading) {
    return <PageLoader message="Checking your account..." />;
  }

  if (!token || !data?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (admin && data.user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
