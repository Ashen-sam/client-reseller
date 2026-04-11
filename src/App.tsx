import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSessionMeQuery } from './hooks/useSessionMeQuery';
import { useAppDispatch } from './store/hooks';
import { setSession, clearAuth } from './store/authSlice';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ListingFormPage = lazy(() => import('./pages/ListingFormPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

export default function App() {
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn } = useAuth();
  const { data, isSuccess } = useSessionMeQuery();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      dispatch(clearAuth());
      return;
    }
    if (isSuccess && data?.user && data.limits) {
      dispatch(setSession({ user: data.user, limits: data.limits }));
    }
  }, [dispatch, isLoaded, isSignedIn, data, isSuccess]);

  // Never call Clerk `signOut` from API/React Query outcomes. A 401 or null `/me` (race, Mongo
  // sync, or server blip) must not revoke the browser session — that caused “logged in for a
  // second then kicked out” and repeated full redirects.

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/register/*" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader message="Loading dashboard…" />}>
                <DashboardPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader message="Loading form…" />}>
                <ListingFormPage mode="create" />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader message="Loading form…" />}>
                <ListingFormPage mode="edit" />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <Suspense fallback={<PageLoader message="Loading admin…" />}>
                <AdminPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader message="Loading profile…" />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader message="Loading billing…" />}>
                <BillingPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
