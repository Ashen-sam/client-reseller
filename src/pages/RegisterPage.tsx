import { SignUp, useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { useSessionMeQuery } from '../hooks/useSessionMeQuery';
import PageLoader from '../components/PageLoader';
import { useSeo } from '../lib/seo';

export default function RegisterPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading } = useSessionMeQuery();

  useSeo({
    title: 'Create Account',
    description: 'Create your Reseller account to start listing products and services in minutes.',
    path: '/register',
    noindex: true,
  });

  if (!isLoaded) return <PageLoader message="Loading…" />;

  if (isSignedIn && isLoading) return <PageLoader message="Preparing your session…" />;

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container auth-page">
      <section className="auth-shell">
        <aside className="auth-brand">
          <div className="auth-brand__badge">
            <ShoppingBag size={16} />
            <span>Reseller</span>
          </div>
          <h1 className="auth-brand__title">Start selling products and services in minutes.</h1>
          <p className="auth-brand__subtitle">
            Build trust with buyers and manage your storefront from one professional dashboard.
          </p>
          <div className="auth-brand__point">
            <ShieldCheck size={16} />
            <span>Secure account with Clerk (Google or email)</span>
          </div>
        </aside>

        <div className="auth-card auth-card--pro clerk-auth-card">
          <SignUp routing="path" path="/register" signInUrl="/login" />
        </div>
      </section>
    </div>
  );
}
