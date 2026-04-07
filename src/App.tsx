import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGetMeQuery } from './store/api';
import { useAppDispatch } from './store/hooks';
import { setSession, clearAuth } from './store/authSlice';
import { clearAuthToken } from './lib/authToken';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ListingFormPage from './pages/ListingFormPage';
import AdminPage from './pages/AdminPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';

export default function App() {
  const dispatch = useAppDispatch();
  const { data, error, isSuccess } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (isSuccess && data?.user && data.limits) {
      dispatch(setSession({ user: data.user, limits: data.limits }));
    }
  }, [dispatch, data, isSuccess]);

  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      clearAuthToken();
      dispatch(clearAuth());
    }
  }, [dispatch, error]);

  if (!data && !error && !isSuccess) {
    return <PageLoader message="Refreshing your session..." />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <ListingFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <ProtectedRoute>
              <ListingFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
